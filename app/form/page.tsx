import Form from "@/app/form/Form";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function Account() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Sidebar />
      <Form user={user} />
    </>
  );
}
