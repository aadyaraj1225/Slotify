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
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-soft-border pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-charcoal">
            Interviewer Panel Management
          </h1>
          <p className="font-body text-xs sm:text-sm text-slate-gray mt-1">
            Panelist evaluation expertise, maximum daily slot workloads, and active assignments.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Panelist</span>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-soft-border shadow-subtle">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-gray" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by panelist name, work email, or technical expertise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-soft-border bg-[#FDFCFB] pl-9 pr-3 py-1.5 text-xs font-body text-charcoal placeholder:text-slate-gray/70 focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-gray font-mono">Department:</span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded border border-soft-border bg-[#FDFCFB] px-2.5 py-1.5 text-xs font-body text-charcoal focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Interviewers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredInterviewers.map((int) => {
          const loadPercentage = Math.round((int.assignedCount / int.maxDailyLoad) * 100);
          const isAtCapacity = int.assignedCount >= int.maxDailyLoad;

          return (
            <div
              key={int.id}
              className="rounded-lg border border-soft-border bg-white p-5 shadow-card hover:border-slate-gray/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-base font-bold text-charcoal leading-snug">
                      {int.name}
                    </h3>
                    <p className="font-body text-xs text-slate-gray mt-0.5">
                      {int.department}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-slate-gray px-1.5 py-0.5 rounded bg-warm-ivory border border-soft-border">
                    {int.email}
                  </span>
                </div>

                {/* Expertise Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {int.expertise.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-pale-blue px-2 py-0.5 text-[10px] font-mono text-muted-cobalt border border-pale-blue-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Workload Indicator */}
                <div className="pt-2 border-t border-soft-border/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-gray">Assigned Workload:</span>
                    <span className={isAtCapacity ? "text-error-red font-bold" : "text-charcoal font-semibold"}>
                      {int.assignedCount} / {int.maxDailyLoad} slots ({loadPercentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#ECEAE4] rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        isAtCapacity ? "bg-error-red" : "bg-muted-cobalt"
                      }`}
                      style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-gray font-body flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-gray shrink-0" />
                  <span>{int.availability.length} availability blocks registered</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-soft-border/70 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingInterviewer(int)}
                  className="text-xs"
                >
                  View Assignments
                </Button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(int)}
                    className="p-1.5 rounded text-slate-gray hover:text-charcoal hover:bg-warm-ivory transition-colors"
                    title="Edit interviewer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteInterviewer(int.id)}
                    className="p-1.5 rounded text-slate-gray hover:text-error-red hover:bg-warm-ivory transition-colors"
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
          <form onSubmit={handleSaveInterviewer} className="space-y-4 text-left">
            <DialogHeader>
              <DialogTitle>
                {editingInterviewer ? "Edit Panelist Details" : "Add Interviewer"}
              </DialogTitle>
              <DialogDescription>
                Define technical evaluation domains and daily interview capacity.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="rounded bg-error-red/10 border border-error-red/30 p-2 text-xs text-error-red">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-heading mb-1.5">
                Maximum Daily Interview Load (Slots)
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={formData.maxDailyLoad}
                onChange={(e) => setFormData({ ...formData, maxDailyLoad: Number(e.target.value) })}
                className="w-full h-10 rounded border border-soft-border bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
                required
              />
              <p className="text-[11px] text-slate-gray mt-1">
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

            <div className="space-y-4 pt-3 text-xs font-body text-charcoal">
              <div>
                <span className="text-slate-gray uppercase font-mono text-[10px] block mb-1">
                  Availability Windows
                </span>
                <div className="space-y-1.5">
                  {viewingInterviewer.availability.map((av) => (
                    <div key={av.id} className="p-2 rounded bg-warm-ivory border border-soft-border flex items-center justify-between">
                      <span className="font-mono font-medium">Day {av.day} ({av.date})</span>
                      <span className="font-mono text-muted-cobalt">{av.startTime} - {av.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-gray uppercase font-mono text-[10px] block mb-1">
                  Scheduled Assignments ({viewingInterviewer.assignedCount})
                </span>
                {interviews.filter((i) => i.interviewerId === viewingInterviewer.id).length === 0 ? (
                  <p className="text-slate-gray italic py-2">No active interviews assigned yet.</p>
                ) : (
                  <div className="space-y-1.5">
                    {interviews
                      .filter((i) => i.interviewerId === viewingInterviewer.id)
                      .map((slot) => (
                        <div key={slot.id} className="p-2 rounded border border-soft-border bg-[#FDFCFB] flex items-center justify-between">
                          <div>
                            <span className="font-semibold block font-heading">{slot.id}</span>
                            <span className="font-mono text-slate-gray text-[11px]">{slot.date} | {slot.startTime} - {slot.endTime}</span>
                          </div>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-success-green/10 text-success-green border border-success-green/30">
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
