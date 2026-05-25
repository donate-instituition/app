export type CampaignCategory =
  | 'Educação'
  | 'Alimentação'
  | 'Saúde'
  | 'Moradia'
  | 'Meio Ambiente'
  | 'Outros';

export type Campaign = {
  id: string;
  title: string;
  institution: string;
  institutionId: string;
  category: CampaignCategory;
  goalFormatted: string;
  raisedFormatted: string;
  goalCents: number;
  raisedCents: number;
  progress: number; // 0–100
  active: boolean;
  endsAt?: string; // ISO date string
};

export type CampaignDetail = Campaign & {
  description: string;
  donorsCount: number;
  itemsNeeded?: string[];
};

export type Institution = {
  id: string;
  name: string;
  category: CampaignCategory;
  city: string;
  state: string;
  activeCampaigns: number;
  verified: boolean;
  description: string;
};

export type InstitutionDetail = Institution & {
  foundedYear: number;
  email: string;
  website?: string;
  campaigns: Campaign[];
};

export type CampaignFilters = {
  search?: string;
  category?: CampaignCategory | 'Todos';
};

export type InstitutionFilters = {
  search?: string;
};
