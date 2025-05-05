import { Sidebar } from "@/components/sidebar";
import { RightSidebar } from "@/components/right-sidebar";
// import { ChatInterface } from "@/components/chatbox";
import ClientHome from "@/components/clientHome"; 
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/options";
import createClient from "@/lib/supabase";
export default async function Home() {
  const session = await getServerSession(authOptions);
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  // console.log("User in the page",user);
  return (
    <div className="flex h-screen bg-gray-50">
      {user.user ? <Sidebar user={user.user} /> : null}
      <ClientHome />
      <RightSidebar session={session} />
      {/* <ChatInterface /> */}
    </div>
  );
}
