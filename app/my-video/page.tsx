import { createClient } from "@/utils/supabase/server";
import MyVideo from "./MyVideo";

export default async function Page() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <MyVideo user={user} />;
}
