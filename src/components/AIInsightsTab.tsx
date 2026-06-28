import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, Sparkles, TrendingUp, HelpCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

interface AlertItem {
  id: string;
  type: string; // critical, warning, info, success
  title: string;
  desc: string;
}

interface InsightsData {
  summary: string;
  alerts: AlertItem[];
  recommendations: string[];
}

export default function AIInsightsTab() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState('');

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ai/insights');
      if (!response.ok) {
        throw new Error('Failed to download predictive trend analytics.');
      }
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch AI insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getAlertColorClasses = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-950/20 border-red-500/20 text-red-400',
          dot: 'bg-red-500 animate-ping',
          text: 'text-red-300'
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/20 border-amber-500/20 text-amber-400',
          dot: 'bg-amber-500',
          text: 'text-amber-300'
        };
      case 'success':
        return {
          bg: 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400',
          dot: 'bg-emerald-500',
          text: 'text-emerald-300'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-950/20 border-blue-500/20 text-blue-400',
          dot: 'bg-blue-500',
          text: 'text-blue-300'
        };
    }
  };

  return (
    <div className="space-y-6 text-slate-100" id="ai-warden-tab-container">
      {/* Tab Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/5 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />

        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5 fill-emerald-400/15" />
            </div>
            <h2 className="text-xl font-bold font-display tracking-tight text-white">
              AI Warden: Predictive Urban Systems
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Running real-time spatial clustering, category forecasting, and hazard analysis on Evergreen Valley District reported datasets using Google Gemini 3.5.
          </p>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          id="refresh-ai-insights-btn"
          className="z-10 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading && 'animate-spin'}`} />
          <span>Sync Real-Time AI Models</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4" id="ai-insights-loader">
          <LoaderCircleIcon className="w-8 h-8 animate-spin text-emerald-400" />
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-slate-200">Processing district spatial data...</p>
            <p className="text-xs text-slate-500">Gemini is running trend forecasting over local hazard coordinates.</p>
          </div>
        </div>
      ) : error ? (
        <div className="p-5 bg-red-950/20 border border-red-500/20 rounded-xl text-center space-y-3" id="ai-insights-error">
          <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-semibold text-red-400">Failed to load predictive insights</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
          <button
            onClick={fetchInsights}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-xs font-bold text-white rounded-lg transition-colors cursor-pointer"
          >
            Retry Analytics Compilation
          </button>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="ai-insights-payload">
          {/* Left Column: District Health Overview & Alerts */}
          <div className="lg:col-span-2 space-y-6">
            {/* District Health Overview */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <TrendingUp className="w-4.5 h-4.5 text-emerald-400" />
                <h3 className="font-bold text-sm text-slate-200 uppercase tracking-wider font-display">
                  Infrastructure Health Summary
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans font-light">
                {data.summary}
              </p>
            </div>

            {/* Smart Warnings and Alerts */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>Predictive System Alerts</span>
              </h3>

              <div className="space-y-3">
                {data.alerts.map((alert) => {
                  const styles = getAlertColorClasses(alert.type);
                  return (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all shadow-sm ${styles.bg}`}
                    >
                      {/* Flashing color indicator dot */}
                      <span className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${styles.dot}`} />
                      
                      <div className="space-y-1">
                        <h4 className={`font-semibold text-xs ${styles.text}`}>{alert.title}</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{alert.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Municipal Recommendations */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md space-y-4 h-full">
              <div>
                <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider font-display border-b border-slate-800 pb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
                  <span>Strategic AI Interventions</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Recommended administrative and community engagement actions to tackle the forecasted risk clusters:
                </p>
              </div>

              <div className="space-y-3">
                {data.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 p-3 bg-slate-950/40 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors group"
                  >
                    <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{rec}</p>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-950/10 border border-emerald-500/10 p-3 rounded-xl text-[10px] text-slate-400 leading-relaxed italic">
                *Recommendations are updated automatically as new citizen data is logged into the local registry coordinates.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Minimal inline loader SVG icon
function LoaderCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M4 12a8 8 0 018-8V0" strokeLinecap="round" />
    </svg>
  );
}
