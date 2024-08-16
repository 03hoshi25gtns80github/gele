import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
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
      <Sidebar />
      <div className="justify-center">
        <div className="w-full max-w-screen-lg mx-auto justify-center">
          <MyCalendar initialUser={user as User} />
        </div>
        <div>
          <FriendsButton user={user as User} />
        </div>
      </div>
    </>
  );
}