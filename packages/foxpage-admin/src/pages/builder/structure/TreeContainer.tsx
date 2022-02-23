import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import { REACT_COMPONENT_TYPE } from '@/constants/build';
import GlobalContext from '@/pages/GlobalContext';
import { ComponentStructure } from '@/types/builder';

import { newWrapperComponent } from '../../../services/builder';
import * as ACTIONS from '../../../store/actions/builder/template';
import { ROOT_CONTAINER, SYSTEM_PAGE } from '../constant';

import Tools from './tools/HoverBoundary';
import ToolBar from './tools/ToolBar';
import PlaceholderElem from './Placeholder';
import TreeMemo from './Tree';
import {
  getAttrData,
  getComponentNode,
  getFirstChildNode,
  getNodeData,
  getParentId,
  getRootLastNode,
  newDnd,
  newRect,
} from './utils';

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.page.applicationId,
  version: store.builder.template.version,
  // dragging: store.builder.template.dragging,
  selectedComponentId: store.builder.template.selectedComponentId,
  renderStructure: store.builder.template.renderStructure,
  componentSourceMap: store.builder.template.componentSourceMap,
  componentList: store.builder.template.componentList,
  registeredComponent: store.builder.componentList.allComponent,
  versionType: store.builder.template.versionType,
});

const mapDispatchToProps = {
  updateDndInfo: ACTIONS.updateDndInfo,
  setSelectedId: ACTIONS.setSelectedComponent,
  saveComponent: ACTIONS.saveComponent,
  pushComponentSource: ACTIONS.pushComponentSource,
  appendComponent: ACTIONS.appendComponent,
};

type ContainerProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Container: React.FC<ContainerProps> = props => {
  const {
    applicationId,
    // dragging,
    version,
    selectedComponentId,
    renderStructure,
    componentSourceMap,
    versionType,
    componentList,
    registeredComponent,
    updateDndInfo,
    setSelectedId,
    saveComponent,
    pushComponentSource,
    appendComponent,
  } = props;
  const [expendIds, setExpendIds] = useState<string[]>([]);
  const [dragState, setDragState] = useState<{ id: string | undefined; status: boolean }>({
    id: undefined,
    status: false,
  });
  const { locale } = useContext(GlobalContext);
  const { file } = locale.business;
  const { id: dragedComponentId, status: dragStatus = false } = dragState;
  const ROOT_TOP = 0; // todo
  let dndInfo: any = {}; // dnd default info
  let type = 'MOVE'; // move、insert、append

  useEffect(() => {
    handleDragEnd();
  }, []);

  const handleChange = (dragInfo: any = {}, desc: any = {}) => {
    let position = dragInfo.pos === 'APPEND_BEFORE' ? dragInfo.destIndex - 1 : dragInfo.destIndex;

    if (!version?.content?.schemas) {
      appendComponent(applicationId, ROOT_CONTAINER, desc);
      return;
    }

    const parentId =
      dragInfo.parentId && SYSTEM_PAGE !== dragInfo.parentId
        ? dragInfo.parentId
        : versionType === 'page'
        ? version.content.schemas[0]?.id
        : undefined;
    let finalParentId;
    if (dragInfo.method === 'INSERT') {
      finalParentId = parentId;
      const parentComponent = componentList.find((item: ComponentStructure) => item.id === finalParentId);
      position = parentComponent?.children?.length;
    } else {
      const targetComponent = componentList.find((item: ComponentStructure) => item.id === dragInfo.componentId);
      if (targetComponent && targetComponent.wrapper) {
        const container = componentList.find((item: ComponentStructure) => item.id === targetComponent.wrapper);
        finalParentId = container?.parentId;
      } else {
        finalParentId = targetComponent?.parentId;
      }
    }

    if (desc.type === 'add') {
      const params = {
        id: version.content.id,
        parentId: finalParentId,
        type: desc.type,
        position,
        content: newWrapperComponent(registeredComponent, desc.name, finalParentId),
        requireLoad: true,
      };
      pushComponentSource([desc.name]);
      saveComponent(applicationId, params, false);
    } else {
      const { wrapper } = desc;
      const wrapperComponent = componentList.find((item: ComponentStructure) => item.id === wrapper);
      const content = wrapperComponent
        ? {
            id: wrapper,
            label: wrapperComponent.label,
            name: wrapperComponent.name,
            props: wrapperComponent.props || {},
            parentId: finalParentId,
            children: wrapperComponent.children || [],
            type: wrapperComponent.type || REACT_COMPONENT_TYPE,
            directive: wrapperComponent.directive,
          }
        : {
            id: desc.id,
            label: desc.label,
            name: desc.name,
            props: desc.props || {},
            parentId: finalParentId,
            children: dragInfo.children || [],
            type: REACT_COMPONENT_TYPE,
            directive: desc.directive,
          };
      const params = {
        id: version.content.id,
        parentId: finalParentId,
        type: desc.type,
        position,
        content: content,
        requireLoad: false,
      };

      saveComponent(applicationId, params, false);
    }
  };

  const handleDragStart = (ev: any, component: any, index: number) => {
    if (!dragStatus) {
      const dsl = {
        id: component.id,
        label: component.label,
        name: component.name,
        content: component.content,
        props: component.props,
        children: component.children,
        wrapper: component.wrapper,
        directive: component.directive,
        type: 'move',
      };

      ev.dataTransfer.setData('data-dsl', JSON.stringify(Object.assign({}, dsl)));
      setTimeout(() => {
        setDragState({ status: true, id: component.id });
      }, 100);
      dndInfo = {
        type: 'MOVE',
        draggedId: component.id,
        originIdx: index,
      };
    }
  };

  const handleDragOver = (e: any) => {
    const { target, clientY } = e;
    const nodeType = getAttrData(target, 'data-type');
    const newDragInfo: any = {}; // init dragInfo

    if (nodeType === 'root') {
      // drag over root
      const rooDom = window.document.getElementById('root');
      const lastRootDom = getRootLastNode(rooDom);
      if (lastRootDom) {
        // exist component node
        const { componentId, parentId, destIndex } = getNodeData(lastRootDom);
        const rect = lastRootDom.parentNode.parentNode.getBoundingClientRect();
        Object.assign(
          newDragInfo,
          newDnd(
            'APPEND_AFTER',
            'APPEND_AFTER',
            componentId,
            '',
            parentId,
            Number(destIndex),
            newRect(rect.height, rect.width, rect.height, rect.bottom - ROOT_TOP),
          ),
        );
      } else if (rooDom) {
        // no component, now add first component node
        const rect = rooDom.getBoundingClientRect();
        Object.assign(
          newDragInfo,
          newDnd(
            'APPEND_BEFORE',
            'APPEND_BEFORE',
            '',
            '',
            '',
            0,
            newRect(0, rect.width - 20, rect.height, rect.bottom),
          ),
        );
      }
      if (!dndInfo.type) {
        // new append component
        type = 'APPEND';
      }
    } else if (nodeType === 'mask') {
      // over mask
      const { top, width, height, bottom } = target.getBoundingClientRect();
      const beforePos = clientY <= top + height / 2;
      Object.assign(
        newDragInfo,
        newDnd(
          beforePos ? 'APPEND_BEFORE' : 'APPEND_AFTER',
          beforePos ? 'APPEND_BEFORE' : 'APPEND_AFTER',
          null,
          getParentId(target.parentNode.parentNode),
          '',
          0,
          newRect(top - ROOT_TOP, width, height, bottom - ROOT_TOP),
        ),
      );
    } else {
      // over general component
      const overComponent = getComponentNode(target);
      if (!dndInfo.type) {
        // new insert component
        type = 'INSERT';
      }
      if (overComponent) {
        const { top, width, height, bottom } = overComponent.getBoundingClientRect();
        const rectInfo = newRect(top - ROOT_TOP, width, height, bottom - ROOT_TOP);

        // insert child
        const couldInsert = getAttrData(overComponent, 'data-with-children');

        // can not insert when component without children
        if (couldInsert !== 'true') {
          const { componentId, parentId, destIndex } = getNodeData(overComponent);
          if (clientY <= top + height / 2) {
            // before append
            Object.assign(
              newDragInfo,
              newDnd('APPEND_BEFORE', 'APPEND_BEFORE', componentId, parentId, parentId, Number(destIndex), rectInfo),
            );
          } else {
            // after append
            Object.assign(
              newDragInfo,
              newDnd('APPEND_AFTER', 'APPEND_AFTER', componentId, parentId, parentId, Number(destIndex), rectInfo),
            );
          }
        } else {
          // cannot insert children
          // eslint-disable-next-line no-lonely-if
          if (clientY >= top + 10 && clientY <= bottom - 10) {
            const { componentId, destIndex } = getNodeData(overComponent);
            Object.assign(
              newDragInfo,
              newDnd('INSERT', 'INSERT', componentId, componentId, componentId, Number(destIndex), rectInfo),
            );
            if (!dndInfo.type) {
              // new append component
              type = 'APPEND';
            }
          } else if (clientY < top + 10) {
            // before append
            const { componentId, parentId, destIndex } = getNodeData(overComponent);
            Object.assign(
              newDragInfo,
              newDnd('APPEND_BEFORE', 'APPEND_BEFORE', componentId, parentId, parentId, Number(destIndex), rectInfo),
            );
          } else if (clientY > bottom - 10) {
            // after append
            const close = getAttrData(overComponent, 'data-close');
            // node close state (if expend fix insert child or brother problem)
            if (close === 'false') {
              const firstChildNode = getFirstChildNode(overComponent);
              if (firstChildNode) {
                const { componentId, parentId, destIndex } = getNodeData(firstChildNode);
                const rect = firstChildNode.getBoundingClientRect();
                const newRectInfo = newRect(rect.top - ROOT_TOP, rect.width, rect.height, rect.bottom - ROOT_TOP);
                Object.assign(
                  newDragInfo,
                  newDnd(
                    'APPEND_BEFORE',
                    'APPEND_AFTER',
                    componentId,
                    parentId,
                    parentId,
                    Number(destIndex),
                    newRectInfo,
                  ),
                );
              } else {
                const { parentId, destIndex } = getNodeData(overComponent);
                Object.assign(
                  newDragInfo,
                  newDnd('APPEND_AFTER', 'APPEND_AFTER', parentId, parentId, parentId, Number(destIndex), rectInfo),
                );
              }
            } else {
              // after append
              const { parentId, destIndex } = getNodeData(overComponent);
              Object.assign(
                newDragInfo,
                newDnd('APPEND_AFTER', 'APPEND_AFTER', parentId, parentId, parentId, Number(destIndex), rectInfo),
              );
            }
          }
        }
      }
    }

    if (
      dndInfo.hoverComponentId !== newDragInfo.hoverComponentId ||
      dndInfo.method !== newDragInfo.method ||
      dndInfo.parentId !== newDragInfo.parentId ||
      dndInfo.componentId !== newDragInfo.componentId ||
      dndInfo.destIndex !== newDragInfo.destIndex ||
      dndInfo.pos !== newDragInfo.pos
    ) {
      dndInfo = Object.assign({}, dndInfo, newDragInfo);
      updateDndInfo(newDragInfo);
    }

    e.preventDefault();
  };

  const handleDragEnd = () => {
    updateDndInfo();
    dndInfo = {};
    type = '';
    setDragState({ status: false, id: undefined });
  };

  const handleOnDrop = (e: any) => {
    e.preventDefault();
    const desc = JSON.parse(e.dataTransfer.getData('data-dsl'));
    if (dndInfo && (['INSERT', 'APPEND'].indexOf(dndInfo.type) > -1 || dndInfo.componentId !== null)) {
      if (!dndInfo.type) {
        Object.assign(dndInfo, { type });
      }
      handleChange(dndInfo, desc);
    }
    handleDragEnd();
  };

  const handleToggleExpend = (e: any, componentId: string) => {
    const list: string[] = expendIds.slice();
    const index = list.indexOf(componentId);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(componentId);
    }
    setSelectedId(undefined);
    setExpendIds(list);
    e.stopPropagation();
  };

  const TreeView = useMemo(
    () =>
      TreeMemo({
        renderStructure:
          versionType === 'page'
            ? [{ id: SYSTEM_PAGE, name: SYSTEM_PAGE, label: file.page, children: renderStructure }]
            : renderStructure,
        dragedComponentId,
        expendIds,
        componentSourceMap,
        selectedComponentId,
        onDragStart: handleDragStart,
        onDragOver: handleDragOver,
        onDrop: handleOnDrop,
        onDragEnd: handleDragEnd,
        onToggleExpend: handleToggleExpend,
        handleSelectComponent: (componentId: string) => {
          setSelectedId(componentId);
        },
      }),
    [renderStructure, dragedComponentId, expendIds, selectedComponentId],
  );

  return (
    <div id="structure-container" style={{ position: 'relative', maxHeight: '50%', flex: 1, overflow: 'hidden' }}>
      <React.Fragment>
        {TreeView}
        <PlaceholderElem />
        <Tools />
        <ToolBar />
      </React.Fragment>
      {/* {renderStructure ? (
        <React.Fragment>
          {TreeView}
          <PlaceholderElem />
          <Tools />
        </React.Fragment>
      ) : (
        <Spin />
      )} */}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Container);
