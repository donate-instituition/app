export type SupportFaqItem = {
  answer: string;
  order: number;
  question: string;
};

export type SupportFaq = {
  id?: string;
  _id?: string;
  isCurrent: boolean;
  items: SupportFaqItem[];
  publishedAt?: string;
  title: string;
  version: string;
};
