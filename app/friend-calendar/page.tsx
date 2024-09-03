import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
import FriendCalendar from "./FriendCalendar";
import FriendsButton from "@/components/friends/FriendsButton";

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <FriendCalendar />
      <div className="justify-center">
        <FriendsButton user={user as User} />
      </div>
    </>
  );
}
