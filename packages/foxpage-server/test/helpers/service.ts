import { ApplicationService } from '../../src/services/application-service';
import { ComponentContentService } from '../../src/services/content-services/component-content-service';
import { ContentListService } from '../../src/services/content-services/content-list-service';
import { FileListService } from '../../src/services/file-services/file-list-service';
import { FolderListService } from '../../src/services/folder-services/folder-list-service';
import { UserService } from '../../src/services/user-service';

const MockedAppService = ApplicationService as jest.MockedClass<typeof ApplicationService>;
const MockedContentComponentService = ComponentContentService as jest.MockedClass<
  typeof ComponentContentService
>;
const MockedContentListService = ContentListService as jest.MockedClass<typeof ContentListService>;
const MockedFolderListService = FolderListService as jest.MockedClass<typeof FolderListService>;
const MockedFileListService = FileListService as jest.MockedClass<typeof FileListService>;
const MockedUserService = UserService as jest.MockedClass<typeof UserService>;

jest.mock('../../src/services/index');
// jest.mock('../../src/services/content-services/index');

export const appService = MockedAppService.getInstance();
export const contentComponentService = MockedContentComponentService.getInstance();
export const contentListService = MockedContentListService.getInstance();
export const folderListService = MockedFolderListService.getInstance();
export const fileListService = MockedFileListService.getInstance();
export const userService = MockedUserService.getInstance();

// console.log(appService, contentListService);
