import AccountForm from "./account-form";
import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";

export default async function Account() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header id={user?.id || ""} />
      <div className="mt-2 justify-center">
        <AccountForm user={user} />
      </div>
    </>
  );
}
