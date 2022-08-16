import { ApplicationService } from './application-service';
import { AuthService } from './authorization-service';
import { ComponentService } from './component-service';
import * as content from './content-services';
import * as file from './file-services';
import * as folder from './folder-services';
import { LogService } from './log-service';
import { OrgService } from './organization-service';
import { RelationService } from './relation-service';
import { ResourceService } from './resource-service';
import { StorageService } from './storage-service';
import * as store from './store-services';
import { TeamService } from './team-service';
import { UserService } from './user-service';
import * as version from './version-services';

const application = ApplicationService.getInstance();
const user = UserService.getInstance();
const org: OrgService = OrgService.getInstance();
const team: TeamService = TeamService.getInstance();
const log = LogService.getInstance();
const relation: RelationService = RelationService.getInstance();
const auth: AuthService = AuthService.getInstance();
const component: ComponentService = ComponentService.getInstance();
const resource: ResourceService = ResourceService.getInstance();
const storage: StorageService = StorageService.getInstance();

export {
  application,
  auth,
  component,
  content,
  file,
  folder,
  log,
  org,
  relation,
  resource,
  storage,
  store,
  team,
  user,
  version,
};
