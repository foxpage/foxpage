import React, { ReactNode, useEffect, useState } from 'react';

import { CloseOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Drawer as AntdDrawer, DrawerProps } from 'antd';
import styled from 'styled-components';

import { ScrollBar } from '@/components/common/styles';
import shortId from '@/utils/short-id';

const Drawer = styled(AntdDrawer)`
  .ant-drawer-wrapper-body {
    padding: 0;
    height: 100%;
  }
  .ant-drawer-body {
    padding: 0;
    height: 100%;
  }
`;

const Container = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
`;

const TitBar = styled.div`
  box-sizing: border-box;
  background: #fff;
  text-align: center;
  line-height: 48px;
  height: 48px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
  z-index: 100;
`;

const TitCon = styled.div`
  position: absolute;
  width: 100%;
`;

const Tit = styled.span`
  font-size: 16px;
  color: #666;
  font-weight: 500;
`;

const Content = styled(ScrollBar)`
  height: 100%;
  flex-grow: 1;
`;

const Close = styled(CloseOutlined)`
  display: inline-flex;
  float: left;
  color: #666;
  position: relative;
  z-index: 1;
  height: 48px;
  width: 48px;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  svg {
    height: 18px;
    width: 18px;
  }
  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }
`;

const Action = styled.div`
  float: right;
  line-height: 1;
  padding: 8px;
`;

const ExpendContainer = styled.div`
  position: absolute;
  top: 0;
  left: 50px;
  z-index: 100;
  display: flex;
`;

const Line = styled.div`
  border-left: 1px solid #ddd;
  margin: 12px 2px 12px 0;
`;

const ExpendBtn = styled.div`
  padding: 8px 10px;
  line-height: 32px;
  width: 48px;
  text-align: center;
  border-radius: 50%;
  background: #fff;
  font-size: 16px;
  :hover {
    background: #00000014;
    cursor: pointer;
  }
`;

interface OperationDrawerProps extends DrawerProps {
  open?: boolean;
  canExpend?: boolean;
  children: ReactNode;
  actions?: ReactNode | null;
}

const OperationDrawer: React.FC<OperationDrawerProps> = (props) => {
  const [key] = useState(shortId());
  const [visible, setVisible] = useState(false);
  const [expendScreen, setExpendScreen] = useState(false);
  const {
    actions = null,
    canExpend = false,
    children,
    destroyOnClose,
    maskClosable,
    open = false,
    placement = 'right',
    title,
    width = 640,
    onClose,
    ...otherProps
  } = props;

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setVisible(open);
      }, 300);
    } else {
      setVisible(open);
    }
  }, [open]);

  const handleExpend = () => {
    setExpendScreen(!expendScreen);
  };

  const handleClose = (e) => {
    if (typeof onClose === 'function') {
      onClose(e);
    }
  };

  return (
    <Drawer
      key={key}
      placement={placement}
      closable={false}
      maskClosable={maskClosable}
      width={expendScreen ? '80%' : width}
      onClose={handleClose}
      open={visible}
      destroyOnClose={destroyOnClose}
      {...otherProps}>
      <Container data-id={key}>
        <TitBar>
          <Close color="inherit" onClick={handleClose} />
          {canExpend && (
            <ExpendContainer>
              <Line />
              <ExpendBtn onClick={handleExpend}>
                {expendScreen ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              </ExpendBtn>
            </ExpendContainer>
          )}
          {title && (
            <TitCon>
              <Tit>{title}</Tit>
            </TitCon>
          )}
          {actions && <Action>{actions}</Action>}
        </TitBar>
        <Content>{children}</Content>
      </Container>
    </Drawer>
  );
};

export default OperationDrawer;
