export type CommunityPrivacy = 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
export type CommunityRole    = 'OWNER' | 'MODERATOR' | 'MEMBER';

export interface Community {
  id:               string;
  name:             string;
  slug:             string;
  description:      string | null;
  avatarUrl:        string | null;
  bannerUrl:        string | null;
  privacy:          CommunityPrivacy;
  ownerId:          string;
  ownerUsername:    string;
  ownerDisplayName: string | null;
  ownerAvatarUrl:   string | null;
  membersCount:     number;
  postsCount:       number;
  member:           boolean;
  myRole:           CommunityRole | null;
  createdAt:        string;
  updatedAt:        string;
}

export interface CommunityMember {
  userId:      string;
  username:    string;
  displayName: string | null;
  avatarUrl:   string | null;
  role:        CommunityRole;
  joinedAt:    string;
}

export const PRIVACY_LABELS: Record<CommunityPrivacy, string> = {
  PUBLIC:       'Public',
  PRIVATE:      'Private',
  INVITE_ONLY:  'Invite only',
};
