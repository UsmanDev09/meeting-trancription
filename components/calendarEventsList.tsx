import React, { useState } from "react";
import { format, isToday, isTomorrow, addDays, isSameDay, parseISO, isAfter, addMinutes, differenceInMinutes } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, User, Video, Bot } from "lucide-react";
import { RRule } from 'rrule';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CalendarEventsList = ({ events }: { events: any[] }) => {
  console.log("Events in calendar", events);
  const today = new Date();
  const next5Days = Array.from({ length: 5 }, (_, i) => addDays(today, i));
  
  // Store auto-join preferences for each event
  const [autoJoinSettings, setAutoJoinSettings] = useState<Record<string, boolean>>({});
  
  // Track meetings that are being joined by the bot
  const [activeJoins, setActiveJoins] = useState<Record<string, boolean>>({});

  const getEventsForDate = (date: Date) => {
    const dayEvents = [];
    
    for (const event of events) {
      // Handle single (non-recurring) events
      if (!event.recurrence) {
        const eventDate = new Date(event.start.dateTime || event.start.date);
        if (isSameDay(eventDate, date)) {
          dayEvents.push(event);
        }
        continue;
      }
      
      // Handle recurring events
      try {
        const recurrenceRule = event.recurrence[0];
        if (recurrenceRule && recurrenceRule.startsWith('RRULE:')) {
          const rruleString = recurrenceRule.substring(6); // Remove 'RRULE:' prefix
          
          // Parse the start date of the original event
          const eventStartDate = new Date(event.start.dateTime || event.start.date);
          
          // Create RRule object with the start date as dtstart
          const rule = RRule.fromString(rruleString);
          rule.options.dtstart = eventStartDate;
          
          // Get all occurrences between today and 30 days from now (to not calculate too many)
          const endRange = addDays(today, 30);
          const occurrences = rule.between(today, endRange, true);
          
          // Check if any occurrence is on this date
          for (const occurrence of occurrences) {
            if (isSameDay(occurrence, date)) {
              // Create a copy of the event with the specific occurrence date
              const eventCopy = { ...event };
              
              // Update the start and end times for this occurrence
              if (event.start.dateTime) {
                const originalStart = new Date(event.start.dateTime);
                const originalEnd = new Date(event.end.dateTime);
                const durationMs = originalEnd.getTime() - originalStart.getTime();
                
                const occurrenceStart = new Date(occurrence);
                occurrenceStart.setHours(originalStart.getHours());
                occurrenceStart.setMinutes(originalStart.getMinutes());
                
                const occurrenceEnd = new Date(occurrenceStart.getTime() + durationMs);
                
                eventCopy.start = { 
                  ...event.start, 
                  dateTime: occurrenceStart.toISOString() 
                };
                eventCopy.end = { 
                  ...event.end, 
                  dateTime: occurrenceEnd.toISOString() 
                };
              }
              
              // Generate a unique ID for this occurrence
              const occurrenceId = `${event.id}-${occurrence.toISOString()}`;
              eventCopy.occurrenceId = occurrenceId;
              
              // Add this occurrence to our events for this day
              dayEvents.push(eventCopy);
              break;
            }
          }
        }
      } catch (error) {
        console.error("Error processing recurring event:", error);
      }
    }
    
    return dayEvents;
  };

  const formatEventTime = (dateTime: string) => {
    return format(new Date(dateTime), "h:mma").toLowerCase();
  };

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEEE, MMM d");
  };
  
  // Function to toggle auto-join for a meeting
  const toggleAutoJoin = (eventId: string) => {
    setAutoJoinSettings(prev => ({
      ...prev,
      [eventId]: prev[eventId] === undefined ? false : !prev[eventId]
    }));
  };
  
  // Function to manually join a meeting
  const joinMeeting = async (event: any) => {
    if (!event.hangoutLink) return;
    
    try {
      // In a real implementation, you would call your API to make the bot join
      console.log(`Bot is joining meeting: ${event.summary}`);
      
      // Update active joins state
      setActiveJoins(prev => ({
        ...prev,
        [event.occurrenceId || event.id]: true
      }));
      
      // Simulate the meeting ending after the scheduled duration
      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      
      setTimeout(() => {
        console.log(`Bot leaving meeting: ${event.summary}`);
        setActiveJoins(prev => ({
          ...prev,
          [event.occurrenceId || event.id]: false
        }));
      }, durationMs);
      
    } catch (error) {
      console.error("Error joining meeting:", error);
    }
  };
  
  // Function to schedule auto-joining for upcoming meetings
  const scheduleAutoJoins = () => {
    for (const date of next5Days) {
      const dayEvents = getEventsForDate(date);
      
      for (const event of dayEvents) {
        const eventId = event.occurrenceId || event.id;
        
        // Skip if auto-join is disabled for this event
        if (autoJoinSettings[eventId] === false) continue;
        
        // Skip if there's no hangout link
        if (!event.hangoutLink) continue;
        
        const startTime = new Date(event.start.dateTime);
        
        // If the meeting is in the future and within the next 24 hours
        if (isAfter(startTime, new Date()) && differenceInMinutes(startTime, new Date()) <= 1440) {
          // Calculate time until meeting starts
          const timeUntilMeeting = startTime.getTime() - new Date().getTime();
          
          // Schedule the bot to join at the meeting start time
          setTimeout(() => {
            // Only join if auto-join is still enabled when the timeout fires
            if (autoJoinSettings[eventId] !== false) {
              joinMeeting(event);
            }
          }, timeUntilMeeting);
        }
      }
    }
  };
  
  // Call the schedule function on first render
  React.useEffect(() => {
    // Initialize auto-join settings to be enabled by default
    const initialSettings: Record<string, boolean> = {};
    
    for (const date of next5Days) {
      const dayEvents = getEventsForDate(date);
      for (const event of dayEvents) {
        if (event.hangoutLink) {
          const eventId = event.occurrenceId || event.id;
          initialSettings[eventId] = true;
        }
      }
    }
    
    setAutoJoinSettings(initialSettings);
    
    // Schedule auto-joins after setting initial state
    const timeoutId = setTimeout(scheduleAutoJoins, 1000);
    
    return () => clearTimeout(timeoutId);
  }, []);
