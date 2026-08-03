export type Term = {
  _id: string;
  title: string;
  version: string;
  content: string;
  isCurrent: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AcceptCurrentTermsResponse = {
  acceptedTermsVersion: string;
  termsAccepted: true;
  termsAcceptedAt: string;
};
