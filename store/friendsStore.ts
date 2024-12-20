import { create } from 'zustand';
import { createClient } from "@/utils/supabase/client";
import { 
  FriendData, 
  Team, 
  FriendsStore, 
  FriendRecord, 
  TeamDataResponse, 
  TeamMemberRecord 
} from '@/types/friend';

const CACHE_DURATION = 5 * 60 * 1000; // 5分のキャッシュ

export const useFriendsStore = create<FriendsStore>((set, get) => ({
  friends: [],
  teams: [],
  isLoading: false,
  lastFetched: null,

  fetchFriendsAndTeams: async (userId: string) => {
    const now = Date.now();
    const lastFetched = get().lastFetched;

    if (lastFetched && now - lastFetched < CACHE_DURATION) {
      return;
    }

    set({ isLoading: true });
    const supabase = createClient();

    try {
      // フレンドデータの取得
      const { data: friendsData, error: friendsError } = await supabase
        .from("friends")
        .select<string, FriendRecord>(`
          id,
          status,
          requester_id,
          recipient_id,
          requester:profiles!requester_id(username, avatar_url),
          recipient:profiles!recipient_id(username, avatar_url)
        `)
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

      if (friendsError) throw friendsError;

      // チームデータの取得
      const { data: teamsData, error: teamsError } = await supabase
        .from("team_members")
        .select<string, TeamDataResponse>(`
          team_id,
          teams(id, name)
        `)
        .eq("user_id", userId)
        .eq("status", "accepted");

      if (teamsError) throw teamsError;

      // フレンドデータの整形
      const formattedFriends: FriendData[] = await Promise.all(
        friendsData.map(async (friend) => {
          const isRequester = friend.requester_id === userId;
          const avatarPath = isRequester
            ? friend.recipient.avatar_url
            : friend.requester.avatar_url;

          let avatar_url = null;
          if (avatarPath) {
            try {
              const { data: downloadData } = await supabase.storage
                .from("avatars")
                .download(avatarPath);
              if (downloadData) {
                avatar_url = URL.createObjectURL(downloadData as Blob);
              }
            } catch (error) {
              console.error("Error downloading image: ", error);
            }
          }

          return {
            id: friend.id,
            username: isRequester
              ? friend.recipient.username
              : friend.requester.username,
            avatar_url,
            status: friend.status,
            type: isRequester ? "sent" : "received",
            user_id: isRequester ? friend.recipient_id : friend.requester_id,
          };
        })
      );

      // チームデータの整形
      const formattedTeams: Team[] = await Promise.all(
        teamsData.map(async (item) => {
          const { data: membersData } = await supabase
            .from("team_members")
            .select<string, TeamMemberRecord>(`
              user_id,
              profiles(username, avatar_url)
            `)
            .eq("team_id", item.team_id)
            .eq("status", "accepted");

          const members = await Promise.all(
            membersData?.map(async (member) => {
              const profile = member.profiles;
              let avatar_url = null;

              if (profile.avatar_url) {
                try {
                  const { data: downloadData } = await supabase.storage
                    .from("avatars")
                    .download(profile.avatar_url);
                  if (downloadData) {
                    avatar_url = URL.createObjectURL(downloadData as Blob);
                  }
                } catch (error) {
                  console.error("Error downloading image: ", error);
                }
              }

              return {
                id: member.user_id,
                username: profile.username,
                avatar_url,
                user_id: member.user_id,
              };
            }) || []
          );

          return {
            id: item.team_id,
            name: item.teams.name,
            members,
          };
        })
      );

      set({
        friends: formattedFriends,
        teams: formattedTeams,
        lastFetched: now,
        isLoading: false,
      });
    } catch (error) {
      console.error('データ取得エラー:', error);
      set({ isLoading: false });
    }
  },

  clearStore: () => {
    set({
      friends: [],
      teams: [],
      lastFetched: null,
    });
  },
}));