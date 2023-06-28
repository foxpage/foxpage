export interface ComponentCategory {
  type?: string;
  name: string;
  categoryName: string;
  groupName: string;
  sort: number;
  rank: number;
  props: {};
  description: string;
  screenshot: string;
}

export interface CategoryType {
  categoryName: string;
  groupNames: string[];
}
