import React, { useContext, useState } from 'react';

import styled from 'styled-components';

import { PanelHeader } from '@/components/index';
import { FoxContext } from '@/context/index';

import Actions from './structure/Actions';
import { Structure } from './structure';

const Container = styled.div`
  height: 100%;
`;

interface IProps {
  structurePushpin?: boolean;
  onPushpin?: (status: boolean) => void;
  onClose?: () => void;
}

const SidebarMain = (props: IProps) => {
  const [pushpin, setPushpin] = useState(true);
  const { foxI18n } = useContext(FoxContext);
  const { onPushpin, onClose } = props;

  const handlePushpin = () => {
    const value = !pushpin;
    setPushpin(value);
    if (typeof onPushpin === 'function') {
      onPushpin(value);
    }
  };

  return (
    <Container>
      <PanelHeader
        key="structure"
        title={foxI18n.structureTitle}
        extr={
          <Actions style={{ paddingTop: 4 }} pushpin={pushpin} onClose={onClose} onPushpin={handlePushpin} />
        }
      />
      <Structure />
    </Container>
  );
};

export default SidebarMain;
