import { Component } from '../../component';

import { StructureNode } from './main';

export interface RightClickMenuConfig {
  enableCopyIt?: boolean;
  enableCopyAll?: boolean;
  enablePasteIn?: boolean;
  enablePasteBefore?: boolean;
  enablePasteAfter?: boolean;
}

/**
 * render structure node
 */
export interface RenderStructureNode extends StructureNode {
  // inherit
  children?: RenderStructureNode[];

  // extensions
  __styleNode?: StructureNode | null;
  __renderProps: StructureNode['props'];
  __mock?: RenderStructureNode;
  __lastModified?: number; // for record node update time
  __editorConfig?: {
    visible?: boolean; // eye status
    showInStructure?: boolean; // status in structure
    directiveable?: boolean;
    moveable?: boolean;
    editable?: boolean;
    deprecated?: boolean;
    styleable?: boolean;
    isExtend?: boolean;
    isExtendAndModified?: boolean;
    isExtendAndDeleted?: boolean;
    hasCondition?: boolean;
    hasVariable?: boolean;
    hasMock?: boolean;
    // rootNode
    templateBind?: boolean;
    disableTemplateBind?: boolean;
    // TplNode
    isTplNode?: boolean;
    rightClickConfig?: RightClickMenuConfig;
  };
  __versions?: Component[];
}

export type RenderStructure = RenderStructureNode[];
