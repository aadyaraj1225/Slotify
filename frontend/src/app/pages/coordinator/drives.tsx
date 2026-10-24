import * as React from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Calendar,
  Layers,
  Users,
  Edit2,
  Trash2,
  Info,
  Check,
} from "lucide-react";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { RecruitmentDrive, DriveStatus, InterviewRound, RoundType } from "@/types/coordinator";

export const DrivesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { drives, addDrive, updateDrive, deleteDrive, setSelectedDriveId, selectedDriveId } = useCoordinator();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = React.useState(searchParams.get("action") === "new");
  const [editingDrive, setEditingDrive] = React.useState<RecruitmentDrive | null>(null);
  const [viewingDrive, setViewingDrive] = React.useState<RecruitmentDrive | null>(null);

  // Create/Edit Form State
  const [formData, setFormData] = React.useState<{
    name: string;
    company: string;
    description: string;
    startDate: string;
    endDate: string;
    status: DriveStatus;
    rounds: InterviewRound[];
  }>({
    name: "",
    company: "",
    description: "",
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    status: "planning",
    rounds: [
      { id: "rnd-default-1", name: "Technical Round 1", type: "technical", sequenceOrder: 1, durationMinutes: 45 },
    ],
  });

  const [formError, setFormError] = React.useState<string | null>(null);

  const filteredDrives = drives.filter((drive) => {
    const matchesSearch =
      drive.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || drive.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenCreate = () => {
    setFormData({
      name: "",
      company: "",
      description: "",
      startDate: "2026-11-10",
      endDate: "2026-11-12",
      status: "planning",
      rounds: [
        { id: `rnd-${Date.now()}-1`, name: "Technical Round 1: Algorithms", type: "technical", sequenceOrder: 1, durationMinutes: 45 },
      ],
    });
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (drive: RecruitmentDrive) => {
    setEditingDrive(drive);
    setFormData({
      name: drive.name,
      company: drive.company,
      description: drive.description,
      startDate: drive.startDate,
      endDate: drive.endDate,
      status: drive.status,
      rounds: [...drive.rounds],
    });
    setFormError(null);
  };

  const handleSaveDrive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.company.trim()) {
      setFormError("Drive name and company name are required.");
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError("End date cannot precede the start date.");
      return;
    }

    if (editingDrive) {
      updateDrive(editingDrive.id, {
        name: formData.name,
        company: formData.company,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        rounds: formData.rounds,
      });
      setEditingDrive(null);
    } else {
      addDrive({
        name: formData.name,
        company: formData.company,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        rounds: formData.rounds,
        candidateIds: [],
        interviewerIds: [],
        roomIds: [],
      });
      setIsCreateOpen(false);
    }
  };

  const handleAddRound = () => {
    const newSeq = formData.rounds.length + 1;
    const newRound: InterviewRound = {
      id: `rnd-${Date.now()}-${newSeq}`,
      name: `Round ${newSeq}: Evaluation Stage`,
      type: "technical",
      sequenceOrder: newSeq,
      durationMinutes: 45,
    };
    setFormData({ ...formData, rounds: [...formData.rounds, newRound] });
  };

  const handleRemoveRound = (roundId: string) => {
    if (formData.rounds.length <= 1) return;
    setFormData({
      ...formData,
      rounds: formData.rounds.filter((r) => r.id !== roundId),
    });
  };

  const getStatusBadge = (status: DriveStatus) => {
    switch (status) {
      case "active":
        return <span className="rounded bg-success-green/10 text-success-green border border-success-green/30 px-2 py-0.5 text-xs font-medium">Active</span>;
      case "planning":
        return <span className="rounded bg-pale-blue text-muted-cobalt border border-pale-blue-border px-2 py-0.5 text-xs font-medium">Planning</span>;
      case "completed":
        return <span className="rounded bg-[#ECEAE4] text-slate-gray border border-soft-border px-2 py-0.5 text-xs font-medium">Completed</span>;
      case "paused":
        return <span className="rounded bg-warning-amber/10 text-warning-amber border border-warning-amber/30 px-2 py-0.5 text-xs font-medium">Paused</span>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-soft-border pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-charcoal">
            Recruitment Drives
          </h1>
          <p className="font-body text-xs sm:text-sm text-slate-gray mt-1">
            Configure company drives, sequential interview rounds, and evaluation gates.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New Recruitment Drive</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-soft-border shadow-subtle">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-gray" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search drives by name or recruiting company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-soft-border bg-[#FDFCFB] pl-9 pr-3 py-1.5 text-xs font-body text-charcoal placeholder:text-slate-gray/70 focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-gray font-mono">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-soft-border bg-[#FDFCFB] px-2.5 py-1.5 text-xs font-body text-charcoal focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDrives.map((drive) => {
          const isSelected = selectedDriveId === drive.id;
          return (
            <div
              key={drive.id}
              className={`rounded-lg border bg-white p-5 shadow-card transition-all flex flex-col justify-between ${
                isSelected ? "border-muted-cobalt ring-1 ring-muted-cobalt" : "border-soft-border hover:border-slate-gray/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] text-slate-gray uppercase">
                      {drive.company}
                    </span>
                    <h3 className="font-heading text-base font-bold text-charcoal leading-snug">
                      {drive.name}
                    </h3>
                  </div>
                  {getStatusBadge(drive.status)}
                </div>

                <p className="font-body text-xs text-slate-gray line-clamp-2">
                  {drive.description || "No specific drive instructions provided."}
                </p>

                <div className="space-y-2 pt-2 border-t border-soft-border/60 text-xs font-body text-slate-gray">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-gray shrink-0" />
                    <span className="font-mono">{drive.startDate} to {drive.endDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-gray shrink-0" />
                    <span>{drive.rounds.length} Interview Rounds Configured</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-gray shrink-0" />
                    <span>{drive.candidateIds.length} Registered Candidates</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-soft-border/70 flex items-center justify-between gap-2">
                <Button
                  variant={isSelected ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDriveId(drive.id)}
                  className="text-xs"
                >
                  {isSelected ? "Active Scope" : "Set Active"}
                </Button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setViewingDrive(drive)}
                    className="p-1.5 rounded text-slate-gray hover:text-charcoal hover:bg-warm-ivory transition-colors"
                    title="View details"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(drive)}
                    className="p-1.5 rounded text-slate-gray hover:text-charcoal hover:bg-warm-ivory transition-colors"
                    title="Edit drive"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDrive(drive.id)}
                    className="p-1.5 rounded text-slate-gray hover:text-error-red hover:bg-warm-ivory transition-colors"
                    title="Delete drive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Drive Modal */}
      <Dialog
        open={isCreateOpen || editingDrive !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingDrive(null);
          }
        }}
      >
        <DialogContent maxWidth="xl" onClose={() => { setIsCreateOpen(false); setEditingDrive(null); }}>
          <form onSubmit={handleSaveDrive} className="space-y-4 text-left">
            <DialogHeader>
              <DialogTitle>
                {editingDrive ? "Edit Recruitment Drive" : "Create New Recruitment Drive"}
              </DialogTitle>
              <DialogDescription>
                Define company metadata, scheduled dates, and sequential evaluation rounds.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="rounded bg-error-red/10 border border-error-red/30 p-2.5 text-xs text-error-red">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Drive Title"
                placeholder="e.g. Google Campus Drive 2026"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Company / Organization"
                placeholder="e.g. Google"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-heading mb-1.5">
                Description / Special Instructions
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded border border-soft-border bg-white p-2.5 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
                placeholder="Enter scope, eligibility criteria, and drive guidelines..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                type="date"
                label="Start Date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
              <Input
                type="date"
                label="End Date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-heading mb-1.5">
                  Drive Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as DriveStatus })}
                  className="w-full h-10 rounded border border-soft-border bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            {/* Configured Interview Rounds Section */}
            <div className="pt-2 border-t border-soft-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-xs font-bold text-charcoal uppercase tracking-wider">
                    Sequential Interview Rounds ({formData.rounds.length})
                  </h4>
                  <p className="text-[11px] text-slate-gray font-body">
                    Must be satisfied in numerical sequence.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddRound} className="text-xs h-7">
                  <Plus className="h-3 w-3 mr-1" /> Add Round
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {formData.rounds.map((round, idx) => (
                  <div
                    key={round.id}
                    className="flex items-center gap-2 p-2.5 rounded border border-soft-border bg-[#FDFCFB]"
                  >
                    <span className="font-mono text-xs font-bold text-muted-cobalt w-6 text-center">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={round.name}
                      onChange={(e) => {
                        const updated = [...formData.rounds];
                        updated[idx].name = e.target.value;
                        setFormData({ ...formData, rounds: updated });
                      }}
                      className="flex-1 rounded border border-soft-border px-2 py-1 text-xs text-charcoal"
                      placeholder="Round title..."
                    />
                    <select
                      value={round.type}
                      onChange={(e) => {
                        const updated = [...formData.rounds];
                        updated[idx].type = e.target.value as RoundType;
                        setFormData({ ...formData, rounds: updated });
                      }}
                      className="rounded border border-soft-border px-2 py-1 text-xs text-charcoal bg-white"
                    >
                      <option value="coding">Coding</option>
                      <option value="technical">Technical</option>
                      <option value="system_design">System Design</option>
                      <option value="hr">HR / Behavioral</option>
                    </select>
                    <span className="font-mono text-xs text-slate-gray">
                      {round.durationMinutes}m
                    </span>
                    {formData.rounds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRound(round.id)}
                        className="text-slate-gray hover:text-error-red p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingDrive(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Check className="h-3.5 w-3.5 mr-1" />
                {editingDrive ? "Update Drive" : "Create Drive"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Drive Details View Modal */}
      {viewingDrive && (
        <Dialog open={true} onOpenChange={() => setViewingDrive(null)}>
          <DialogContent maxWidth="lg" onClose={() => setViewingDrive(null)}>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{viewingDrive.name}</DialogTitle>
                {getStatusBadge(viewingDrive.status)}
              </div>
              <DialogDescription>
                Company: {viewingDrive.company} | Duration: {viewingDrive.startDate} to {viewingDrive.endDate}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-xs font-body text-charcoal">
              <div>
                <span className="text-slate-gray uppercase font-mono text-[10px] block">
                  Description
                </span>
                <p className="mt-1 leading-relaxed">
                  {viewingDrive.description || "No description provided."}
                </p>
              </div>

              <div>
                <span className="text-slate-gray uppercase font-mono text-[10px] block mb-1.5">
                  Interview Rounds Hierarchy
                </span>
                <div className="space-y-1.5">
                  {viewingDrive.rounds.map((round, idx) => (
                    <div key={round.id} className="p-2 rounded bg-warm-ivory border border-soft-border flex items-center justify-between">
                      <span className="font-semibold">
                        {idx + 1}. {round.name}
                      </span>
                      <span className="font-mono text-slate-gray text-[11px]">
                        Type: {round.type} ({round.durationMinutes} min)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="primary" size="sm" onClick={() => setViewingDrive(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
