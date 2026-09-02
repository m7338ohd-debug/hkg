import type { Transaction, StoreSettings, HomeMaintenanceEntry, FamilyIncomeEntry } from '../types';

// Multi-Device Cloud Sync Engine for Store Mobiles
const FIREBASE_RTDB_BASE = 'https://hkg-provision-store-default-rtdb.firebaseio.com/stores';
const BACKUP_KV_BASE = 'https://kvdb.io/4y9HjL3xM28Z7qW';
const SYNC_CHANNEL_NAME = 'hk_provision_store_sync_channel';

export interface CloudPayload {
  syncCode: string;
  updatedAt: number;
  settings: StoreSettings;
  transactions: Transaction[];
  homeMaintenance?: HomeMaintenanceEntry[];
  familyIncome?: FamilyIncomeEntry[];
}

export const generateShortConnectionCode = (storeName = 'STORE'): string => {
  const cleanPrefix = (storeName || 'STORE')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 5) || 'STORE';
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanPrefix}-${randomNum}`;
};

// Smart mergers so entries from all connected devices are combined without data loss
export const mergeTransactions = (local: Transaction[], remote: Transaction[]): Transaction[] => {
  const map = new Map<string, Transaction>();
  
  remote.forEach((t) => {
    if (t && t.id) map.set(t.id, t);
  });

  local.forEach((t) => {
    if (t && t.id) map.set(t.id, t);
  });

  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
};

export const mergeHomeMaintenance = (
  local: HomeMaintenanceEntry[],
  remote: HomeMaintenanceEntry[]
): HomeMaintenanceEntry[] => {
  const map = new Map<string, HomeMaintenanceEntry>();
  remote.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  local.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
};

export const mergeFamilyIncome = (
  local: FamilyIncomeEntry[],
  remote: FamilyIncomeEntry[]
): FamilyIncomeEntry[] => {
  const map = new Map<string, FamilyIncomeEntry>();
  remote.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  local.forEach((item) => {
    if (item && item.id) map.set(item.id, item);
  });
  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
};

// BroadcastChannel for instant local tab sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported');
}

export const subscribeLocalSync = (
  onRemoteUpdate: (data: { settings: StoreSettings; transactions: Transaction[] }) => void
) => {
  if (!broadcastChannel) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'SYNC_STORE_DATA' && event.data.payload) {
      onRemoteUpdate({
        settings: event.data.payload.settings,
        transactions: event.data.payload.transactions,
      });
    }
  };

  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
};

export const broadcastLocalChange = (settings: StoreSettings, transactions: Transaction[]) => {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'SYNC_STORE_DATA',
        payload: {
          settings,
          transactions,
          timestamp: Date.now(),
        },
      });
    }
  } catch (e) {
    console.error('Failed to broadcast local change', e);
  }
};

export const sanitizeSyncCode = (code: string): string => {
  const clean = (code || 'AYESHA-STORE-01').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
  return clean || 'AYESHA-STORE-01';
};

// Push live updates to Cloud (Firebase RTDB REST + KVDB backup)
export const pushToCloudSync = async (
  syncCode: string,
  settings: StoreSettings,
  transactions: Transaction[],
  homeMaintenance?: HomeMaintenanceEntry[],
  familyIncome?: FamilyIncomeEntry[]
): Promise<boolean> => {
  const code = sanitizeSyncCode(syncCode);
  broadcastLocalChange(settings, transactions);

  const payload: CloudPayload = {
    syncCode: code,
    updatedAt: Date.now(),
    settings,
    transactions,
    homeMaintenance: homeMaintenance || [],
    familyIncome: familyIncome || [],
  };

  if (!navigator.onLine) return false;

  try {
    // 1. Primary: Firebase RTDB PUT request
    const fbUrl = `${FIREBASE_RTDB_BASE}/${code}.json`;
    const fbPromise = fetch(fbUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // 2. Secondary: KVDB Backup PUT request
    const kvUrl = `${BACKUP_KV_BASE}/${code}`;
    const kvPromise = fetch(kvUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    await Promise.allSettled([fbPromise, kvPromise]);
    return true;
  } catch (e) {
    console.error('Cloud push failed', e);
    return false;
  }
};

// Pull live updates from Cloud (Firebase RTDB + KVDB fallback)
export const pullFromCloudSync = async (
  syncCode: string
): Promise<{
  settings: StoreSettings;
  transactions: Transaction[];
  homeMaintenance?: HomeMaintenanceEntry[];
  familyIncome?: FamilyIncomeEntry[];
} | null> => {
  const code = sanitizeSyncCode(syncCode);
  if (!navigator.onLine) return null;

  try {
    // 1. Try Firebase RTDB GET first
    const fbUrl = `${FIREBASE_RTDB_BASE}/${code}.json`;
    const res = await fetch(fbUrl, {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data: CloudPayload = await res.json();
      if (data && Array.isArray(data.transactions)) {
        return {
          settings: data.settings || {},
          transactions: data.transactions,
          homeMaintenance: Array.isArray(data.homeMaintenance) ? data.homeMaintenance : [],
          familyIncome: Array.isArray(data.familyIncome) ? data.familyIncome : [],
        };
      }
    }

    // 2. Fallback to KVDB if Firebase failed
    const kvRes = await fetch(`${BACKUP_KV_BASE}/${code}`, {
      headers: { Accept: 'application/json' },
    });

    if (kvRes.ok) {
      const data: CloudPayload = await kvRes.json();
      if (data && Array.isArray(data.transactions)) {
        return {
          settings: data.settings || {},
          transactions: data.transactions,
          homeMaintenance: Array.isArray(data.homeMaintenance) ? data.homeMaintenance : [],
          familyIncome: Array.isArray(data.familyIncome) ? data.familyIncome : [],
        };
      }
    }
  } catch (e) {
    console.warn('Cloud pull network exception', e);
  }
  return null;
};

// Live EventSource SSE Listener for Instant Real-Time Push to all 4 Mobiles
export const subscribeCloudSSE = (
  syncCode: string,
  onCloudUpdate: (data: { settings?: StoreSettings; transactions: Transaction[] }) => void
) => {
  const code = (syncCode || 'AYESHA-STORE-01').trim().toUpperCase();
  if (typeof window === 'undefined' || !('EventSource' in window)) return () => {};

  let eventSource: EventSource | null = null;

  try {
    const url = `${FIREBASE_RTDB_BASE}/${code}.json`;
    eventSource = new EventSource(url);

    eventSource.addEventListener('put', (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const data = parsed.data as CloudPayload;
        if (data && Array.isArray(data.transactions)) {
          onCloudUpdate({
            settings: data.settings,
            transactions: data.transactions,
          });
        }
      } catch (err) {
        // Silent SSE parse error
      }
    });

    eventSource.onerror = () => {
      // Auto-reconnect managed by browser EventSource
    };
  } catch (err) {
    console.warn('EventSource SSE connection failed', err);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
};
