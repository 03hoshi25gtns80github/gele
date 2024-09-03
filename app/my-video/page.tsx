import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import MyVideo from "./MyVideo";
import FriendsButton from "@/components/friends/FriendsButton";
import FormButton from "@/components/ui/FormButton";

export default async function Page() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header id={user?.id || ""} />
      <MyVideo user={user as User} />
      <div>
        <FormButton />
        <FriendsButton user={user as User} />
      </div>
    </>
  );
}
