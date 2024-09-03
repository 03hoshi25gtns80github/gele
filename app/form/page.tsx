import Form from "@/app/form/Form";
import { createClient } from "@/utils/supabase/server";
import Header from "@/components/Header";

export default async function Account() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Header id={user?.id || ""} />
      <Form user={user} />
    </>
  );
}
