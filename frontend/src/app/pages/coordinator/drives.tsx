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

  const [isCreateOpen, setIsCreateOpen] = React.useState(searchParams.get("action") === "new");
  const [editingDrive, setEditingDrive] = React.useState<RecruitmentDrive | null>(null);
  const [viewingDrive, setViewingDrive] = React.useState<RecruitmentDrive | null>(null);

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
      setFormError("Drive title and recruiting company are required.");
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
        return <span className="rounded bg-electric-lime text-deep-black border border-deep-black/30 px-2 py-0.5 text-[11px] font-mono font-bold">Active</span>;
      case "planning":
        return <span className="rounded bg-sky-blue text-deep-black border border-deep-black/30 px-2 py-0.5 text-[11px] font-mono font-bold">Planning</span>;
      case "completed":
        return <span className="rounded bg-[#EFEFEA] text-slate-gray border border-[#E4E3DD] px-2 py-0.5 text-[11px] font-mono font-medium">Completed</span>;
      case "paused":
        return <span className="rounded bg-warning-amber text-deep-black border border-deep-black/30 px-2 py-0.5 text-[11px] font-mono font-bold">Paused</span>;
    }
  };

  return (
    <div className="px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-7xl mx-auto space-y-10 text-left">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 border-b border-[#E4E3DD]/80 pb-8">
        <div className="space-y-1.5 max-w-xl">
          <h1 className="font-heading text-3xl sm:text-4xl font-normal tracking-tight text-charcoal">
            Recruitment Drives
          </h1>
          <p className="font-body text-sm text-slate-gray leading-relaxed">
            Configure campus placement drives, sequential interview stages, and evaluation scopes.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenCreate} className="gap-2 px-5 py-2.5 text-xs font-medium">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>New Recruitment Drive</span>
        </Button>
      </div>

      {/* Filter and Search Bar: Airy and Minimal */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-gray/60" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search drives by title or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-soft-border/90 bg-white pl-10 pr-4 py-2.5 text-xs font-body text-charcoal placeholder:text-slate-gray/60 focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-gray font-body">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-soft-border/90 bg-white px-3 py-2 text-xs font-body text-charcoal focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
          >
            <option value="all">All Drives</option>
            <option value="active">Active</option>
            <option value="planning">Planning</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Drives: Clean, Spacious Rows / Cards */}
      <div className="space-y-4">
        {filteredDrives.map((drive) => {
          const isSelected = selectedDriveId === drive.id;
          return (
            <div
              key={drive.id}
              className={`rounded-2xl border-2 bg-white p-7 sm:p-8 transition-all ${
                isSelected
                  ? "border-deep-black shadow-[4px_4px_0px_#D7FF35]"
                  : "border-deep-black/20 hover:border-deep-black shadow-[2px_2px_0px_#101010]"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-gray font-bold">
                      {drive.company}
                    </span>
                    {getStatusBadge(drive.status)}
                    {isSelected && (
                      <span className="text-[11px] font-mono text-deep-black bg-electric-lime px-2 py-0.5 rounded font-bold border border-deep-black/30">
                        Active Scope
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-deep-black">
                    {drive.name}
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-slate-gray leading-relaxed">
                    {drive.description || "No specific instructions provided."}
                  </p>

                  <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-gray font-body">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar className="h-3.5 w-3.5 text-slate-gray/70" />
                      {drive.startDate} to {drive.endDate}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-slate-gray/70" />
                      {drive.rounds.length} sequential rounds
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-gray/70" />
                      {drive.candidateIds.length} candidates enrolled
                    </span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
                  <Button
                    variant={isSelected ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDriveId(drive.id)}
                  >
                    {isSelected ? "Active Drive" : "Set Active"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingDrive(drive)}
                  >
                    <Info className="h-3.5 w-3.5 mr-1.5 text-slate-gray" />
                    <span>Details</span>
                  </Button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(drive)}
                    className="p-2 rounded-lg text-slate-gray hover:text-charcoal hover:bg-warm-ivory transition-colors"
                    title="Edit drive"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDrive(drive.id)}
                    className="p-2 rounded-lg text-slate-gray hover:text-error-red hover:bg-warm-ivory transition-colors"
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
          <form onSubmit={handleSaveDrive} className="space-y-6 text-left">
            <DialogHeader>
              <DialogTitle>
                {editingDrive ? "Edit Recruitment Drive" : "Create Recruitment Drive"}
              </DialogTitle>
              <DialogDescription>
                Define recruitment metadata, dates, and interview stages.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="rounded-lg bg-error-red/10 border border-error-red/30 p-3 text-xs text-error-red">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label className="block text-xs font-medium text-slate-gray font-body mb-1.5">
                Description / Special Instructions
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-soft-border/90 bg-white p-3 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
                placeholder="Enter scope, eligibility criteria, and guidelines..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <label className="block text-xs font-medium text-slate-gray font-body mb-1.5">
                  Drive Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as DriveStatus })}
                  className="w-full h-10 rounded-lg border border-soft-border/90 bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </select>
              </div>
            </div>

            {/* Rounds Section */}
            <div className="pt-4 border-t border-[#F0EFEB] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-sm font-semibold text-charcoal">
                    Interview Rounds ({formData.rounds.length})
                  </h4>
                  <p className="text-xs text-slate-gray font-body">
                    Sequentially administered during candidate progression.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddRound}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Round
                </Button>
              </div>

              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {formData.rounds.map((round, idx) => (
                  <div
                    key={round.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-soft-border/80 bg-[#FAF9F5]"
                  >
                    <span className="font-mono text-xs font-semibold text-muted-cobalt w-6 text-center">
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
                      className="flex-1 rounded-md border border-soft-border bg-white px-3 py-1.5 text-xs text-charcoal font-body"
                      placeholder="Round title..."
                    />
                    <select
                      value={round.type}
                      onChange={(e) => {
                        const updated = [...formData.rounds];
                        updated[idx].type = e.target.value as RoundType;
                        setFormData({ ...formData, rounds: updated });
                      }}
                      className="rounded-md border border-soft-border px-2.5 py-1.5 text-xs text-charcoal bg-white font-body"
                    >
                      <option value="coding">Coding</option>
                      <option value="technical">Technical</option>
                      <option value="system_design">System Design</option>
                      <option value="hr">HR</option>
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
                        <Trash2 className="h-4 w-4" />
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
                {viewingDrive.company} | Duration: {viewingDrive.startDate} to {viewingDrive.endDate}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-4 text-xs font-body text-charcoal">
              <div>
                <span className="text-slate-gray font-body font-medium block mb-1">
                  Scope Description
                </span>
                <p className="leading-relaxed text-charcoal">
                  {viewingDrive.description || "No description provided."}
                </p>
              </div>

              <div>
                <span className="text-slate-gray font-body font-medium block mb-2">
                  Configured Stages ({viewingDrive.rounds.length})
                </span>
                <div className="space-y-2">
                  {viewingDrive.rounds.map((round, idx) => (
                    <div key={round.id} className="p-3 rounded-lg bg-warm-ivory border border-soft-border/70 flex items-center justify-between">
                      <span className="font-medium text-charcoal">
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
