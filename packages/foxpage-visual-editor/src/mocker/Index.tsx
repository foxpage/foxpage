import React, { useContext, useEffect, useState } from 'react';

import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import styled from 'styled-components';

import CusButton from '@/components/common/Button';
import { FoxBuilderEvents, RenderStructureNode } from '@/types/index';

import { FoxContext } from '../context';
import EditorMain from '../editor/Main';

const Container = styled.div`
  height: calc(100% - 32px);
`;

const Actions = styled.div`
  width: 40px;
  display: flex;
`;

const DELAY = 260; //ms

interface IProps {
  selectNode: RenderStructureNode | null;
  visible: boolean;
  visibleChange: (status: boolean) => void;
}

const MockEditor = (props: IProps) => {
  const [delayVisible, setDelayVisible] = useState(false);
  const [shrink, setShrink] = useState(false);
  const { foxI18n, events } = useContext(FoxContext);
  const { onUpdateComponent, onWindowChange } = events;
  const { visible, selectNode, visibleChange } = props;
  const { __mock = null } = selectNode || {};

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        setDelayVisible(visible);
      }, DELAY);
    } else {
      setDelayVisible(visible);
    }
  }, [visible]);

  const handleVisible = (value: boolean) => {
    visibleChange(value);
  };

  const handleShrink = () => {
    const _shrink = !shrink;
    setShrink(_shrink);
  };

  const handleClose = () => {
    handleVisible(false);
  };

  const icons = () => (shrink ? <ShrinkOutlined /> : <ArrowsAltOutlined />);

  const handleChange = (value: RenderStructureNode) => {
    if (typeof onUpdateComponent === 'function') {
      onUpdateComponent(value);
    }
  };

  const handleWindoWChange: FoxBuilderEvents['onWindowChange'] = (target, opt) => {
    if (typeof onWindowChange === 'function') {
      onWindowChange(target, opt);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Drawer
      title={<span style={{ fontSize: '14px' }}>{foxI18n.mockTip}</span>}
      placement="right"
      visible={visible}
      destroyOnClose
      mask={false}
      closable={false}
      extra={
        <Actions>
          <CusButton icon={icons} onClick={handleShrink} />
          <CusButton icon={<CloseOutlined />} onClick={handleClose} />
        </Actions>
      }
      width={shrink ? 500 : 300}
      headerStyle={{ padding: '4px 8px' }}
      bodyStyle={{ padding: 0 }}
      getContainer={false}
      style={{
        position: 'absolute',
        top: 0,
        zIndex: 50,
        boxShadow: 'rgba(0, 0, 0, 0.1) -4px 4px 4px 2px',
        overflowY: 'auto',
        transition: 'all 0.3s',
      }}>
      {delayVisible && (
        <Container>
          <EditorMain
            key="mock"
            selectNode={__mock}
            type="mock"
            onChange={handleChange}
            onWindowChange={handleWindoWChange}
          />
        </Container>
      )}
    </Drawer>
  );
};

export default MockEditor;
