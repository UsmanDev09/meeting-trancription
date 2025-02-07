"use client";

import { useState } from "react";
import { HomeTab } from "@/components/tabs/homeTab";
import { MyConversationsTab } from "@/components/tabs/myConversationsTab";
import { AllConversationsTab } from "@/components/tabs/allConversationsTab";
import { SharedTab } from "@/components/tabs/sharedTab";
import { TrashTab } from "@/components/tabs/trashTab";
import { Header } from "@/components/header";

export default function ClientHome() {
  const [activeSection, setActiveSection] = useState("Home");

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
    </div>
  );
}
