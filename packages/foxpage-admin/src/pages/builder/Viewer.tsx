import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { RootState } from 'typesafe-actions';

import { fetchComponentVersions } from '@/actions/builder/components';
import * as ACTIONS from '@/actions/builder/events';
import { selectComponent, updateContentScreenshot } from '@/actions/builder/main';
import { DESIGNER_PATH, FOXPAGE_USER_TICKET, PAGE_COMPONENT_NAME, STYLE_CONTAINER } from '@/constants/index';
import { findStructureByExtendId, findStructureById } from '@/sagas/builder/utils';
import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';
import { getGlobalLocale, getLocaleHost, getLocationIfo } from '@/utils/index';

import { Designer, FoxContextProvider } from '../designer';

const mapStateToProps = (store: RootState) => ({
  contentId: store.builder.header.contentId,
  components: store.builder.component.components,
  componentVersions: store.builder.component.versions,
  nameVersionDetails: store.builder.component.nameVersionDetails,
  application: store.builder.main.application,
  selectedNode: store.builder.main.selectedNode,
  selectNodeFrom: store.builder.main.selectNodeFrom,
  state: store.builder.main.formattedData,
  renderDSL: store.builder.main.renderDSL,
  readOnly: store.builder.main.readOnly,
  mock: store.builder.main.mock,
  pageLocale: store.builder.header.locale,
  zoom: store.builder.header.zoom,
  viewWidth: store.builder.header.viewWidth,
  file: store.builder.main.file,
  rootNode: store.builder.main.rootNode,
  pageId: store.builder.header.contentId,
  lastModified: store.builder.main.lastModified,
  recordStatus: store.record.main.recordStatus,
  pageNode: store.builder.main.pageNode,
  parseState: store.builder.main.parseState,
});

const mapDispatchToProps = {
  selectComponent,
  updateComponent: ACTIONS.updateComponent,
  removeComponent: ACTIONS.removeComponent,
  copyComponent: ACTIONS.copyComponent,
  dropComponent: ACTIONS.dropComponent,
  copyToClipboard: ACTIONS.copyToClipboard,
  pasteFromClipboard: ACTIONS.pasteFromClipboard,
  fetchComponentVersions,
  updateContentScreenshot,
};

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    loading: boolean;
    changeWindow: FoxBuilderEvents['onWindowChange'];
  };

const Viewer = (props: IProps) => {
  const {
    application,
    contentId,
    state,
    renderDSL,
    components = [],
    componentVersions,
    selectedNode,
    selectNodeFrom,
    rootNode,
    pageId,
    file,
    readOnly,
    pageLocale,
    zoom,
    viewWidth,
    mock,
    recordStatus,
    pageNode,
    parseState,
    selectComponent,
    updateComponent,
    removeComponent,
    copyComponent,
    dropComponent,
    copyToClipboard,
    pasteFromClipboard,
    changeWindow,
    fetchComponentVersions,
    updateContentScreenshot,
  } = props;
  const { host = [], slug = '' } = application;
  const { formattedSchemas: pageStructure } = state;
  const locale = getGlobalLocale() || 'en';
  const history = useHistory();
  const { applicationId } = getLocationIfo(useLocation());
  const token = localStorage.getItem(FOXPAGE_USER_TICKET);

  // @ts-ignore
  const { editorHost, csrPackageName } = APP_CONFIG;
  const localeHost = getLocaleHost(host, pageLocale);
  const pageConfig = {
    id: pageId,
    locale: pageLocale,
    fileType: file.type,
  };

  // @ts-ignore
  const visualFrameSrc = __DEV__
    ? editorHost ||
      `${'http://localhost:3000'}/${slug}${DESIGNER_PATH}?appid=${applicationId}&pageid=${contentId}&csrPackageName=${csrPackageName}&locale=${pageLocale}&_foxpage_ticket=${token}`
    : localeHost[0] && slug
    ? `${localeHost[0]?.url}/${slug}${DESIGNER_PATH}?appid=${applicationId}&pageid=${contentId}&csrPackageName=${csrPackageName}&locale=${pageLocale}&_foxpage_ticket=${token}`
    : '';

  const $selectedNode = useMemo(() => {
    let _selectNode: RenderStructureNode | undefined;
    if (selectedNode) {
      _selectNode = findStructureById(pageStructure || [], selectedNode.id) as unknown as RenderStructureNode;
      if (!_selectNode) {
        _selectNode = findStructureByExtendId(
          pageStructure || [],
          selectedNode.id,
        ) as unknown as RenderStructureNode;
      }
      // TODO: style logic, need to general
      if (_selectNode) {
        const { children = [] } = _selectNode;
        const isStyleContainer = children.length === 1 && _selectNode.name === STYLE_CONTAINER;
        if (isStyleContainer) {
          _selectNode = children[0];
        }
      }
    }
    if (selectedNode?.name === PAGE_COMPONENT_NAME) {
      _selectNode = rootNode ? { ...rootNode, children: [], childIds: [] } : undefined;
    }
    // for cover editor value or be covered
    if (_selectNode) {
      _selectNode = {
        ..._selectNode,
        __lastModified: selectedNode?.__lastModified || 0,
        __versions: componentVersions || [],
      } as unknown as unknown as RenderStructureNode;
    }
    return _selectNode;
  }, [selectedNode, pageStructure, componentVersions, rootNode]);

  const handleLinkChange = (_target: string, _opt?: {}) => {
    // TODO: generate different link by target, opt
    const appSettingComponentLink = `/applications/${applicationId}/settings/builder/component`;
    history.push(appSettingComponentLink);
  };

  // upload page snapshot
  function handlePageCaptured(img) {
    updateContentScreenshot(img);
  }

  const handlers: FoxBuilderEvents = {
    onSelectComponent: (node, opt) => {
      selectComponent(node, opt ? { from: opt.from } : { from: null });
    },
    onUpdateComponent: updateComponent,
    onRemoveComponent: removeComponent,
    onCopyComponent: copyComponent,
    onDropComponent: dropComponent,
    onWindowChange: changeWindow,
    onLinkChange: handleLinkChange,
    onPageCaptured: handlePageCaptured,
    onFetchComponentVersions: (node?: Partial<RenderStructureNode> | null) => {
      if (node) {
        fetchComponentVersions({ applicationId, name: node.name });
      }
    },
    onCopyToClipboard: copyToClipboard,
    onPasteFromClipboard: pasteFromClipboard,
  };

  return slug && applicationId && contentId ? (
    <FoxContextProvider
      selectNode={$selectedNode}
      selectNodeFrom={selectNodeFrom}
      pageStructure={pageStructure || []}
      components={components}
      events={handlers}
      rootNode={rootNode}
      slug={slug}
      nodeChangedStatus={recordStatus.structure}
      visualFrameSrc={visualFrameSrc}
      renderDSL={renderDSL}
      pageNode={pageNode as any}
      contentId={contentId}
      parseState={parseState}
      config={{
        sys: {
          locale,
          mockable: !!mock?.enable,
          readOnly,
          zoom,
          viewWidth,
        },
        app: {
          appId: application.id,
        },
        page: pageConfig,
      }}
      extra={{
        token,
      }}>
      <Designer />
    </FoxContextProvider>
  ) : null;
};

export default connect(mapStateToProps, mapDispatchToProps)(Viewer);
