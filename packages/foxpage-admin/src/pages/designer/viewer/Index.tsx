import React, { useMemo } from 'react';

import styled from 'styled-components';

import { RenderStructureNode } from '@/types/index';

import { useFoxpageContext } from '../context';

import { MainView } from './Main';
import Tools from './Tools';

const PAGE_NODE_NAME = 'page';

const Container = styled.div`
  background-color: #f2f2f2;
  height: 100%;
  padding: 12px;
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

interface IProps {}

const ViewerIndex = (_props: IProps) => {
  const { events, pageStructure: structure, config } = useFoxpageContext();
  const { onWindowChange } = events || {};
  const viewWidth = config.sys?.viewWidth || '';

  const pageContentEmpty = useMemo(() => {
    let isEmpty = false;

    const baseNode: RenderStructureNode = structure?.[0];
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
        <MainView pageContentEmpty={pageContentEmpty} handleModalSelect={handleModalSelect} />
        <Tools />
      </Viewer>
    </Container>
  );
};

export default ViewerIndex;
