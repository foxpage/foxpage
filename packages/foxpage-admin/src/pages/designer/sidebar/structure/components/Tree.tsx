import React, { CSSProperties, FC, useContext, useMemo, useRef, useState } from 'react';
import List from 'react-virtualized/dist/commonjs/List';

//@ts-ignore
import { useSize } from 'ahooks';
import { Empty } from 'antd';

import { RenderStructureNode } from '@/types/index';

import { STRUCTURE_DROP_IN } from '../../../constant';
import { StructureTreeContext, useFoxpageContext } from '../../../context';
import { findStructureById, treeToList } from '../../../utils/finders';
import { RightClick } from '../right-click';
import { filterTree, insertRootNodeOnStructureTree, mapTreeToList } from '../utils';

import Node from './Node';

const VList = List as unknown as FC<any>;

type TreeStructureNode = RenderStructureNode & { depth: number; dataIndex: number };

const Row = (props: { data; index; style }) => {
  const { data, style } = props;
  const {
    dragId,
    expandIds,
    rootNode,
    nodeChangedStatus,
    handleToggleExpand,
    handleSelectComponent,
    selectNode,
    searchValue,
    node,
  } = data;

  const selected = node.id === selectNode?.id;
  const changed = !!nodeChangedStatus[node.id];
  const borderStyle = useMemo(() => {
    let style: CSSProperties = { borderLeft: '2px solid transparent', borderBottom: '1px dashed #E5E7EB' };
    if (changed) {
      style = {
        ...style,
        borderLeft: '2px solid #48ad48',
      };
    }
    return style;
  }, [selected, changed]);

  const renderNode = ({
    node,
    visible,
    paddingLeft,
    style,
  }: {
    node: TreeStructureNode;
    visible: boolean;
    paddingLeft: number;
    style: CSSProperties;
  }) => {
    const { id, children = [], depth, dataIndex } = node;
    const childNum = children.length;
    const _paddingLeft = depth * paddingLeft;
    const disabled = dragId === id;
    const isRootNode = rootNode?.id === id;
    const expanded = !(expandIds.indexOf(node.id) > -1);
    const { isDragging } = useContext(StructureTreeContext);

    return visible ? (
      <div className="relative">
        <div
          className={`box-border select-none px-2 flex items-center${
            !isDragging ? ' hover:bg-[#e6f7ff]' : ''
          }${changed ? ' bg-[#f7fffb]' : ''}`}
          key={id}
          id={`layer_${id}`}
          data-type="layer"
          data-component-id={id}
          style={style}>
          <Node
            idx={dataIndex}
            node={node}
            childNum={childNum}
            expended={expanded}
            style={{ paddingLeft: _paddingLeft }}
            toolBar={!isRootNode}
            toggleExpend={(e) => handleToggleExpand(e, id)}
            onSelect={handleSelectComponent}
            selected={selected}
            searchValue={searchValue}
          />
          {selected && (
            <div className="absolute right-0 left-0 bottom-0 top-0 border-2 border-solid border-fox pointer-events-none"></div>
          )}

          {disabled && (
            <div className="w-full h-full absolute top-0 opacity-30 bg-gray-200" data-type="mask" />
          )}
        </div>
      </div>
    ) : null;
  };

  return <>{renderNode({ node, visible: true, paddingLeft: 16, style: { ...borderStyle, ...style } })}</>;
};

const Tree = React.forwardRef((_props, ref) => {
  const [expandIds, setExpandIds] = useState<string[]>([]);
  const {
    pageStructure: structure,
    rootNode,
    nodeChangedStatus,
    selectNode,
    selectNodeFrom,
    config,
  } = useFoxpageContext();
  const { dragId, isDragging, searchValue, onScroll, onDragOver, onDragLeave, onDrop, onExpand, onSelect } =
    useContext(StructureTreeContext);
  const readOnly = !!config.sys?.readOnly;
  const listRef = useRef<any>(null);
  const containerRef = useRef(null);
  const size = useSize(containerRef);
  const listSize = useMemo(() => {
    return {
      width: (size?.width || 300) - 10,
      height: (size?.height || 100) - 32,
    };
  }, [size]);

  const handleToggleExpand = (e: any, componentId: string) => {
    const list: string[] = expandIds.slice();
    const index = list.indexOf(componentId);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(componentId);
    }
    setExpandIds(list);
    const children: RenderStructureNode[] = [];
    list.forEach((item) => {
      const node = findStructureById(structure, item);
      if (node && node.children) {
        treeToList(node.children, children);
      }
    });
    onExpand(children.map((item) => item.id));
    e.stopPropagation();
  };

  const handleSelectComponent = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    component: RenderStructureNode,
  ) => {
    if (typeof onSelect === 'function') {
      onSelect(component, 'sider');
    }
    e.stopPropagation();
  };

  const treeList = useMemo(() => {
    const _structures = filterTree(structure, searchValue);

    const showStructures = insertRootNodeOnStructureTree(_structures, rootNode, readOnly);

    const list: TreeStructureNode[] = [];

    mapTreeToList({ nodes: showStructures, idx: 0, expandIds, list });
    return list;
  }, [rootNode, structure, expandIds, searchValue]);

  const scrollIndex = useMemo(() => {
    if (selectNodeFrom === 'viewer') {
      const index = treeList.findIndex((node) => node.id === selectNode?.id);
      return index >= 1 && index !== treeList.length - 1 ? index - 1 : index;
    }
    return undefined;
  }, [selectNode, selectNodeFrom]);

  const handleScroll = ({ scrollTop }) => {
    if (!isDragging) {
      onScroll(scrollTop);
    }
  };

  return (
    <RightClick
      config={{
        enableCopyIt: false,
        enableCopyAll: false,
        enablePasteIn: false,
        enablePasteAfter: false,
        enablePasteBefore: false,
      }}>
      <>
        <div
          className="foxpage-structure-tree text-xs relative h-full pb-4 pt-0 pl-[5px]"
          ref={containerRef}
          id={STRUCTURE_DROP_IN}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onDragLeave={onDragLeave}>
          {treeList && treeList.length > 0 ? (
            <VList
              height={listSize.height}
              rowCount={treeList.length}
              rowHeight={40}
              width={listSize.width}
              ref={listRef}
              overscanRowCount={10}
              scrollToIndex={scrollIndex}
              // scrollTop={isDragging ? computedScrollTop : undefined}
              style={{ overscrollBehavior: 'none', overflowX: 'hidden', scrollMargin: '30px' }}
              onScroll={handleScroll}
              rowRenderer={({ index, style }) => {
                const node = treeList[index];
                return (
                  <Row
                    data={{
                      node,
                      treeList,
                      dragId,
                      expandIds,
                      rootNode,
                      nodeChangedStatus,
                      selectNode,
                      searchValue,
                      handleToggleExpand,
                      handleSelectComponent,
                    }}
                    index={index}
                    key={treeList[index].id}
                    style={style}
                  />
                );
              }}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="h-full flex flex-col items-center justify-center"
            />
          )}
        </div>
      </>
    </RightClick>
  );
});

export default Tree;
