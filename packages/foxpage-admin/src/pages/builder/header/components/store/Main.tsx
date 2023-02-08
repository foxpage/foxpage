import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { FileSearchOutlined } from '@ant-design/icons';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { FileType } from '@/constants/index';
import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';

import { Modal } from './components';

const mapStateToProps = (store: RootState) => ({
  fileType: store.builder.main.file?.type,
  blocked: store.builder.main.lockerState.blocked,
  content: store.builder.main.content,
});

const mapDispatchToProps = {
  openModal: ACTIONS.updateStoreModalVisible,
};

type PageCopyType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PageCopy: React.FC<PageCopyType> = (props) => {
  const { fileType, blocked, content, openModal } = props;
  const isExtend = !!content?.extension?.extendId;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file } = locale.business;

  return (
    <>
      {fileType === FileType.page && !isExtend && (
        <>
          <StyledIcon
            className={blocked ? 'disabled' : ''}
            onClick={() => {
              if (blocked) {
                return;
              }
              openModal(true);
            }}>
            <FileSearchOutlined />
            <IconMsg>{file.page}</IconMsg>
          </StyledIcon>
          <Modal />
        </>
      )}
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageCopy);
