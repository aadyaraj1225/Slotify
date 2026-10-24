import * as React from "react";
import {
  Search,
  Plus,
  Clock,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { Interviewer } from "@/types/coordinator";

export const InterviewersPage: React.FC = () => {
  const { interviewers, addInterviewer, updateInterviewer, deleteInterviewer, interviews } = useCoordinator();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("all");

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingInterviewer, setEditingInterviewer] = React.useState<Interviewer | null>(null);
  const [viewingInterviewer, setViewingInterviewer] = React.useState<Interviewer | null>(null);

  const [formData, setFormData] = React.useState<{
    name: string;
    email: string;
    department: string;
    expertiseStr: string;
    maxDailyLoad: number;
  }>({
    name: "",
    email: "",
    department: "Software Engineering",
    expertiseStr: "Algorithms, Distributed Systems",
    maxDailyLoad: 4,
  });

  const [formError, setFormError] = React.useState<string | null>(null);

  const departments = Array.from(new Set(interviewers.map((i) => i.department)));

  const filteredInterviewers = interviewers.filter((int) => {
    const matchesSearch =
      int.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      int.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      int.expertise.some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = departmentFilter === "all" || int.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      department: "Software Engineering",
      expertiseStr: "Algorithms, System Design",
      maxDailyLoad: 4,
    });
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (int: Interviewer) => {
    setEditingInterviewer(int);
    setFormData({
      name: int.name,
      email: int.email,
      department: int.department,
      expertiseStr: int.expertise.join(", "),
      maxDailyLoad: int.maxDailyLoad,
    });
    setFormError(null);
  };

  const handleSaveInterviewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Name and email are required.");
      return;
    }

    const expertiseList = formData.expertiseStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingInterviewer) {
      updateInterviewer(editingInterviewer.id, {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        expertise: expertiseList,
        maxDailyLoad: Number(formData.maxDailyLoad),
      });
      setEditingInterviewer(null);
    } else {
      addInterviewer({
        name: formData.name,
        email: formData.email,
        department: formData.department,
        expertise: expertiseList,
        maxDailyLoad: Number(formData.maxDailyLoad),
        availability: [
          { id: `av-${Date.now()}-1`, day: 1, date: "2026-11-10", startTime: "09:30", endTime: "13:00" },
        ],
        assignedCount: 0,
      });
      setIsAddOpen(false);
    }
  };

  return (
    <div className="px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-7xl mx-auto space-y-10 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 border-b border-[#E4E3DD]/80 pb-8">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-slate-gray block mb-1">
            Panel Roster
          </span>
          <h1 className="font-heading text-3xl sm:text-4xl font-normal tracking-tight text-charcoal">
            Interviewers &amp; Evaluators
          </h1>
          <p className="font-body text-sm text-slate-gray mt-1.5 max-w-xl">
            Manage technical panel expertise, daily maximum interview load quotas, and active assignment slots.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd} className="gap-2 self-start sm:self-auto px-5 py-2.5 text-xs font-medium">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Register Panelist</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E4E3DD]/80">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-gray/60" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search panelists by name, work email, or technical expertise domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#E4E3DD] bg-[#FAF9F5] pl-10 pr-4 py-2 text-xs font-body text-charcoal placeholder:text-slate-gray/60 focus:outline-none focus:border-muted-cobalt focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-gray font-mono">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-9 rounded-lg border border-[#E4E3DD] bg-[#FAF9F5] px-3 text-xs font-body text-charcoal focus:outline-none focus:border-muted-cobalt focus:bg-white transition-colors"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interviewers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInterviewers.map((int) => {
          const loadPercentage = Math.round((int.assignedCount / int.maxDailyLoad) * 100);
          const isAtCapacity = int.assignedCount >= int.maxDailyLoad;

          return (
            <div
              key={int.id}
              className="rounded-xl border border-[#E4E3DD]/80 bg-white p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-slate-gray/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-base font-medium text-charcoal leading-snug">
                      {int.name}
                    </h3>
                    <p className="font-body text-xs text-slate-gray mt-0.5">
                      {int.department}
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-slate-gray">
                    {int.email}
                  </span>
                </div>

                {/* Expertise Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {int.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-pale-blue/60 px-2.5 py-0.5 text-[10px] font-mono text-muted-cobalt border border-pale-blue-border/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Workload Indicator */}
                <div className="pt-3 border-t border-[#E4E3DD]/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-gray">Daily Workload</span>
                    <span className={isAtCapacity ? "text-error-red font-medium" : "text-charcoal font-medium"}>
                      {int.assignedCount} of {int.maxDailyLoad} slots ({loadPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#ECEAE4] rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        isAtCapacity ? "bg-error-red" : "bg-muted-cobalt"
                      }`}
                      style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-gray font-body flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-gray/70 shrink-0" />
                  <span>{int.availability.length} availability blocks registered</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-6 pt-4 border-t border-[#E4E3DD]/70 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingInterviewer(int)}
                  className="text-xs px-3 py-1.5"
                >
                  View Schedule
                </Button>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(int)}
                    className="p-1.5 rounded-md text-slate-gray/70 hover:text-charcoal hover:bg-warm-ivory transition-colors"
                    title="Edit interviewer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteInterviewer(int.id)}
                    className="p-1.5 rounded-md text-slate-gray/70 hover:text-error-red hover:bg-warm-ivory transition-colors"
                    title="Remove interviewer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Interviewer Dialog */}
      <Dialog
        open={isAddOpen || editingInterviewer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingInterviewer(null);
          }
        }}
      >
        <DialogContent maxWidth="md" onClose={() => { setIsAddOpen(false); setEditingInterviewer(null); }}>
          <form onSubmit={handleSaveInterviewer} className="space-y-5 text-left">
            <DialogHeader>
              <DialogTitle>
                {editingInterviewer ? "Edit Panelist Details" : "Register Panelist"}
              </DialogTitle>
              <DialogDescription>
                Define technical evaluation domains and daily interview capacity limits.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="rounded-lg bg-error-red/10 border border-error-red/30 p-3 text-xs text-error-red">
                {formError}
              </div>
            )}

            <Input
              label="Full Name & Title"
              placeholder="e.g. Dr. Vikram Sethi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="email"
                label="Partner Work Email"
                placeholder="e.g. v.sethi@partner-tech.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Department / Focus"
                placeholder="e.g. Distributed Systems Lead"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>

            <Input
              label="Technical Expertise (Comma separated)"
              placeholder="e.g. Algorithms, Concurrency, System Design"
              value={formData.expertiseStr}
              onChange={(e) => setFormData({ ...formData, expertiseStr: e.target.value })}
              helperText="Used by solver to match interview round prerequisites."
              required
            />

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-gray mb-1.5">
                Maximum Daily Interview Load (Slots)
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={formData.maxDailyLoad}
                onChange={(e) => setFormData({ ...formData, maxDailyLoad: Number(e.target.value) })}
                className="w-full h-10 rounded-lg border border-[#E4E3DD] bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:border-muted-cobalt"
                required
              />
              <p className="text-[11px] text-slate-gray mt-1 font-body">
                Hard constraint: Scheduler will not allocate slots beyond this threshold.
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingInterviewer(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Check className="h-3.5 w-3.5 mr-1" />
                {editingInterviewer ? "Save Changes" : "Save Panelist"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Interviewer Assignments Modal */}
      {viewingInterviewer && (
        <Dialog open={true} onOpenChange={() => setViewingInterviewer(null)}>
          <DialogContent maxWidth="lg" onClose={() => setViewingInterviewer(null)}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{viewingInterviewer.name}</DialogTitle>
                <span className="font-mono text-xs text-slate-gray">
                  {viewingInterviewer.email}
                </span>
              </div>
              <DialogDescription>{viewingInterviewer.department}</DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-4 text-xs font-body text-charcoal border-t border-[#E4E3DD]/70">
              <div>
                <span className="text-slate-gray uppercase font-mono text-[10px] block mb-2">
                  Availability Windows
                </span>
                <div className="space-y-2">
                  {viewingInterviewer.availability.map((av) => (
                    <div key={av.id} className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E4E3DD] flex items-center justify-between">
                      <span className="font-mono font-medium">Day {av.day} ({av.date})</span>
                      <span className="font-mono text-muted-cobalt">{av.startTime} &ndash; {av.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-gray uppercase font-mono text-[10px] block mb-2">
                  Scheduled Assignments ({viewingInterviewer.assignedCount})
                </span>
                {interviews.filter((i) => i.interviewerId === viewingInterviewer.id).length === 0 ? (
                  <p className="text-slate-gray italic py-3">No active interviews assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {interviews
                      .filter((i) => i.interviewerId === viewingInterviewer.id)
                      .map((slot) => (
                        <div key={slot.id} className="p-3 rounded-lg border border-[#E4E3DD] bg-white flex items-center justify-between">
                          <div>
                            <span className="font-medium block font-heading text-charcoal">{slot.id}</span>
                            <span className="font-mono text-slate-gray text-[11px]">{slot.date} &middot; {slot.startTime} &ndash; {slot.endTime}</span>
                          </div>
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#EAF4EE] text-success-green border border-success-green/30">
                            {slot.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="primary" size="sm" onClick={() => setViewingInterviewer(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
