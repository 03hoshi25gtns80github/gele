import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
import FriendVideo from "./FriendVideo";
import FriendsButton from "@/components/friends/FriendsButton";

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
