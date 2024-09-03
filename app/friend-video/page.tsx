import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
import FriendVideo from "./FriendVideo";
import FriendsButton from "@/components/friends/FriendsButton";
import Sidebar from "@/components/Sidebar";

export default async function Page() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <FriendVideo />
      <div>
        <FriendsButton user={user as User} />
      </div>
    </>
  );
}
