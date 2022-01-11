import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/template';

import { SYSTEM_PAGE } from '../../constant';

const Boundary = styled.div`
  border: 2px solid #1890ff;
  position: absolute;
  right: 10px;
  z-index: 1;
  pointer-events: none;
`;

const Button = styled.button`
  font-size: 12px;
  background: rgb(24, 144, 255);
  width: 26px;
  height: 20px;
  color: rgb(255, 255, 255);
  text-align: center;
  line-height: 15px;
  border: none;
  border-radius: 0px;
  padding: 0px;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  &:hover {
    background: rgb(64, 169, 255);
  }
`;
const OperateTool = styled.div`
  position: absolute;
  pointer-events: all;
  right: 10px;
  text-align: right;
  pointer-events: auto;
`;

const BUTTON_SIZE = 22; // height & width

const mapStateToProps = (store: RootState) => ({
  selectedComponent: store.builder.template.selectedComponent,
  versionChange: store.builder.template.versionChange,
});

const mapDispatchToProps = {
  deleteComponent: ACTIONS.deleteComponent,
  copyComponent: ACTIONS.copyComponent,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Tools: React.FC<Type> = props => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [rect, setRect] = useState<{ top: number; height: number; width: number }>({ top: 0, height: 0, width: 0 });
  const { selectedComponent, versionChange, deleteComponent, copyComponent } = props;

  const getSelectedElement = (id: string) => {
    return document.getElementById(id || SYSTEM_PAGE);
  };

  useEffect(() => {
    const root = document.getElementById('root');
    if (root && selectedComponent) {
      // TODO: optimize
      setTimeout(() => {
        const scrollTop = root.getBoundingClientRect().top;
        updateRect(scrollTop);
      });
      root.addEventListener('scroll', () => {
        const scrollTop = root.getBoundingClientRect().top;
        updateRect(scrollTop);
      });
    } else {
      setRect({ top: 0, height: 0, width: 0 });
    }
  }, [selectedComponent, versionChange]);

  const updateRect = (scrollTop: number) => {
    if (!selectedComponent) {
      setRect({ top: 0, height: 0, width: 0 });
      return;
    }
    const element = getSelectedElement(selectedComponent.id);
    if (element) {
      const { top, width, height } = element.getBoundingClientRect();
      setRect({ top: top - scrollTop, width, height });
    }
  };

  if (!selectedComponent || !getSelectedElement(selectedComponent.id)) {
    return null;
  }

  const { top = 0, width = 0, height = 0 } = rect;

  return (
    <React.Fragment>
      <Boundary style={{ top, width: Math.max(width, 42), height }} />
      {selectedComponent.id && (
        <OperateTool style={{ top: top - BUTTON_SIZE < 0 ? top + height : top - BUTTON_SIZE }}>
          <Popconfirm
            title="Are you sure to copy this component?"
            onConfirm={() => {
              copyComponent(applicationId, selectedComponent.wrapper || selectedComponent.id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button>
              <CopyOutlined />
            </Button>
          </Popconfirm>

          <Popconfirm
            title="Are you sure to delete this component?"
            onConfirm={() => {
              deleteComponent(applicationId, selectedComponent.wrapper || selectedComponent.id);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button>
              <DeleteOutlined />
            </Button>
          </Popconfirm>
        </OperateTool>
      )}
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Tools);
