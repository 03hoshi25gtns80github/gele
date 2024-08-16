import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
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
      <MyVideo user={user as User} />
      <div>
        <FormButton />
        <FriendsButton user={user as User} />
      </div>
    </>
  );
}
