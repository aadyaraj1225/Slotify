import * as React from "react";
import { Bell, CheckCheck, Clock } from "lucide-react";
import { useCandidate } from "@/context/candidate-context";
import { Button } from "@/components/ui/button";

export const CandidateNotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationCount,
  } = useCandidate();

  return (
    <div className="space-y-10 sm:space-y-12 px-6 sm:px-10 lg:px-14 py-8 sm:py-12 max-w-4xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 border-b-2 border-deep-black pb-8">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-deep-black">
            Notifications
          </h1>
          <p className="font-body text-base text-slate-gray mt-2 max-w-xl">
            Real-time alerts regarding your interview timetables, venue shifts, and self-booking confirmations.
          </p>
        </div>

        {unreadNotificationCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllNotificationsAsRead}
            className="gap-2 text-xs font-bold border-2 border-deep-black"
          >
            <CheckCheck className="h-4 w-4" />
            <span>Mark all read</span>
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="rounded-2xl border-2 border-deep-black bg-white p-12 text-center shadow-[4px_4px_0px_#101010] space-y-4">
          <div className="h-12 w-12 rounded-xl bg-warm-offwhite border-2 border-deep-black text-slate-gray mx-auto flex items-center justify-center">
            <Bell className="h-6 w-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-heading text-lg font-bold text-deep-black">
              No notifications yet
            </h3>
            <p className="font-body text-xs text-slate-gray">
              You are completely caught up. Timetable updates and booking confirmations will show up here.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => markNotificationAsRead(item.id)}
                className={`rounded-xl border-2 border-deep-black p-5 transition-all text-left flex items-start justify-between gap-4 cursor-pointer ${
                  item.read
                    ? "bg-white opacity-80 shadow-[2px_2px_0px_#101010]"
                    : "bg-white shadow-[4px_4px_0px_#D7FF35] ring-1 ring-deep-black"
                }`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-hot-pink shrink-0" />
                    )}
                    <h4 className="font-heading font-black text-sm text-deep-black">
                      {item.title}
                    </h4>
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-gray bg-warm-offwhite px-2 py-0.5 rounded border border-deep-black/30">
                      {item.type}
                    </span>
                  </div>
                  <p className="font-body text-xs text-slate-gray leading-relaxed">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-gray/70 pt-1">
                    <Clock className="h-3 w-3" />
                    <span>{item.timestamp}</span>
                  </div>
                </div>

                {!item.read && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(item.id);
                    }}
                    className="text-[10px] font-mono font-bold text-slate-gray hover:text-deep-black underline shrink-0 mt-1"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Demo Discloser */}
      <div className="rounded-xl border-2 border-deep-black bg-warm-offwhite p-4 text-[11px] font-mono text-slate-gray">
        Notice: In this demo environment, notifications are generated in response to client scheduling actions. Email dispatch services connect during Phase 5.
      </div>
    </div>
  );
};
