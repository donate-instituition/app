export type UploadCategory =
  | 'USER_AVATAR'
  | 'USER_DOCUMENT'
  | 'INSTITUTION_LOGO'
  | 'INSTITUTION_COVER'
  | 'INSTITUTION_DOCUMENT'
  | 'INSTITUTION_REPORT'
  | 'CAMPAIGN_BANNER'
  | 'POST_MEDIA'
  | 'DELIVERY_PROOF'
  | 'DONATION_ATTACHMENT';

export type CreateUploadRequest = {
  base64: string;
  category: UploadCategory;
  contentType: string;
  filename: string;
};

export type CreatedUpload = {
  category: UploadCategory;
  contentType: string;
  fileName: string;
  size: number;
  uploadId: string;
};

export type ConfirmUploadRequest = {
  campaignId?: string;
  category: UploadCategory;
  donationId?: string;
  fileName: string;
  institutionId?: string;
  postId?: string;
};

export type ConfirmedUpload = {
  key: string;
  url?: string;
};
