import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
import MyCalendar from "./MyCalendar";

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <MyCalendar initialUser={user as User} />;
}
