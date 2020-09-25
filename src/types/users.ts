export type TUser = {
  id: number;
  fullName: string;
  profileImage: string;
  isRemoved: boolean;
  isOnline?: boolean;
  sessionFullName?: string;
  sessionShortName?: string;
  isNonAlumniStaff?: boolean;
};

export type TUserProfileData = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  cognito_username: string;

  /** Additional fields from `/me` */
  linkedin?: string;
  reputation?: number;
  profile?: {
    profile_image?: string;
    position?: string;
    employer?: string;
    experiences?: {
      is_current: boolean;
      position: string;
      employer: string;
    }[]
  };
};

export type TUserPosition = {
  employer: string
  position: string
};
