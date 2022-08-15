import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import SidebarMain from './Main';
import SideSimple from './Simple';

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
`;

const DELAY = 250;

interface IProps {
  expend?: boolean;
  onExpend?: (status: boolean) => void;
}

const SidebarIndex = (props: IProps) => {
  const [menu, setMenu] = useState('');
  const [delayExpend, setDelayExpend] = useState(false);
  const { expend, onExpend } = props;

  useEffect(() => {
    if (expend) {
      setTimeout(() => {
        setDelayExpend(expend);
      }, DELAY);
    } else {
      setDelayExpend(expend || false);
    }
  }, [expend]);

  const handlePushpin = (value) => {
    if (typeof onExpend === 'function') {
      onExpend(value);
    }
    if (value) {
      setMenu('structure');
    }
  };

  return (
    <Container>
      <div style={{ flex: '0 0 38px', borderRight: '1px solid #f2f2f2' }}>
        <SideSimple menu={menu} structurePushpin={expend} onStructurePushpin={handlePushpin} />
      </div>
      {delayExpend && (
        <div style={{ flexGrow: 1, height: 'calc(100% - 32px)' }}>
          <SidebarMain
            onPushpin={handlePushpin}
            onClose={() => {
              handlePushpin(false);
              setMenu('unknown');
            }}
          />
        </div>
      )}
    </Container>
  );
};

export default SidebarIndex;
