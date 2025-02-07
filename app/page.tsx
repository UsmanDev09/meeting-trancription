import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
import { ChatInterface } from "@/components/chatbox";
import ClientHome from "@/components/clientHome"; 
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <ClientHome />
      <RightSidebar session={session} />
      <ChatInterface />
    </div>
  );
}
