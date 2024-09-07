import AccountForm from "./account-form";
import Header from "@/components/Header";
import { createClient } from "@/utils/supabase/server";
import TeamForm from "@/components/team/TeamForm";
import TeamCreate from "@/components/team/TeamCreate";

export default async function Account() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header id={user?.id || ""} />
      <div className="mt-2 mb-24 justify-center">
        <AccountForm user={user} />
        <TeamForm user={user} />
        <TeamCreate user={user} />
      </div>
    </>
  );
}