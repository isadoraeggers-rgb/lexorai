import { getCalendarEvents } from "@/lib/data/calendar";
import { PageHeader } from "@/components/shared/page-header";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
  const events = await getCalendarEvents();

  return (
    <div>
      <PageHeader
        title="Calendário"
        description="Prazos, audiências e tarefas em um só lugar. Arraste para reagendar."
      />
      <CalendarView events={events} />
    </div>
  );
}
