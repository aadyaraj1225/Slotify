import * as React from "react";
import { RefreshCw, Check, ShieldCheck, Database, Save } from "lucide-react";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";

export const SettingsPage: React.FC = () => {
  const { resetToDefaultData } = useCoordinator();

  const [bufferTime, setBufferTime] = React.useState("15");
  const [defaultDuration, setDefaultDuration] = React.useState("45");
  const [saveConfirmed, setSaveConfirmed] = React.useState(false);
  const [resetConfirmed, setResetConfirmed] = React.useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveConfirmed(true);
    setTimeout(() => setSaveConfirmed(false), 2500);
  };

  const handleReset = () => {
    resetToDefaultData();
    setResetConfirmed(true);
    setTimeout(() => setResetConfirmed(false), 2500);
  };

  return (
    <div className="px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-5xl mx-auto space-y-10 text-left">
      <div className="border-b border-[#E4E3DD]/80 pb-8">
        <span className="font-mono text-xs uppercase tracking-wider text-slate-gray block mb-1">
          Preferences &amp; Defaults
        </span>
        <h1 className="font-heading text-3xl sm:text-4xl font-normal tracking-tight text-charcoal">
          Scheduler Configuration
        </h1>
        <p className="font-body text-sm text-slate-gray mt-1.5">
          Configure default solver invariants, mandatory room cleaning buffers, and manage demo storage.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Scheduling Invariants */}
        <div className="rounded-xl border border-[#E4E3DD]/80 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#E4E3DD]/70 pb-4">
            <ShieldCheck className="h-5 w-5 text-muted-cobalt" />
            <h2 className="font-heading text-base font-medium text-charcoal">
              Global Constraint Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-gray mb-1.5">
                Mandatory Room Buffer (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={bufferTime}
                onChange={(e) => setBufferTime(e.target.value)}
                className="w-full h-10 rounded-lg border border-[#E4E3DD] bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:border-muted-cobalt"
              />
              <p className="text-[11px] text-slate-gray mt-1.5 font-body">
                Enforced by solver between consecutive sessions in the same venue.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-gray mb-1.5">
                Default Round Duration (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={180}
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className="w-full h-10 rounded-lg border border-[#E4E3DD] bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:border-muted-cobalt"
              />
              <p className="text-[11px] text-slate-gray mt-1.5 font-body">
                Applied when new interview rounds are initialized.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-gray mb-2">
              Solver Invariant Policy
            </label>
            <div className="space-y-2.5 text-xs font-body text-slate-gray">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded text-muted-cobalt" />
                <span>Strictly forbid concurrent candidate evaluations (Mandatory)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded text-muted-cobalt" />
                <span>Strictly enforce interviewer daily evaluation load limits (Mandatory)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-muted-cobalt" />
                <span>Prioritize contiguous interview blocks over dispersed slots (Optimization)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E4E3DD]/70 flex items-center gap-4">
            <Button type="submit" variant="primary" size="sm" className="gap-2 px-4 py-2 text-xs">
              <Save className="h-3.5 w-3.5" />
              <span>Save Configuration</span>
            </Button>
            {saveConfirmed && (
              <span className="text-xs text-success-green font-medium flex items-center gap-1 font-mono">
                <Check className="h-3.5 w-3.5" /> Settings saved successfully
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Demo State & Local Storage Management */}
      <div className="rounded-xl border border-[#E4E3DD]/80 bg-white p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex items-center gap-2.5 border-b border-[#E4E3DD]/70 pb-4">
          <Database className="h-5 w-5 text-slate-gray" />
          <h2 className="font-heading text-base font-medium text-charcoal">
            Demo State &amp; Data Persistence
          </h2>
        </div>

        <p className="text-xs text-slate-gray font-body leading-relaxed max-w-2xl">
          The coordinator dashboard persists changes (new drives, registered candidates, updated panelists, and scheduled slots) to your browser's local storage. You can restore the clean original baseline dataset at any time.
        </p>

        <div className="pt-2 flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-error-red border-error-red/30 hover:bg-[#FDF0F0] gap-2 px-4 py-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Demo Data to Initial Baseline</span>
          </Button>

          {resetConfirmed && (
            <span className="text-xs text-success-green font-medium flex items-center gap-1 font-mono">
              <Check className="h-3.5 w-3.5" /> Data restored to initial clean state
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
