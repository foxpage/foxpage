import React, { CSSProperties, FC, useContext, useImperativeHandle, useMemo, useRef, useState } from 'react';
import List from 'react-virtualized/dist/commonjs/List';

//@ts-ignore
import { useSize } from 'ahooks';

import { STRUCTURE_DROP_IN } from '@/constant/index';
import { EditorContext, FoxContext, StructureTreeContext } from '@/context/index';
import { RenderStructure, RenderStructureNode } from '@/types/index';
import { findStructureById, treeToList } from '@/utils/finders';

import Node from './Node';

const VList = List as unknown as FC<any>;

type TreeStructureNode = RenderStructureNode & { depth: number; dataIndex: number };

const Row = (props: { data; index; style }) => {
  const { data, index, style } = props;
  const {
    treeList,
    dragId,
    expandIds,
    rootNode,
    nodeChangedStatus,
    handleToggleExpand,
    handleSelectComponent,
    selectNode,
  } = data;
  const node = treeList[index];
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
            component={node}
            childNum={childNum}
            expended={expanded}
            style={{ paddingLeft: _paddingLeft }}
            toolBar={!isRootNode}
            toggleExpend={(e) => handleToggleExpand(e, id)}
            onSelect={handleSelectComponent}
            selected={selected}
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
  const { pageStructure: structure, rootNode, nodeChangedStatus } = useContext(FoxContext);
  const { selectNode, selectNodeFrom } = useContext(EditorContext);
  const { dragId, isDragging, onScroll, onDragOver, onDragLeave, onDrop, onExpand, onSelect } =
    useContext(StructureTreeContext);
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
      onSelect(component, { from: 'sider' });
    }
    e.stopPropagation();
  };

  const treeList = useMemo(() => {
    const showStructures = rootNode ? [{ ...rootNode, children: structure }] : structure;
    const list: TreeStructureNode[] = [];
    const treeMap = ({ nodes, depth = 0, idx }: { nodes: RenderStructure; depth?: number; idx: number }) => {
      nodes.forEach((node, index) => {
        const expanded = !(expandIds.indexOf(node.id) > -1);
        let newDepth = depth;
        const dataIndex = node.__styleNode ? idx : index;
        // const isWrapper =
        //           node.children && node.children.length > 0 && node.children[0].__styleNode
        //             ? node.children[0].__styleNode?.id === node.id
        //             : false;
        if (node.__editorConfig?.showInStructure !== false) {
          list.push({ ...node, depth, dataIndex });
          newDepth++;
        }

        if (node.children && expanded) {
          treeMap({ nodes: node.children, depth: newDepth, idx: dataIndex });
        }
      });
    };
    treeMap({ nodes: showStructures, idx: 0 });
    return list;
  }, [rootNode, structure, expandIds]);

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
  useImperativeHandle(
    ref,
    () => {
      maxScrollTop: treeList.length * 40 - listSize.height;
    },
    [listSize, treeList.length],
  );

  return (
    <div
      className="text-xs relative h-full py-4 pl-[5px]"
      ref={containerRef}
      id={STRUCTURE_DROP_IN}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}>
      {/* auto sizer need a computed height with it, use `flex-1 minHeight` or fixed height*/}

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
        rowRenderer={({ index, style }) => (
          <Row
            data={{
              treeList,
              dragId,
              expandIds,
              rootNode,
              nodeChangedStatus,
              selectNode,
              handleToggleExpand,
              handleSelectComponent,
            }}
            index={index}
            key={treeList[index].id}
            style={style}
          />
        )}
      />
    </div>
  );
});

export default Tree;
