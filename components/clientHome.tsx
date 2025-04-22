"use client";

import { useEffect, useState } from "react";
import { HomeTab } from "@/components/tabs/homeTab";
import { MyConversationsTab } from "@/components/tabs/myConversationsTab";
import { AllConversationsTab } from "@/components/tabs/allConversationsTab";
import { SharedTab } from "@/components/tabs/sharedTab";
import { TrashTab } from "@/components/tabs/trashTab";
import { Header } from "@/components/header";
import { NavigationDock } from "./navigationDock";
import supabase from "@/lib/supabase";

export default function ClientHome() {
  const [activeSection, setActiveSection] = useState("Home");

  // const [connectionStatus, setConnectionStatus] = useState('Checking...');
  
  // useEffect(() => {
  //   const checkConnection = async () => {
  //     const { data, error } = await supabase
  //       .from('analytics')
  //       .select('*')
  //       .limit(1);

  //     if (error) {
  //       setConnectionStatus('Connection Failed');
  //       console.error('Supabase connection error:', error);
  //     } else {
  //       setConnectionStatus('Connected Successfully');
  //       console.log('Supabase connected successfully:', data);
  //     }
  //   };

  //   checkConnection();
  // }, []);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "Home":
        return <HomeTab />;
      case "My Conversations":
        return <MyConversationsTab />;
      case "All Conversations":
        return <AllConversationsTab />;
      case "Shared with Me":
        return <SharedTab />;
      case "Trash":
        return <TrashTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="flex-1 p-6 overflow-auto">{renderActiveSection()}</main>
      
      <NavigationDock />
    </div>
  );
}
