export interface FriendData {
    id: string;
    username: string;
    avatar_url: string | null;
    status: "pending" | "accepted";
    type: "sent" | "received";
    user_id: string;
  }
  
  export interface TeamMember {
    id: string;
    username: string;
    avatar_url: string | null;
    user_id: string;
  }
  
  export interface Team {
    id: string;
    name: string;
    members: TeamMember[];
  }
  
  // Supabaseのレスポンス型
  export interface TeamDataResponse {
    team_id: string;
    teams: {
      id: string;
      name: string;
    };
  }
  
  // Supabaseのフレンドレコード型
  export interface FriendRecord {
    id: string;
    status: "pending" | "accepted";
    requester_id: string;
    recipient_id: string;
    requester: {
      username: string;
      avatar_url: string | null;
    };
    recipient: {
      username: string;
      avatar_url: string | null;
    };
  }
  
  // Supabaseのチームメンバーレコード型
  export interface TeamMemberRecord {
    user_id: string;
    profiles: {
      username: string;
      avatar_url: string | null;
    };
  }
  
  // ストアの型
  export interface FriendsStore {
    friends: FriendData[];
    teams: Team[];
    isLoading: boolean;
    lastFetched: number | null;
    fetchFriendsAndTeams: (userId: string) => Promise<void>;
    clearStore: () => void;
  }