import { createClient } from "@/utils/supabase/server";
import { type User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import MyCalendar from "./MyCalendar";
import FriendsButton from "@/components/friends/FriendsButton";
import { redirect } from 'next/navigation';

async function getUserProfile(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('プロフィール取得エラー:', error);
    return null;
  }

  return data;
}

export default async function Page() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await getUserProfile(user.id);
    if (!profile || !profile.username) {
      redirect('/account');
    }
  }

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