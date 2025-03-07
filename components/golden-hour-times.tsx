"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sunrise, Sunset } from "lucide-react"

export function GoldenHourTimes({ goldenHourData }) {
  const formatTime = (date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date)
  }

  const isCurrentlyGoldenHour = () => {
    const now = new Date()
    return (
      (now >= goldenHourData.morningStart && now <= goldenHourData.morningEnd) ||
      (now >= goldenHourData.eveningStart && now <= goldenHourData.eveningEnd)
    )
  }

  const getNextGoldenHour = () => {
    const now = new Date()

    if (now < goldenHourData.morningStart) {
      return {
        time: formatTime(goldenHourData.morningStart),
        type: "morning",
      }
    } else if (now < goldenHourData.eveningStart) {
      return {
        time: formatTime(goldenHourData.eveningStart),
        type: "evening",
      }
    } else {
      // Next day's morning golden hour
      const tomorrow = new Date(goldenHourData.morningStart)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return {
        time: formatTime(tomorrow),
        type: "morning",
        tomorrow: true,
      }
    }
  }

  const nextGoldenHour = getNextGoldenHour()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Golden Hour Times</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
              <Sunrise className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Morning Golden Hour</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(goldenHourData.morningStart)} - {formatTime(goldenHourData.morningEnd)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-full">
              <Sunset className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Evening Golden Hour</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(goldenHourData.eveningStart)} - {formatTime(goldenHourData.eveningEnd)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            {isCurrentlyGoldenHour() ? (
              <div className="text-center">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full text-sm font-medium">
                  Golden hour is happening now!
                </span>
              </div>
            ) : (
              <div className="text-center text-sm">
                <p className="text-muted-foreground">Next golden hour:</p>
                <p className="font-medium">
                  {nextGoldenHour.type === "morning" ? "Morning" : "Evening"} at {nextGoldenHour.time}
                  {nextGoldenHour.tomorrow ? " (tomorrow)" : ""}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

