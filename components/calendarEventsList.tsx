import React from "react";
import { format, isToday, isTomorrow, addDays, isSameDay } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User } from "lucide-react";

const CalendarEventsList = ({ events }: { events: any[] }) => {
  const today = new Date();
  const next5Days = Array.from({ length: 5 }, (_, i) => addDays(today, i));

  const getEventsForDate = (date: Date) => {
    return events.filter((event: any) => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return isSameDay(eventDate, date);
    });
  };

  const formatEventTime = (dateTime: string) => {
    return format(new Date(dateTime), "h:mma").toLowerCase();
  };

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMM d");
  };

  return (
    <div className="space-y-6">
      {next5Days.map((date) => {
        const dayEvents = getEventsForDate(date);

        return (
          <div key={date.toISOString()}>
            <h3 className="text-lg font-semibold mb-3">{getDayLabel(date)}</h3>
            {dayEvents.length > 0 ? (
              <div className="space-y-3">
                {dayEvents.map((event: any) => (
                  <Card
                    key={event.id}
                    className="shadow-sm hover:cursor-pointer hover:bg-gray-100"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-500 border-b border-gray-200">
                          <Clock className="h-4 w-4 mr-2" />
                          {formatEventTime(event.start.dateTime)} -{" "}
                          {formatEventTime(event.end.dateTime)}
                        </div>
                        <div className="font-medium text-gray-900">
                          {event.summary}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2" />
                          Share
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No events scheduled</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarEventsList;
