import { FolderInfoService } from './folder-info-service';
import { FolderListService } from './folder-list-service';

const info: FolderInfoService = FolderInfoService.getInstance();
const list: FolderListService = FolderListService.getInstance();

export { info, list };
