import { RightClickCopyType, RightClickPasteType } from '@/constants/right-click';
import { Structure } from '@foxpage/foxpage-client-types';

export interface CopyOptions {
  type: RightClickCopyType;
}

export interface PasteOptions {
  type: RightClickPasteType;
  inputData?: Structure;
}