console.log("Auto joins",autoJoinSettings)
console.log("active joins",activeJoins);
  return (
    <div className="space-y-6">
      {next5Days.map((date) => {
        const dayEvents = getEventsForDate(date);

        return (
          <div key={date.toISOString()}>
            <h3 className="text-lg font-semibold mb-3">{getDayLabel(date)}</h3>
            {dayEvents.length > 0 ? (
              <div className="space-y-3">
                {dayEvents.map((event: any, index: number) => {
                  const eventId = event.occurrenceId || event.id;
                  const isAutoJoinEnabled = autoJoinSettings[eventId] !== false;
                  const isBotActive = activeJoins[eventId];
                  const startTime = new Date(event.start.dateTime);
                  const isUpcoming = isAfter(startTime, new Date());
                  const isWithin30Min = isAfter(startTime, new Date()) && 
                                       differenceInMinutes(startTime, new Date()) <= 30;
                  
                  return (
                    <Card
                      key={`${event.id}-${index}`}
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
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2" />
                              Share
                            </div>
                            {event.hangoutLink && (
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center text-blue-500">
                                  <Video className="h-4 w-4 mr-2" />
                                  <a href={event.hangoutLink} target="_blank" rel="noopener noreferrer">
                                    Join Meeting
                                  </a>
                                </div>
                                
                                {isUpcoming && (
                                  <div className="flex items-center space-x-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center space-x-2">
                                            <Switch
                                              id={`auto-join-${eventId}`}
                                              checked={isAutoJoinEnabled}
                                              onCheckedChange={() => toggleAutoJoin(eventId)}
                                            />
                                            <Label htmlFor={`auto-join-${eventId}`} className="cursor-pointer">
                                              <Bot className={`h-4 w-4 ${isAutoJoinEnabled ? 'text-green-500' : 'text-gray-400'}`} />
                                            </Label>
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{isAutoJoinEnabled ? 'Bot will join automatically' : 'Bot auto-join disabled'}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    
                                    {isBotActive && (
                                      <span className="text-green-500 text-xs font-medium">
                                        Bot active
                                      </span>
                                    )}
                                    
                                    {isWithin30Min && !isBotActive && isAutoJoinEnabled && (
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-7 px-2 text-xs"
                                        onClick={() => joinMeeting(event)}
                                      >
                                        Join Now
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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
