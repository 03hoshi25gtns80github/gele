import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
import Header from "@/components/Header";
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
      <div className="flex justify-center">
        <div className="mt-2 w-full max-w-screen-lg items-center z-40">
          <MyCalendar initialUser={user as User} />
        </div>
        <div className="z-60">
          <FriendsButton user={user as User} />
        </div>
      </div>
    </>
  );
}