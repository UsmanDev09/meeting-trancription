"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Search,
  Layout,
  Bell,
  Bot,
  UserPlus,
  UserPlus2,
  FileText,
  BarChart,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface User {
  name?: string;
  email?: string;
}

export function Sidebar({ user }: { user: User }) {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(()=>{
    
  },[])
  return (
    <div
      className={cn(
        "h-screen border-r flex flex-col relative transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          {!collapsed && <h1>Logo</h1>}
          <div
            className={
              `flex items-center` +
              (collapsed ? "flex flex-col justify-center items-center" : "")
            }
          >
            <Button variant="ghost" size="icon" className="bg-transparent">
              <Bell className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-transparent"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <Image
                  src={"/navigateright.svg"}
                  alt={"navigate"}
                  height={25}
                  width={25}
                />
              ) : (
                <Image
                  src={"/navigateleft.svg"}
                  alt={"navigate"}
                  height={25}
                  width={25}
                />
              )}
            </Button>
          </div>
        </div>

        <div className="p-1">
          {collapsed ? (
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
              G
            </div>
          ) : (
            <>
              <div className="border border-gray-300 rounded-xl overflow-hidden">
                <div className="flex items-center space-x-2 border-b border-gray-300 p-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
                    G
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user?.name || "User"}</p>
                    <p className="text-xs text-gray-500">{user?.email || "demo@gmail.com"}</p>
                  </div>
                </div>

                <div className="flex justify-center items-center space-x-2 p-3 hover:cursor-pointer hover:bg-gray-100">
                  <div className=" flex items-center justify-center">
                    <UserPlus2 className="w-5 h-5"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Invite Teammates</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/"
          className={cn(
            "flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100",
            collapsed && "justify-center"
          )}
        >
          <Home className="w-5 h-5" />
          {!collapsed && <span>Home</span>}
        </Link>
        <Link
          href="/chat"
          className={cn(
            "flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100",
            collapsed && "justify-center"
          )}
        >
          <Bot className="w-5 h-5" />
          {!collapsed && <span>Ai Chat</span>}
        </Link>
        <Link
          href="/search"
          className={cn(
            "flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100",
            collapsed && "justify-center"
          )}
        >
          <Search className="w-5 h-5" />
          {!collapsed && <span>Search</span>}
        </Link>
        <Link
          href="/apps"
          className={cn(
            "flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100",
            collapsed && "justify-center"
          )}
        >
          <Layout className="w-5 h-5" />
          {!collapsed && <span>Apps</span>}
        </Link>
        <Link
          href="/analytics"
          className={cn(
            "flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100",
            collapsed && "justify-center"
          )}
        >
          <BarChart className="w-5 h-5" />
          {!collapsed && <span>Analytics</span>}
        </Link>
        {/* <Link
          href="/transcripts"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 ",
           "bg-gray-100 text-gray-900"
          )}
        >
          <FileText className="h-4 w-4" />
          Transcripts
        </Link> */}
      </nav>
    </div>
  );
}
