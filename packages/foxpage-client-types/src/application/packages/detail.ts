import { ComponentType } from '../../enums';
import { RemoteResource } from '../resources';

import { ComponentEditVersionEntity, ComponentVersionEntityResource } from './list';

// design is ugly
export interface EditorComponent {
  name: string;
  groupId: string;
  component: {
    id?: string;
    version?: string;
    content: {
      resource: {
        entry: {
          browser?: string;
          css?: string;
          debug?: string;
          node?: string;
          editor?: string;
        };
        ['editor-entry']?: any[];
      };
      meta: {};
      schema: {};
    };
  };
}

export interface ComponentRemote {
  component: {
    content: {
      meta?: {};
      resource: ComponentVersionEntityResource;
    };
    id: string;
    version: string;
  };
  resource: RemoteResource;
  componentType: ComponentType;
}

export interface RemoteComponentItem {
  lastVersion: ComponentEditVersionEntity;
  components: ComponentRemote[];
}
