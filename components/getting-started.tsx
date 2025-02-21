"use client"

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2Icon } from 'lucide-react'

export function GettingStarted() {
  return (
    <Card className="p-6 w-[90%]">
      <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
      <p className="mb-6">
        Learn the basics of using the app in just a few minutes!
      </p>
      <div className="w-full bg-purple-200 rounded-full h-2">
        <div
          className="bg-purple-500 h-2 rounded-full"
          style={{ width: "20%" }}
        ></div>
      </div>
      <div className="w-full h-px bg-gray-200 my-4 mb-4"></div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="stroke-black text-gray-400 line-through">
            Connect your calendar to organize your day
          </span>
          <CheckCircle2Icon className="text-green-500 w-10 h-10" />
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold">Learn the basics</span>
          <Button
            variant="default"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl w-15 h-8"
          >
            Start
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-semibold">Record your first conversation</span>
          <Button
            variant="default"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl w-15 h-8"
          >
            Start
          </Button>
        </div>
      </div>
    </Card>
  );
}