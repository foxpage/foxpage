export interface DataBaseQueryParams {
  collect: string;
  type: string;
  field?: string;
  filter?: string;
  pipeline?: string;
  projection?: string;
  sort?: string;
  skip?: number;
  limit?: number;
}
