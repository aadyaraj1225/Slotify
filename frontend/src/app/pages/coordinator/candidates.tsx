import * as React from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Info,
  Check,
} from "lucide-react";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { StatusIndicator } from "@/components/ui/status-indicator";
import type { Candidate, CandidateBookingStatus } from "@/types/coordinator";

export const CandidatesPage: React.FC = () => {
  const { candidates, drives, addCandidate, updateCandidate, deleteCandidate, selectedDriveId } = useCoordinator();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [driveFilter, setDriveFilter] = React.useState<string>(selectedDriveId);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingCandidate, setEditingCandidate] = React.useState<Candidate | null>(null);
  const [viewingCandidate, setViewingCandidate] = React.useState<Candidate | null>(null);

  const [formData, setFormData] = React.useState<{
    name: string;
    email: string;
    rollNo: string;
    driveId: string;
    appliedRole: string;
    currentStage: string;
    bookingStatus: CandidateBookingStatus;
    notes?: string;
  }>({
    name: "",
    email: "",
    rollNo: "",
    driveId: drives[0]?.id || "drive-1",
    appliedRole: "Software Engineer",
    currentStage: "Round 1: Data Structures & Algorithms",
    bookingStatus: "unassigned",
    notes: "",
  });

  const [formError, setFormError] = React.useState<string | null>(null);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDrive = driveFilter === "all" || c.driveId === driveFilter;
    const matchesStatus = statusFilter === "all" || c.bookingStatus === statusFilter;
    return matchesSearch && matchesDrive && matchesStatus;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      email: "",
      rollNo: "",
      driveId: driveFilter !== "all" ? driveFilter : (drives[0]?.id || "drive-1"),
      appliedRole: "Software Engineer",
      currentStage: "Round 1: Technical Evaluation",
      bookingStatus: "unassigned",
      notes: "",
    });
    setFormError(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cand: Candidate) => {
    setEditingCandidate(cand);
    setFormData({
      name: cand.name,
      email: cand.email,
      rollNo: cand.rollNo,
      driveId: cand.driveId,
      appliedRole: cand.appliedRole,
      currentStage: cand.currentStage,
      bookingStatus: cand.bookingStatus,
      notes: cand.notes || "",
    });
    setFormError(null);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.rollNo.trim()) {
      setFormError("Name, email, and roll number are mandatory fields.");
      return;
    }

    if (editingCandidate) {
      updateCandidate(editingCandidate.id, formData);
      setEditingCandidate(null);
    } else {
      addCandidate(formData);
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[#E4E3DD]/80 pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-slate-gray block mb-1">
            Recruitment Directory
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-medium tracking-tight text-charcoal">
            Candidate Roster
          </h1>
          <p className="font-body text-sm text-slate-gray mt-1.5 max-w-xl">
            Track student applications, interview stage progress, and slot allocation statuses across drives.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenAdd} className="gap-2 self-start sm:self-auto px-4 py-2 text-xs">
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Register Candidate</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-4 rounded-xl border border-[#E4E3DD]/80">
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-gray/60" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search candidates by name, roll number, or campus email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-[#E4E3DD] bg-[#FAF9F5] pl-10 pr-4 py-2 text-xs font-body text-charcoal placeholder:text-slate-gray/60 focus:outline-none focus:border-muted-cobalt focus:bg-white transition-colors"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={driveFilter}
            onChange={(e) => setDriveFilter(e.target.value)}
            className="w-full h-9 rounded-lg border border-[#E4E3DD] bg-[#FAF9F5] px-3 text-xs font-body text-charcoal focus:outline-none focus:border-muted-cobalt focus:bg-white transition-colors"
          >
            <option value="all">All Drives</option>
            {drives.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-9 rounded-lg border border-[#E4E3DD] bg-[#FAF9F5] px-3 text-xs font-body text-charcoal focus:outline-none focus:border-muted-cobalt focus:bg-white transition-colors"
          >
            <option value="all">All Booking Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="conflict">Conflict</option>
            <option value="unassigned">Awaiting Slot</option>
          </select>
        </div>
      </div>

      {/* Candidates Table */}
      <div className="rounded-xl border border-[#E4E3DD]/80 bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="border-b border-[#E4E3DD]/80 bg-[#FAF9F5]/70 font-mono text-[11px] text-slate-gray font-normal tracking-wide">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-6 py-3.5">Roll & Email</th>
                <th className="px-6 py-3.5">Drive & Target Role</th>
                <th className="px-6 py-3.5">Current Stage</th>
                <th className="px-6 py-3.5">Booking Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E3DD]/60">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-gray font-body text-xs">
                    No candidates found matching the selected search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((candidate) => {
                  const drive = drives.find((d) => d.id === candidate.driveId);
                  return (
                    <tr key={candidate.id} className="hover:bg-warm-ivory/40 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-heading font-medium text-sm text-charcoal block">
                          {candidate.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-charcoal block font-medium">{candidate.rollNo}</span>
                        <span className="text-[11px] text-slate-gray">{candidate.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-charcoal block">
                          {candidate.appliedRole}
                        </span>
                        <span className="text-[11px] text-slate-gray font-body">
                          {drive?.company || "Company"} &middot; {drive?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-gray">
                        {candidate.currentStage}
                      </td>
                      <td className="px-6 py-4">
                        {candidate.bookingStatus === "unassigned" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-normal bg-[#ECEAE4]/70 text-slate-gray border border-[#E4E3DD]">
                            Awaiting Slot
                          </span>
                        ) : (
                          <StatusIndicator status={candidate.bookingStatus} size="sm" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingCandidate(candidate)}
                            className="p-1.5 rounded-md text-slate-gray/70 hover:text-charcoal hover:bg-warm-ivory transition-colors"
                            title="Candidate detail"
                          >
                            <Info className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(candidate)}
                            className="p-1.5 rounded-md text-slate-gray/70 hover:text-charcoal hover:bg-warm-ivory transition-colors"
                            title="Edit candidate"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteCandidate(candidate.id)}
                            className="p-1.5 rounded-md text-slate-gray/70 hover:text-error-red hover:bg-warm-ivory transition-colors"
                            title="Remove candidate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Candidate Modal */}
      <Dialog
        open={isAddOpen || editingCandidate !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setEditingCandidate(null);
          }
        }}
      >
        <DialogContent maxWidth="md" onClose={() => { setIsAddOpen(false); setEditingCandidate(null); }}>
          <form onSubmit={handleSaveCandidate} className="space-y-5 text-left">
            <DialogHeader>
              <DialogTitle>
                {editingCandidate ? "Edit Candidate Details" : "Register New Candidate"}
              </DialogTitle>
              <DialogDescription>
                Enter campus credentials and allocate recruitment drive stream.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="rounded-lg bg-error-red/10 border border-error-red/30 p-3 text-xs text-error-red">
                {formError}
              </div>
            )}

            <Input
              label="Full Name"
              placeholder="e.g. Rohan Sharma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Roll Number"
                placeholder="e.g. CS21B042"
                value={formData.rollNo}
                onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                required
              />
              <Input
                type="email"
                label="Campus Email"
                placeholder="e.g. rohan.s@campus.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-gray mb-1.5">
                  Recruitment Drive
                </label>
                <select
                  value={formData.driveId}
                  onChange={(e) => setFormData({ ...formData, driveId: e.target.value })}
                  className="w-full h-10 rounded-lg border border-[#E4E3DD] bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:border-muted-cobalt"
                >
                  {drives.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Applied Role"
                placeholder="e.g. Software Engineer (Backend)"
                value={formData.appliedRole}
                onChange={(e) => setFormData({ ...formData, appliedRole: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current Stage"
                value={formData.currentStage}
                onChange={(e) => setFormData({ ...formData, currentStage: e.target.value })}
              />

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-gray mb-1.5">
                  Booking Status
                </label>
                <select
                  value={formData.bookingStatus}
                  onChange={(e) => setFormData({ ...formData, bookingStatus: e.target.value as CandidateBookingStatus })}
                  className="w-full h-10 rounded-lg border border-[#E4E3DD] bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:border-muted-cobalt"
                >
                  <option value="unassigned">Awaiting Slot</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="conflict">Conflict</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditingCandidate(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Check className="h-3.5 w-3.5 mr-1" />
                {editingCandidate ? "Save Changes" : "Register Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Candidate Details Modal */}
      {viewingCandidate && (
        <Dialog open={true} onOpenChange={() => setViewingCandidate(null)}>
          <DialogContent maxWidth="md" onClose={() => setViewingCandidate(null)}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{viewingCandidate.name}</DialogTitle>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-warm-ivory border border-[#E4E3DD]">
                  {viewingCandidate.rollNo}
                </span>
              </div>
              <DialogDescription>{viewingCandidate.email}</DialogDescription>
            </DialogHeader>

            <div className="space-y-3.5 pt-4 text-xs font-body text-charcoal border-t border-[#E4E3DD]/70">
              <div className="flex items-center gap-2">
                <span className="text-slate-gray font-mono uppercase text-[10px] w-28">Applied Role:</span>
                <span className="font-medium">{viewingCandidate.appliedRole}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-gray font-mono uppercase text-[10px] w-28">Current Stage:</span>
                <span>{viewingCandidate.currentStage}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-gray font-mono uppercase text-[10px] w-28">Booking State:</span>
                <span className="capitalize">{viewingCandidate.bookingStatus}</span>
              </div>
              {viewingCandidate.assignedSlotId && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-gray font-mono uppercase text-[10px] w-28">Slot ID:</span>
                  <span className="font-mono text-muted-cobalt">{viewingCandidate.assignedSlotId}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="primary" size="sm" onClick={() => setViewingCandidate(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
