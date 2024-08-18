import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
import Sidebar from "@/components/Sidebar";
import FriendCalendar from "./FriendCalendar";
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
          <FriendCalendar />
        </div>
        <div>
          <FriendsButton user={user as User} />
        </div>
      </div>
    </>
  );
}
