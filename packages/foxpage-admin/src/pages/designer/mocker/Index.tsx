import React, { useEffect, useState } from 'react';

import { ArrowsAltOutlined, CloseOutlined, ShrinkOutlined } from '@ant-design/icons';
import { Drawer } from 'antd';
import styled from 'styled-components';

import { BuilderWindowChangeOptions, FoxBuilderEvents, RenderStructureNode } from '@/types/index';

import { CusButton } from '../components';
import { useEditorContext, useFoxpageContext } from '../context';
import EditorMain from '../editor/Main';

const Container = styled.div`
  height: calc(100% - 32px);
`;

const Actions = styled.div`
  width: 40px;
  display: flex;
`;

const DELAY = 260; //ms

const MockEditor = () => {
  const [delayVisible, setDelayVisible] = useState(false);
  const [shrink, setShrink] = useState(false);
  const {
    foxI18n,
    selectNode,
    events: { onUpdateComponent, onWindowChange },
  } = useFoxpageContext();
  const {
    mockerVisible: visible,
    events: { handleMockerVisible: visibleChange },
  } = useEditorContext();
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

  useEffect(() => {
    handleVisible(false);
  }, [selectNode?.id]);

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
      onWindowChange(target, { ...opt, isMock: true } as BuilderWindowChangeOptions);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Drawer
      title={<span style={{ fontSize: '14px' }}>{foxI18n.mockTip}</span>}
      placement="right"
      open={visible}
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
        top: 48,
        zIndex: 50,
        boxShadow: 'rgba(0, 0, 0, 0.1) -4px 4px 4px 2px',
        overflowY: 'auto',
        transition: 'all 0.3s',
        height: 'calc(100% - 48px)',
      }}>
      {delayVisible && (
        <Container>
          <EditorMain
            key="mock"
            type="mock"
            selectNode={__mock as RenderStructureNode}
            onChange={handleChange}
            onWindowChange={handleWindoWChange}
          />
        </Container>
      )}
    </Drawer>
  );
};

export default MockEditor;
