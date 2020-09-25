export enum TeamType {
  Public = 'O',
  Private = 'P',
}

export type TTeamType = TeamType.Public | TeamType.Private;

export type TTeam = {
  id: number;
  creator: number;
  created: string;
  modified: string;
  admins: number[];
  displayName?: string;
  teamType?: TTeamType;
  description?: string;
  image?: string;
  name: string;
  members: number[];
  conversations: number[] | null;
  isRead?: boolean;
  mentionCount?: number;
  order?: number;
};

export interface IReadTeamPayload {
  team: number;
  isRead: boolean;
  mentionCount: number;
}

export interface ITeamMembership {
  team: number;
  userId: number;
  isAdmin: boolean;
  created?: string;
  modified?: string;
}
