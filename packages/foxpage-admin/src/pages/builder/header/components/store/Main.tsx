import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { FileSearchOutlined } from '@ant-design/icons';

import * as ACTIONS from '@/actions/builder/header';
import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';

import { Modal } from './components';

const mapStateToProps = () => ({});

const mapDispatchToProps = {
  openModal: ACTIONS.updateStoreModalVisible,
};

type PageCopyType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const PageCopy: React.FC<PageCopyType> = (props) => {
  const { openModal } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file } = locale.business;

  return (
    <>
      <StyledIcon
        onClick={() => {
          openModal(true);
        }}>
        <FileSearchOutlined />
        <IconMsg>
          {file.page}
          {file.template}
        </IconMsg>
      </StyledIcon>
      <Modal />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(PageCopy);
