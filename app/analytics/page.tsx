"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from '@/redux/hooks';
import { RootState } from "@/redux/store";
import { Sidebar } from "@/components/sidebar";
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

interface AnalyticsData {
  id: number;
  uuid: string;
  event_type: string;
  created_at: string;
  meeting_id: string;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all analytics events without filtering by user
        const response = await fetch('/api/analytics');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch analytics: ${response.status}`);
        }
        
        const data = await response.json();
        setAnalyticsData(data);
        
        // Calculate event type counts
        const counts: Record<string, number> = {};
        data.forEach((item: AnalyticsData) => {
          const eventType = item.event_type;
          counts[eventType] = (counts[eventType] || 0) + 1;
        });
        setEventCounts(counts);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: "Error",
          description: "Failed to fetch analytics data",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar user={{ name: user?.name || "User", email: user?.email || "demo@gmail.com" }} />
      
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Events</CardTitle>
                  <CardDescription>All recorded analytics events</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-purple-600">{analyticsData.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Unique Meetings</CardTitle>
                  <CardDescription>Total number of meetings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-purple-600">
                    {new Set(analyticsData.map(item => item.meeting_id)).size}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Event Types</CardTitle>
                  <CardDescription>Different types of events</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-purple-600">
                    {Object.keys(eventCounts).length}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Event Type Distribution</CardTitle>
                <CardDescription>Breakdown of event types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(eventCounts).map(([eventType, count]) => (
                    <div key={eventType} className="flex items-center justify-between">
                      <span className="font-medium">{eventType}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-purple-600 h-2.5 rounded-full" 
                            style={{ width: `${Math.round((count / analyticsData.length) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500">{count} ({Math.round((count / analyticsData.length) * 100)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>All Analytics Events</CardTitle>
                <CardDescription>Complete list of recorded events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event Type</TableHead>
                        <TableHead>Meeting ID</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>UUID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyticsData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                              {item.event_type}
                            </span>
                          </TableCell>
                          <TableCell>{item.meeting_id}</TableCell>
                          <TableCell>
                            {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                          <TableCell className="text-xs text-gray-500 truncate max-w-[150px]">
                            {item.uuid}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 