import { ComponentContentService } from './component-content-service';
import { ContentCheckService } from './content-check-service';
import { ContentInfoService } from './content-info-service';
import { ContentListService } from './content-list-service';
import { ContentLiveService } from './content-live-service';
import { ContentMockService } from './content-mock-service';
import { ContentRelationService } from './content-relation-service';
import { ContentTagService } from './content-tag-service';
import { FileContentService } from './file-content-service';
import { ResourceContentService } from './resource-content-service';

const component: ComponentContentService = ComponentContentService.getInstance();
const file: FileContentService = FileContentService.getInstance();
const info: ContentInfoService = ContentInfoService.getInstance();
const list: ContentListService = ContentListService.getInstance();
const mock: ContentMockService = ContentMockService.getInstance();
const relation: ContentRelationService = ContentRelationService.getInstance();
const resource: ResourceContentService = ResourceContentService.getInstance();
const tag: ContentTagService = ContentTagService.getInstance();
const check: ContentCheckService = ContentCheckService.getInstance();
const live: ContentLiveService = ContentLiveService.getInstance();

export { check, component, file, info, list, live, mock, relation, resource, tag };
