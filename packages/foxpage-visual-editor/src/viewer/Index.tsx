import React, { useContext, useMemo, useState } from 'react';

import { BulbOutlined, InboxOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import { EditorContext, FoxContext } from '@/context/index';
import { RenderStructureNode } from '@/types/index';

import { MainView } from './Main';
import Tools from './Tools';

const PAGE_NODE_NAME = 'page';

const Container = styled.div`
  background-color: #f2f2f2;
  height: 100%;
  padding: 0 12px 12px;
  position: relative;
`;

const Viewer = styled.div`
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  max-width: 1440px;
  height: 100%;
  transition: all 0.3s ease 0s;
  user-select: none;
  background-color: #ffffff;
`;

const ModalSelector = styled.div`
  width: 400px;
  padding: 10px;
  border: 1px dashed #dddddd;
  background: #ffffff;
  font-size: 40px;
  color: #cac6c6;
  text-align: center;
  cursor: pointer;
  position: absolute;
  top: calc(50% - 55px);
  left: calc(50% - 200px);
  :hover {
    background: #f2f2f2;
  }
`;

const ReRendering = styled.div`
  animation-duration: 2s;
  animation-iteration-count: infinite;
  animation-name: breathing;
  animation-timing-function: linear;
  position: absolute;
  top: 0;
  background-color: #f2f2f2;
  width: 100%;
  padding: 12px;
  color: #52c41a;
  text-align: center;
  font-weight: bold;
  @keyframes breathing {
    0% {
      opacity: 1;
    }
    50.0% {
      opacity: 0.6;
    }
    100.0% {
      opacity: 1;
    }
  }
`;

interface IProps {}

const ViewerIndex = (_props: IProps) => {
  const [placeholder, setPlaceHolder] = useState({});
  const { viewWidth } = useContext(EditorContext);
  const { events, foxI18n, pageStructure: structure, reRendering } = useContext(FoxContext);
  const { onWindowChange } = events || {};

  const pageContentEmpty = useMemo(() => {
    let isEmpty = false;

    const baseNode: RenderStructureNode = structure?.[0] || {};
    if (baseNode) {
      if (baseNode.name === PAGE_NODE_NAME && baseNode?.children && baseNode.children.length === 0) {
        isEmpty = true;
      }
    }

    return isEmpty;
  }, [structure]);

  const handleModalSelect = () => {
    if (typeof onWindowChange === 'function') {
      onWindowChange('pageBind', {});
    }
  };

  return (
    <Container>
      <Viewer
        style={{
          width: viewWidth,
          boxShadow: pageContentEmpty ? 'none' : 'rgba(0, 0, 0, 0.05) 0 0 6px 2px',
        }}>
        <MainView onPlaceholder={setPlaceHolder} />
        <Tools placeholder={placeholder} />
        {reRendering && (
          <ReRendering>
            <BulbOutlined /> {foxI18n.reRendering}
          </ReRendering>
        )}
        {pageContentEmpty && (
          <ModalSelector onClick={handleModalSelect}>
            <InboxOutlined />
            <div style={{ fontSize: 22 }}>{foxI18n.selectTemplateTips}</div>
          </ModalSelector>
        )}
      </Viewer>
    </Container>
  );
};

export default ViewerIndex;
