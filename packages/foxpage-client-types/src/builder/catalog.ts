import { ContentEntity, File } from '../project';

// catalog
export interface CatalogFileEntity extends File {
  contents: ContentEntity[];
  fold: boolean;
}
