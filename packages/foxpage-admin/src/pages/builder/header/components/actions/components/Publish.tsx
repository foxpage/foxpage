import React, { useContext } from 'react';

import { SyncOutlined } from '@ant-design/icons';

import { PublishIcon } from '@/components/index';
import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';

interface Type {
  loading: boolean;
  onPublish: () => void;
}

const Main: React.FC<Type> = (props) => {
  const { loading, onPublish } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { version } = locale.business;

  return (
    <StyledIcon onClick={onPublish}>
      {loading ? <SyncOutlined spin={true} style={{ color: '#1890ff' }} /> : <PublishIcon />}
      <IconMsg>{version.publish}</IconMsg>
    </StyledIcon>
  );
};

export default Main;
