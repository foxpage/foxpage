/**
 * component resource
 */
export interface ComponentResource {
  entry: {
    node: EntryResource;
    browser: EntryResource;
    debug: Partial<EntryResource>;
    css: Partial<EntryResource>;
  };
  dependencies: DependencyResource;
  'editor-entry': EditorEntryResource;
}

export interface EntryResource {
  host: string;
  downloadHost: string;
  path: string;
  contentId: string;
  origin: string;
}

export interface DependencyEntity {
  id: string;
  name: string;
}

export type DependencyResource = DependencyEntity[];
export type EditorEntryResource = DependencyEntity[];
