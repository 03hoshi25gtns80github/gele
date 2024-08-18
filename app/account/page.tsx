import AccountForm from "./account-form";
import Sidebar from "@/components/Sidebar";
import { createClient } from "@/utils/supabase/server";

export default async function Account() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Sidebar />
      <div className="mt-10 justify-center">
        <AccountForm user={user} />
      </div>
    </>
  );
}
