import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { FileSearchOutlined } from '@ant-design/icons';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';

import { Modal } from './components';
import { FileType } from '@/constants/index';

const mapStateToProps = (store: RootState) => ({
  fileType: store.builder.main.file?.type,
});

const mapDispatchToProps = {
  openModal: ACTIONS.updateStoreModalVisible,
};

type PageCopyType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PageCopy: React.FC<PageCopyType> = (props) => {
  const { fileType, openModal } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file } = locale.business;

  return (
    <>
      {fileType === FileType.page && (
        <>
          <StyledIcon
            onClick={() => {
              openModal(true);
            }}>
            <FileSearchOutlined />
            <IconMsg>{file.template}</IconMsg>
          </StyledIcon>
          <Modal />
        </>
      )}
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageCopy);
