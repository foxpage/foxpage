import { VersionCheckService } from './version-check-service';
import { VersionComponentService } from './version-component-service';
import { VersionInfoService } from './version-info-service';
import { VersionListService } from './version-list-service';
import { VersionLiveService } from './version-live-service';
import { VersionNumberService } from './version-number-service';
import { VersionRelationService } from './version-relation-service';

const info: VersionInfoService = VersionInfoService.getInstance();
const check: VersionCheckService = VersionCheckService.getInstance();
const number: VersionNumberService = VersionNumberService.getInstance();
const live: VersionLiveService = VersionLiveService.getInstance();
const relation: VersionRelationService = VersionRelationService.getInstance();
const component: VersionComponentService = VersionComponentService.getInstance();
const list: VersionListService = VersionListService.getInstance();

export { check, component, info, list, live, number, relation };
