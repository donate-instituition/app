export type CampaignCategory =
  | 'Educação'
  | 'Alimentação'
  | 'Saúde'
  | 'Moradia'
  | 'Meio Ambiente'
  | 'Outros';

export type GeoLocation = {
  latitude: number;
  longitude: number;
};

export type Campaign = {
  id: string;
  title: string;
  institution: string;
  institutionId: string;
  category: CampaignCategory;
  status?: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED' | 'PAUSED' | 'FINISHED' | 'CANCELED';
  goalFormatted: string;
  raisedFormatted: string;
  goalCents: number;
  raisedCents: number;
  progress: number; // 0–100
  commentsCount?: number;
  donationsCount?: number;
  followersCount?: number;
  likesCount?: number;
  postsCount?: number;
  sharesCount?: number;
  active: boolean;
  acceptsRecurringDonations?: boolean;
  bannerUrl?: string;
  createdAt?: string; // ISO date string
  endsAt?: string; // ISO date string
  location?: GeoLocation;
};

export type CampaignDetail = Campaign & {
  description: string;
  donorsCount: number;
  itemsNeeded?: string[];
};

export type CreateCampaignInput = {
  bannerUrl?: string;
  category?: CampaignCategory;
  description?: string;
  endAt?: string;
  goal: {
    moneyTarget: number;
  };
  status?: 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED';
  tags?: string[];
  title: string;
};

export type CampaignDonor = {
  id: string;
  name?: string;
  profilePhotoUrl?: string;
};

export type CampaignRecentDonors = {
  donors: CampaignDonor[];
  totalCount: number;
};

export type Institution = {
  id: string;
  name: string;
  category: CampaignCategory;
  city: string;
  state: string;
  activeCampaigns: number;
  createdAt?: string; // ISO date string
  followersCount?: number;
  postsCount?: number;
  receivedDonationsCount?: number;
  receivedAmount?: number;
  verified: boolean;
  acceptsRecurringDonations?: boolean;
  logoUrl?: string;
  coverPhotoUrl?: string;
  stripeConnect?: {
    accountId?: string;
    chargesEnabled?: boolean;
    country?: string;
    defaultCurrency?: string;
    detailsSubmitted?: boolean;
    exists?: boolean;
    livemode?: boolean;
    payoutsEnabled?: boolean;
    ready: boolean;
    requirementsCurrentlyDue?: string[];
    requirementsDisabledReason?: string;
    status: 'missing' | 'not_verified' | 'pending' | 'ready';
    verifiedAt?: string;
  };
  description: string;
  location?: GeoLocation;
};

export type InstitutionDetail = Institution & {
  foundedYear: number;
  email: string;
  stripeConnectAccountId?: string;
  website?: string;
  campaigns: Campaign[];
};

export type PendingInstitution = Institution & {
  cnpj: string;
  email: string;
  phone?: string;
  website?: string;
  status: 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED';
  createdAt?: string;
};

export type CampaignFilters = {
  search?: string;
  category?: CampaignCategory | 'Todos';
  nearMe?: GeoLocation;
};

export type InstitutionFilters = {
  search?: string;
  nearMe?: GeoLocation;
};

export type CampaignComment = {
  id: string;
  campaignId: string;
  userId: string;
  author?: {
    email?: string;
    fullName?: string;
    id: string;
    profilePhotoUrl?: string;
  };
  content: string;
  createdAt: string;
  updatedAt: string;
};
