import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Component Tree:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCache = () => {
    try {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((reg) => reg.unregister());
        });
      }
      // PWA service worker and HTTP cache cleared safely. User store ledger data is preserved.
    } catch (e) {
      console.error('Error clearing app cache', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
          <div className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-black text-white flex items-center gap-2">
                  App Encountered An Issue
                </h1>
                <p className="text-xs text-slate-400">
                  Provision Store Cash Flow Manager
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-400" /> Error Diagnostic Message:
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 max-h-36 overflow-y-auto">
                <p className="text-xs font-mono text-red-200 break-words font-semibold">
                  {this.state.error?.toString() || 'Unknown Application Initialization Error'}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-[10px] font-mono text-slate-400 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.slice(0, 300)}...
                  </pre>
                )}
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                RELOAD APPLICATION
              </button>

              <button
                type="button"
                onClick={this.handleClearCache}
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-2xl border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                CLEAR CACHE & HARD RESET
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center">
              If black screen persists, click "Clear Cache & Hard Reset" to reload fresh assets.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
