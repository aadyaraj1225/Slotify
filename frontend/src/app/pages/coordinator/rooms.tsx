import * as React from "react";
import {
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";
import { useCoordinator } from "@/context/coordinator-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { InterviewRoom } from "@/types/coordinator";

export const RoomsPage: React.FC = () => {
  const {
    rooms,
    addRoom,
    updateRoom,
    toggleRoomAvailability,
    deleteRoom,
    interviewers,
    addAvailability,
    removeAvailability,
  } = useCoordinator();

  const [activeTab, setActiveTab] = React.useState<"rooms" | "availability">("rooms");

  // Room modal state
  const [isRoomModalOpen, setIsRoomModalOpen] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<InterviewRoom | null>(null);
  const [roomFormData, setRoomFormData] = React.useState<{
    name: string;
    building: string;
    floor: string;
    capacity: number;
    equipmentStr: string;
    isAvailable: boolean;
  }>({
    name: "",
    building: "Academic Complex B",
    floor: "2nd Floor",
    capacity: 6,
    equipmentStr: "Whiteboard, Dual Monitor, High-speed LAN",
    isAvailable: true,
  });

  // Availability modal state
  const [isAvailModalOpen, setIsAvailModalOpen] = React.useState(false);
  const [availFormData, setAvailFormData] = React.useState<{
    interviewerId: string;
    day: number;
    date: string;
    startTime: string;
    endTime: string;
  }>({
    interviewerId: interviewers[0]?.id || "int-1",
    day: 1,
    date: "2026-11-10",
    startTime: "09:00",
    endTime: "13:00",
  });

  const [formError, setFormError] = React.useState<string | null>(null);

  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      name: "",
      building: "Academic Complex B",
      floor: "2nd Floor",
      capacity: 6,
      equipmentStr: "Whiteboard, Display Screen",
      isAvailable: true,
    });
    setFormError(null);
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: InterviewRoom) => {
    setEditingRoom(room);
    setRoomFormData({
      name: room.name,
      building: room.building,
      floor: room.floor,
      capacity: room.capacity,
      equipmentStr: room.equipment.join(", "),
      isAvailable: room.isAvailable,
    });
    setFormError(null);
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomFormData.name.trim() || !roomFormData.building.trim()) {
      setFormError("Room name and building location are required.");
      return;
    }

    const eqList = roomFormData.equipmentStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingRoom) {
      updateRoom(editingRoom.id, {
        name: roomFormData.name,
        building: roomFormData.building,
        floor: roomFormData.floor,
        capacity: Number(roomFormData.capacity),
        equipment: eqList,
        isAvailable: roomFormData.isAvailable,
      });
    } else {
      addRoom({
        name: roomFormData.name,
        building: roomFormData.building,
        floor: roomFormData.floor,
        capacity: Number(roomFormData.capacity),
        equipment: eqList,
        isAvailable: roomFormData.isAvailable,
      });
    }
    setIsRoomModalOpen(false);
  };

  const handleSaveAvailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (availFormData.endTime <= availFormData.startTime) {
      setFormError("End time cannot precede or equal the start time.");
      return;
    }

    addAvailability(availFormData.interviewerId, {
      day: Number(availFormData.day),
      date: availFormData.date,
      startTime: availFormData.startTime,
      endTime: availFormData.endTime,
    });
    setIsAvailModalOpen(false);
    setFormError(null);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-soft-border pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-charcoal">
            Rooms & Availability Workspace
          </h1>
          <p className="font-body text-xs sm:text-sm text-slate-gray mt-1">
            Manage physical interview rooms, venue capacities, and panelist time windows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "rooms" ? (
            <Button variant="primary" size="sm" onClick={handleOpenAddRoom} className="gap-1.5">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Interview Room</span>
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setIsAvailModalOpen(true)} className="gap-1.5">
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Availability Window</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-soft-border">
        <button
          type="button"
          onClick={() => setActiveTab("rooms")}
          className={`px-4 py-2 text-xs font-heading font-semibold border-b-2 transition-colors ${
            activeTab === "rooms"
              ? "border-muted-cobalt text-muted-cobalt"
              : "border-transparent text-slate-gray hover:text-charcoal"
          }`}
        >
          Interview Venues & Rooms ({rooms.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("availability")}
          className={`px-4 py-2 text-xs font-heading font-semibold border-b-2 transition-colors ${
            activeTab === "availability"
              ? "border-muted-cobalt text-muted-cobalt"
              : "border-transparent text-slate-gray hover:text-charcoal"
          }`}
        >
          Panel Availability Matrix
        </button>
      </div>

      {/* ROOMS TAB */}
      {activeTab === "rooms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`rounded-lg border bg-white p-5 shadow-card transition-all flex flex-col justify-between ${
                room.isAvailable ? "border-soft-border" : "border-error-red/30 bg-error-red/5"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-heading text-base font-bold text-charcoal leading-snug">
                      {room.name}
                    </h3>
                    <p className="font-body text-xs text-slate-gray mt-0.5">
                      {room.building} ({room.floor})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleRoomAvailability(room.id)}
                    className="shrink-0"
                    title={room.isAvailable ? "Mark Unavailable" : "Mark Available"}
                  >
                    {room.isAvailable ? (
                      <span className="flex items-center gap-1 rounded bg-success-green/10 text-success-green border border-success-green/30 px-2 py-0.5 text-xs font-medium">
                        <CheckCircle2 className="h-3 w-3" /> Available
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded bg-error-red/10 text-error-red border border-error-red/30 px-2 py-0.5 text-xs font-medium">
                        <XCircle className="h-3 w-3" /> Offline
                      </span>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-soft-border/60 text-xs font-body text-slate-gray">
                  <div className="flex items-center justify-between font-mono">
                    <span>Spatial Capacity:</span>
                    <span className="font-bold text-charcoal">{room.capacity} Persons</span>
                  </div>
                </div>

                {/* Equipment Tags */}
                <div className="pt-1">
                  <span className="font-mono text-[10px] uppercase text-slate-gray block mb-1">
                    Configured Equipment
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {room.equipment.map((eq) => (
                      <span
                        key={eq}
                        className="rounded bg-warm-ivory px-2 py-0.5 text-[10px] font-mono text-charcoal border border-soft-border"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-soft-border/70 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleRoomAvailability(room.id)}
                  className="text-xs"
                >
                  {room.isAvailable ? "Set Offline" : "Set Active"}
                </Button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditRoom(room)}
                    className="p-1.5 rounded text-slate-gray hover:text-charcoal hover:bg-warm-ivory transition-colors"
                    title="Edit room"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRoom(room.id)}
                    className="p-1.5 rounded text-slate-gray hover:text-error-red hover:bg-warm-ivory transition-colors"
                    title="Delete room"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AVAILABILITY TAB */}
      {activeTab === "availability" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-soft-border bg-white shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-body">
                <thead className="border-b border-soft-border bg-[#FDFCFB] font-heading font-semibold text-slate-gray uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Panelist / Interviewer</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Configured Available Windows</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft-border">
                  {interviewers.map((int) => (
                    <tr key={int.id} className="hover:bg-warm-ivory/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-charcoal">
                        {int.name}
                        <span className="block text-[11px] font-mono font-normal text-slate-gray">
                          {int.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-gray">{int.department}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {int.availability.map((av) => (
                            <span
                              key={av.id}
                              className="inline-flex items-center gap-1.5 rounded bg-pale-blue px-2 py-1 text-xs font-mono text-muted-cobalt border border-pale-blue-border"
                            >
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>Day {av.day} ({av.startTime} - {av.endTime})</span>
                              <button
                                type="button"
                                onClick={() => removeAvailability(int.id, av.id)}
                                className="hover:text-error-red ml-1"
                                title="Remove window"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAvailFormData({
                              interviewerId: int.id,
                              day: 1,
                              date: "2026-11-10",
                              startTime: "09:00",
                              endTime: "13:00",
                            });
                            setIsAvailModalOpen(true);
                          }}
                          className="text-xs"
                        >
                          + Add Window
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Room Modal */}
      <Dialog
        open={isRoomModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsRoomModalOpen(false);
        }}
      >
        <DialogContent maxWidth="md" onClose={() => setIsRoomModalOpen(false)}>
          <form onSubmit={handleSaveRoom} className="space-y-4 text-left">
            <DialogHeader>
              <DialogTitle>{editingRoom ? "Edit Room Details" : "Register Interview Room"}</DialogTitle>
              <DialogDescription>
                Define venue identification, building location, and seating capacities.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="rounded bg-error-red/10 border border-error-red/30 p-2 text-xs text-error-red">
                {formError}
              </div>
            )}

            <Input
              label="Room Title / Designation"
              placeholder="e.g. Hall 3, Block B"
              value={roomFormData.name}
              onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Building / Facility"
                placeholder="e.g. Academic Complex B"
                value={roomFormData.building}
                onChange={(e) => setRoomFormData({ ...roomFormData, building: e.target.value })}
                required
              />
              <Input
                label="Floor / Wing"
                placeholder="e.g. 2nd Floor, Wing A"
                value={roomFormData.floor}
                onChange={(e) => setRoomFormData({ ...roomFormData, floor: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-heading mb-1.5">
                  Seating Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={roomFormData.capacity}
                  onChange={(e) => setRoomFormData({ ...roomFormData, capacity: Number(e.target.value) })}
                  className="w-full h-10 rounded border border-soft-border bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-heading mb-1.5">
                  Initial Status
                </label>
                <select
                  value={roomFormData.isAvailable ? "true" : "false"}
                  onChange={(e) => setRoomFormData({ ...roomFormData, isAvailable: e.target.value === "true" })}
                  className="w-full h-10 rounded border border-soft-border bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
                >
                  <option value="true">Available for Allocation</option>
                  <option value="false">Unavailable / Offline</option>
                </select>
              </div>
            </div>

            <Input
              label="Equipment (Comma separated)"
              placeholder="e.g. Whiteboard, AV Screen, Microphone"
              value={roomFormData.equipmentStr}
              onChange={(e) => setRoomFormData({ ...roomFormData, equipmentStr: e.target.value })}
            />

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsRoomModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Check className="h-3.5 w-3.5 mr-1" />
                {editingRoom ? "Save Changes" : "Save Room"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Availability Modal */}
      <Dialog
        open={isAvailModalOpen}
        onOpenChange={(open) => {
          if (!open) setIsAvailModalOpen(false);
        }}
      >
        <DialogContent maxWidth="md" onClose={() => setIsAvailModalOpen(false)}>
          <form onSubmit={handleSaveAvailability} className="space-y-4 text-left">
            <DialogHeader>
              <DialogTitle>Add Panel Availability Window</DialogTitle>
              <DialogDescription>
                Define operational hours for interview panel evaluations.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="rounded bg-error-red/10 border border-error-red/30 p-2 text-xs text-error-red">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-heading mb-1.5">
                Panelist
              </label>
              <select
                value={availFormData.interviewerId}
                onChange={(e) => setAvailFormData({ ...availFormData, interviewerId: e.target.value })}
                className="w-full h-10 rounded border border-soft-border bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
              >
                {interviewers.map((i) => (
                  <option key={i.id} value={i.id}>{i.name} ({i.department})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal font-heading mb-1.5">
                  Drive Day Number
                </label>
                <input
                  type="number"
                  min={1}
                  max={7}
                  value={availFormData.day}
                  onChange={(e) => setAvailFormData({ ...availFormData, day: Number(e.target.value) })}
                  className="w-full h-10 rounded border border-soft-border bg-white px-3 text-xs text-charcoal font-body focus:outline-none focus:ring-1 focus:ring-muted-cobalt"
                  required
                />
              </div>

              <Input
                type="date"
                label="Date"
                value={availFormData.date}
                onChange={(e) => setAvailFormData({ ...availFormData, date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="time"
                label="Start Time"
                value={availFormData.startTime}
                onChange={(e) => setAvailFormData({ ...availFormData, startTime: e.target.value })}
                required
              />
              <Input
                type="time"
                label="End Time"
                value={availFormData.endTime}
                onChange={(e) => setAvailFormData({ ...availFormData, endTime: e.target.value })}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAvailModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                <Check className="h-3.5 w-3.5 mr-1" />
                Register Window
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
