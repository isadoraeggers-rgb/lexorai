"use client";

import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventDropArg } from "@fullcalendar/core";
import { toast } from "sonner";
import { rescheduleEvent } from "@/lib/actions/calendar";
import type { CalendarEvent } from "@/lib/data/calendar";

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const router = useRouter();

  async function handleDrop(info: EventDropArg) {
    try {
      await rescheduleEvent(info.event.id, info.event.start!.toISOString());
      toast.success("Reagendado com sucesso");
      router.refresh();
    } catch {
      info.revert();
      toast.error("Não foi possível reagendar");
    }
  }

  return (
    <div className="lexora-calendar rounded-2xl border border-border bg-card p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,listWeek",
        }}
        buttonText={{ today: "Hoje", month: "Mês", week: "Semana", list: "Agenda" }}
        locale="pt-br"
        height="auto"
        editable
        droppable
        eventDrop={handleDrop}
        events={events}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          const href = info.event.extendedProps.href as string;
          if (href) router.push(href);
        }}
      />
    </div>
  );
}
