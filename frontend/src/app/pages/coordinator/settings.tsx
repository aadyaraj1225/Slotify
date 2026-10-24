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
    <div className="space-y-6 text-left max-w-4xl">
      <div className="border-b border-soft-border pb-5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-charcoal">
          Coordinator & Scheduler Settings
        </h1>
        <p className="font-body text-xs sm:text-sm text-slate-gray mt-1">
          Configure default scheduling invariants, room buffers, and manage local demo storage.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Scheduling Invariants */}
        <div className="rounded-lg border border-soft-border bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-soft-border/70 pb-3">
            <ShieldCheck className="h-5 w-5 text-muted-cobalt" />
            <h2 className="font-heading text-base font-bold text-charcoal">
              Global Constraint Parameters
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-heading mb-1.5">
                Mandatory Room Cleaning Buffer (Minutes)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={bufferTime}
                onChange={(e) => setBufferTime(e.target.value)}
                className="w-full h-10 rounded border border-soft-border bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
              />
              <p className="text-[11px] text-slate-gray mt-1">
                Enforced by solver between consecutive sessions in the same venue.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-heading mb-1.5">
                Default Interview Round Duration (Minutes)
              </label>
              <input
                type="number"
                min={15}
                max={180}
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className="w-full h-10 rounded border border-soft-border bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
              />
              <p className="text-[11px] text-slate-gray mt-1">
                Applied when new interview rounds are initialized.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-heading mb-1.5">
              Solver Invariant Policy
            </label>
            <div className="space-y-2 text-xs font-body text-slate-gray">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded text-muted-cobalt" />
                <span>Strictly forbid concurrent candidate evaluations (Mandatory)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded text-muted-cobalt" />
                <span>Strictly enforce interviewer daily evaluation load limits (Mandatory)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-muted-cobalt" />
                <span>Prioritize contiguous interview blocks over dispersed slots (Optimization)</span>
              </label>
            </div>
          </div>

          <div className="pt-3 flex items-center gap-3">
            <Button type="submit" variant="primary" size="sm" className="gap-1.5">
              <Save className="h-4 w-4" />
              <span>Save Configuration</span>
            </Button>
            {saveConfirmed && (
              <span className="text-xs text-success-green font-medium flex items-center gap-1">
                <Check className="h-3.5 w-3.5" /> Settings saved successfully
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Demo State & Local Storage Management */}
      <div className="rounded-lg border border-soft-border bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 border-b border-soft-border/70 pb-3">
          <Database className="h-5 w-5 text-slate-gray" />
          <h2 className="font-heading text-base font-bold text-charcoal">
            Demo State & Data Persistence
          </h2>
        </div>

        <p className="text-xs text-slate-gray font-body leading-relaxed">
          The coordinator dashboard persists changes (new drives, registered candidates, updated panelists, and scheduled slots) to your browser's local storage. You can restore the clean original baseline dataset at any time.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-error-red border-error-red/30 hover:bg-error-red/10 gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Demo Data to Initial Baseline</span>
          </Button>

          {resetConfirmed && (
            <span className="text-xs text-success-green font-medium flex items-center gap-1">
              <Check className="h-3.5 w-3.5" /> Data restored to initial clean state
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
