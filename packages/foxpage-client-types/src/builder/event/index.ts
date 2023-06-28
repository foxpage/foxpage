import { Component } from '../../component';
import { VisualEditorConfig } from '../common';
import { DndData } from '../dnd';
import { RenderStructure, RenderStructureNode } from '../structure';
import { BuilderWindow, BuilderWindowChangeOptions } from '../window';

export type BuilderData = {
  structure?: RenderStructure;
  components?: Component[];
  config?: VisualEditorConfig;
  selectNode?: RenderStructureNode | null;
  rootNode?: RenderStructureNode | null;
};

export type UpdateOptions = {
  adds?: DndData[];
  updates?: RenderStructureNode[];
  removes?: RenderStructureNode[];
} & Record<string, any>;

/**
 * foxpage builder postmessage events, child <-> root
 * developer will select to use by self
 */
export interface FoxBuilderEvents {
  onInit?: (data: BuilderData, opt?: {}) => void;
  onChange?: (data: BuilderData, opt?: {}) => void;
  onSelectComponent?: (
    component: RenderStructureNode | null,
    opt?: { from: 'viewer' | 'sider'; rect?: DOMRect },
  ) => void;
  onUpdateComponent?: (result: RenderStructureNode, opt?: UpdateOptions) => void;
  onRemoveComponent?: (result: RenderStructureNode, opt?: UpdateOptions) => void;
  onCopyComponent?: (result: RenderStructureNode, opt?: UpdateOptions) => void;
  onDropComponent?: (dndInfo: DndData, opt?: {}) => void;
  onWindowChange?: (target: BuilderWindow, opt?: BuilderWindowChangeOptions) => void;
  onLinkChange?: (target: string, opt?: {}) => void;
  onFrameLoaded?: (opt?: {}) => void;
  onPageCapture?: (versionId: string) => void;
  onPageCaptured?: (value: string, versionId: string) => void;
  onStructureChanged?: (opt: {}) => void;
  onRenderDSLChanged?: (structure?: RenderStructure) => void;
  onPageStructureChanged?: (structure?: RenderStructure) => void;
  onSelectedComponentChanged?: (selectNode?: RenderStructureNode | null) => void;
  onFetchComponentVersions?: (selectNode?: Partial<RenderStructureNode> | null) => void;
  onCopyToClipboard?: (data: RenderStructureNode, opt?: any) => void;
  onPasteFromClipboard?: (data: RenderStructureNode, opt?: any) => void;
}
