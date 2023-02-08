import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { CloudUploadOutlined, SyncOutlined } from '@ant-design/icons';
import { RootState } from 'typesafe-actions';

import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';

interface Type extends ReturnType<typeof mapStateToProps> {
  loading: boolean;
  editStatus: boolean;
  onSave: () => void;
}

const mapStateToProps = (store: RootState) => ({
  blocked: store.builder.main.lockerState.blocked,
});

const Main: React.FC<Type> = (props) => {
  const { blocked, loading, editStatus, onSave } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  const handleSave = () => {
    if (editStatus && !blocked) {
      onSave();
    }
  };

  return (
    <StyledIcon className={editStatus && !blocked ? '' : 'disabled'} onClick={handleSave}>
      {loading ? <SyncOutlined spin={true} style={{ color: '#1890ff' }} /> : <CloudUploadOutlined />}
      <IconMsg>{global.save}</IconMsg>
    </StyledIcon>
  );
};

export default connect(mapStateToProps, {})(Main);
