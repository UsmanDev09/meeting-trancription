"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarIcon, Video, ChevronDown, ChevronUp, RefreshCcw, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { signIn } from "next-auth/react"
import CalendarEventsList from "./calendarEventsList"
import { ActionItems } from "./actionItems"
import MeetingBotInput from "./MeetingBotInput"

export function RightSidebar({ session }: any) {
  const [activeTab, setActiveTab] = useState("meetings")
  const [collapsed, setCollapsed] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarVisible, setCalendarVisible] = useState(true)
  const [events, setEvents] = useState<any[]>([])

  const handleSignIn = async () => {
    await signIn("google")
  }
  const handleToday = () => {
    const today = new Date()
    setDate(today)
    setCurrentMonth(today)
  }
  const fetchCalendarEvents = async () => {
    console.log("session in fetch calendar events", session)
    if (session) {
      try {
        const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        })
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        console.log("events data", data)
        setEvents(data.items || [])
      } catch (error) {
        console.error("Error fetching calendar events:", error)
      }
    }
  }

  React.useEffect(() => {
    fetchCalendarEvents()
  }, [session])

  return (
    <div
      className={cn(
        "border-l bg-white flex flex-col h-screen transition-all duration-300",
        collapsed ? "w-12" : "w-[25%]"
      )}
    >
      <div className="flex border-b">
        {!collapsed && (
          <>
            <Button
              variant={activeTab === "meetings" ? "default" : "ghost"}
              className={`relative flex-1 rounded-none ${
                activeTab === "meetings"
                  ? "after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-purple-500"
                  : ""
              }`}
              onClick={() => setActiveTab("meetings")}
            >
              Meetings
            </Button>

            <Button
              variant={activeTab === "calendar" ? "default" : "ghost"}
              className={`relative flex-1 rounded-none ${
                activeTab === "calendar"
                  ? "after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-purple-500"
                  : ""
              }`}
              onClick={() => setActiveTab("calendar")}
            >
              Calendar
            </Button>
            <Button
              variant={activeTab === "actions" ? "default" : "ghost"}
              className={`relative flex-1 rounded-none ${
                activeTab === "actions"
                  ? "after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-full after:bg-purple-500"
                  : ""
              }`}
              onClick={() => setActiveTab("actions")}
            >
              Actions
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className=""
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <Image
              src={"/navigateleft.svg"}
              alt={"navigate"}
              height={25}
              width={25}
            />
          ) : (
            <Image
              src={"/navigateright.svg"}
              alt={"navigate"}
              height={25}
              width={25}
            />
          )}
        </Button>
      </div>

      {!collapsed && (
        <div className="p-6 space-y-6">
          {activeTab === "meetings" && (
            <div>
              <div>
                <h2 className="text-xl font-semibold mb-2">
                  Record a live meeting
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Works with Zoom, Google Meet, or Microsoft Teams
                </p>
                <MeetingBotInput />
              </div>

              {/* <div className="mt-6 border-t pt-6">
                <h2 className="text-xl font-semibold mb-2">
                  Use AI Bot for Meeting Notes
                </h2>
                <p className="text-sm text-gray-500 mb-4">
                  Our bot will join Google Meet and capture the transcript automatically
                </p>
                
              </div> */}

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">
                  Record scheduled meetings
                </h2>
                <div className="space-y-4 border border-gray-200 rounded-xl p-[4%]">
                  <div className="">
                    <h3 className="font-medium mb-2">AI Notetaker settings</h3>
                    <p className="text-sm font-semibold">Otter will join:</p>
                    <div className="flex items-center mt-2">
                      <Video className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">
                        Meetings with a video conference link
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm mb-2 font-semibold">
                      Share notes with
                    </p>
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">Calendar invite guests</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Looks like you don&apos;t have any upcoming meetings with a
                  conferencing link from
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  You can connect to additional calendars.
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSignIn}
                    className="flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                  <Button variant="outline" className="text-sm">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4 mr-2"
                      fill="#00A4EF"
                    >
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M21.53 4.306v15.363q0 .807-.576 1.383l-3.723 3.723q-.576.576-1.383.576H3.557q-.807 0-1.383-.576l-3.723-3.723q-.576-.576-.576-1.383V4.306q0-.807.576-.576L3.557.176q.576-.576 1.383-.576h12.318q.807 0 1.383.576l3.723 3.723q.576.576.576 1.383zm-18.753 0v15.363h15.363V4.306H2.777z" />
                    </svg>
                    Outlook
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {format(currentMonth, "MMM yyyy")}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={handleToday}
                  >
                    <RefreshCcw className="h-4 w-4" />
                    <span>Today</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {calendarVisible && (
                <>
                  <div className="w-full">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      month={currentMonth}
                      onMonthChange={setCurrentMonth}
                      classNames={{
                        day_selected:
                          "bg-purple-500 rounded-full text-primary-foreground hover:bg-purple-600 hover:text-primary-foreground focus:bg-purple-600 focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        head_cell:
                          "text-muted-foreground font-normal text-center w-12",
                        cell: "h-10 w-12 text-center p-0 relative [&:has([aria-selected])]:bg-accent rounded-full first:[&:has([aria-selected])]:rounded-full last:[&:has([aria-selected])]:rounded-full focus-within:relative focus-within:z-20",
                        day: "h-10 w-12 p-0 font-normal aria-selected:opacity-100",
                        caption:
                          "flex justify-center pt-1 relative items-center",
                        table: "w-full border-collapse space-y-1",
                      }}
                    />
                  </div>
                </>
              )}
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setCalendarVisible(!calendarVisible)}
                >
                  {calendarVisible ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="space-y-4">
                {session ? (
                  <div className="overflow-y-auto h-44 p-2">
                    {events.length > 0 ? (
                      <CalendarEventsList events={events} />
                    ) : (
                      <p>No events found.</p>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={handleSignIn}
                    className="flex items-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Sign in with Google
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeTab === "actions" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Actions</h2>
              <ActionItems />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
