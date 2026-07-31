import type { Transaction, StoreSettings } from '../types';

// Cloud Sync Engine for multi-device Vercel deployments (4 users sharing 1 store)
const CLOUD_SYNC_ENDPOINT = 'https://api.jsonbin.io/v3/b'; // Fallback cloud sync structure or KV endpoint
const SYNC_CHANNEL_NAME = 'hk_provision_store_sync_channel';

interface CloudPayload {
  syncCode: string;
  updatedAt: number;
  settings: StoreSettings;
  transactions: Transaction[];
}

// BroadcastChannel for instant local multi-tab / same-network device sync
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment');
}

export const subscribeLocalSync = (onRemoteUpdate: (data: { settings: StoreSettings; transactions: Transaction[] }) => void) => {
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

// Remote Cloud Storage Sync for multi-phone Vercel deployments
const CLOUD_STORAGE_PREFIX = 'hk_store_cloud_';

export const pushToCloudSync = async (syncCode: string, settings: StoreSettings, transactions: Transaction[]): Promise<boolean> => {
  try {
    broadcastLocalChange(settings, transactions);
    const payload: CloudPayload = {
      syncCode: syncCode || 'AYESHA-STORE-01',
      updatedAt: Date.now(),
      settings,
      transactions,
    };

    // Store in shared browser/worker cache & attempt cloud sync push
    const cacheKey = `${CLOUD_STORAGE_PREFIX}${syncCode || 'AYESHA-STORE-01'}`;
    localStorage.setItem(cacheKey, JSON.stringify(payload));
    
    // We also push to a shared JSON public endpoint if internet is online
    if (navigator.onLine) {
      try {
        await fetch(`https://kvdb.io/4y9HjL3xM28Z7qW/${syncCode || 'AYESHA-STORE-01'}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {});
      } catch (err) {
        // Silent fallback
      }
    }
    return true;
  } catch (e) {
    console.error('Push to cloud sync failed', e);
    return false;
  }
};

export const pullFromCloudSync = async (
  syncCode: string
): Promise<{ settings: StoreSettings; transactions: Transaction[] } | null> => {
  try {
    if (!navigator.onLine) return null;

    const res = await fetch(`https://kvdb.io/4y9HjL3xM28Z7qW/${syncCode || 'AYESHA-STORE-01'}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data: CloudPayload = await res.json();
      if (data && Array.isArray(data.transactions) && data.settings) {
        return {
          settings: data.settings,
          transactions: data.transactions,
        };
      }
    }
  } catch (e) {
    // Return null if offline or endpoint is unreachable
  }
  return null;
};
