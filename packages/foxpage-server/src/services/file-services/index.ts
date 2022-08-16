import { FileCheckService } from './file-check-service';
import { FileInfoService } from './file-info-service';
import { FileListService } from './file-list-service';

const info: FileInfoService = FileInfoService.getInstance();
const check: FileCheckService = FileCheckService.getInstance();
const list: FileListService = FileListService.getInstance();

export { check, info, list };
