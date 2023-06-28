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
  extend: store.builder.main.extend,
  content: store.builder.main.content,
});

const mapDispatchToProps = {
  openModal: ACTIONS.updateStoreModalVisible,
};

type PageCopyType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PageCopy: React.FC<PageCopyType> = (props) => {
  const { fileType, blocked, extend, content, openModal } = props;
  const show =
    content &&
    content.id &&
    fileType === FileType.page &&
    extend !== undefined &&
    Object.keys(extend).length === 0;
  // i18n
  const { locale } = useContext(GlobalContext);
  const { file } = locale.business;

  return (
    <>
      {show && (
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
            <IconMsg>{file.pageBoilerplate}</IconMsg>
          </StyledIcon>
          <Modal />
        </>
      )}
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageCopy);
