import { RenderStructure, RenderStructureNode } from '@/types/builder/structure';
import { Component } from '@/types/component';

import { VisualEditorConfig } from '../common';
import { DndData } from '../dnd';
import { BuilderWindow, BuilderWindowChangeOptions } from '../window';

export type BuilderData = {
  structure?: RenderStructure;
  components?: Component[];
  config?: VisualEditorConfig;
  selectNode?: RenderStructureNode | null;
  rootNode?: RenderStructureNode | null;
};

/**
 * foxpage builder postmessage events, child <-> root
 * developer will select to use by self
 */
export interface FoxBuilderEvents {
  onInit?: (data: BuilderData, opt?: {}) => void;
  onChange?: (data: BuilderData, opt?: {}) => void;
  onSelectComponent?: (component: RenderStructureNode | null, opt?: { from: 'viewer' | 'sider' }) => void;
  onUpdateComponent?: (component: RenderStructureNode, opt?: {}) => void;
  onRemoveComponent?: (component: RenderStructureNode, opt?: {}) => void;
  onCopyComponent?: (component: RenderStructureNode, opt?: {}) => void;
  onDropComponent?: (dndInfo: DndData, opt?: {}) => void;
  onWindowChange?: (target: BuilderWindow, opt?: BuilderWindowChangeOptions) => void;
  onLinkChange?: (target: string, opt?: {}) => void;
  onFrameLoaded?: (opt?: {}) => void;
}
