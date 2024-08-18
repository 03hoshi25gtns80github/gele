import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MyCalendar from "./MyCalendar";
import FriendsButton from "@/components/friends/FriendsButton";

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header id={user?.id || ""} />
      <Sidebar />
      <div className="justify-center">
        <div className="mt-6 flex flex-col items-center">
          <MyCalendar initialUser={user as User} />
        </div>
        <div>
          <FriendsButton user={user as User} />
        </div>
      </div>
    </>
  );
}