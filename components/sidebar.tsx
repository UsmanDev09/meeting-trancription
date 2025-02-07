"use client";

import { useState } from "react";
import {
  Home,
  Search,
  Layout,
  Bell,
  Bot,
  UserPlus,
  UserPlus2,
  
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

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
                    <p className="text-sm font-medium">Ghost</p>
                    <p className="text-xs text-gray-500">demo@gmail.com</p>
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
      </nav>
    </div>
  );
}
