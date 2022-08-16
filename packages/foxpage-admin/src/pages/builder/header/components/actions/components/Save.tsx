import React, { useContext } from 'react';

import { CloudUploadOutlined, SyncOutlined } from '@ant-design/icons';

import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';

interface Type {
  loading: boolean;
  editStatus: boolean;
  onSave: () => void;
}

const Main: React.FC<Type> = (props) => {
  const { loading, editStatus, onSave } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  const handleSave = () => {
    if (editStatus) {
      onSave();
    }
  };

  return (
    <StyledIcon className={editStatus ? '' : 'disabled'} onClick={handleSave}>
      {loading ? <SyncOutlined spin={true} style={{ color: '#1890ff' }} /> : <CloudUploadOutlined />}
      <IconMsg>{global.save}</IconMsg>
    </StyledIcon>
  );
};

export default Main;
