import { AppContentLogModel } from './application-content-log-model';
import { ApplicationModel } from './application-model';
import { AuthorizeModel } from './authorize-model';
import { ContentLogModel } from './content-log-model';
import { ContentModel } from './content-model';
import { RelationModel } from './content-relation-model';
import { FileModel } from './file-model';
import { FolderModel } from './folder-model';
import { LogModel } from './log-model';
import { OrgModel } from './organization-model';
import { PictureModel } from './picture-model';
import { StoreGoodsModel } from './store-goods-model';
import { StoreOrderModel } from './store-order-model';
import { TeamModel } from './team-model';
import { UserLogModel } from './user-log-model';
import { UserModel } from './user-model';
import { VersionModel } from './version-model';

const application: ApplicationModel = ApplicationModel.getInstance();
const appContentLog: AppContentLogModel = AppContentLogModel.getInstance();
const auth: AuthorizeModel = AuthorizeModel.getInstance();
const user: UserModel = UserModel.getInstance();
const folder: FolderModel = FolderModel.getInstance();
const file: FileModel = FileModel.getInstance();
const org: OrgModel = OrgModel.getInstance();
const team: TeamModel = TeamModel.getInstance();
const content: ContentModel = ContentModel.getInstance();
const contentLog: ContentLogModel = ContentLogModel.getInstance();
const version: VersionModel = VersionModel.getInstance();
const log: LogModel = LogModel.getInstance();
const relation: RelationModel = RelationModel.getInstance();
const storeGoods: StoreGoodsModel = StoreGoodsModel.getInstance();
const storeOrder: StoreOrderModel = StoreOrderModel.getInstance();
const picture: PictureModel = PictureModel.getInstance();
const userLog: UserLogModel = UserLogModel.getInstance();

export {
  appContentLog,
  application,
  auth,
  content,
  contentLog,
  file,
  folder,
  log,
  org,
  picture,
  relation,
  storeGoods,
  storeOrder,
  team,
  user,
  userLog,
  version,
};
