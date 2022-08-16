import { StructureNode } from './main';

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
  __editorConfig?: {
    visible?: boolean; // eye status
    showInStructure?: boolean; // status in structure
    directiveable?: boolean;
    moveable?: boolean;
    editable?: boolean;
    styleable?: boolean;
    // rootNode
    templateBind?: boolean;
    disableTemplateBind?: boolean;
  };
}

export type RenderStructure = RenderStructureNode[];
