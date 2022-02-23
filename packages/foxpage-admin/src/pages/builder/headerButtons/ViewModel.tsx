import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';

import * as ACTIONS from '@/actions/builder/template';
import GlobalContext from '@/pages/GlobalContext';

import { IconContainer, IconMsg } from '../Header';

const mapStateToProps = (store: any) => ({
  viewModel: store.builder.template.viewModel,
});

const mapDispatchToProps = {
  updateViewModal: ACTIONS.updateViewModal,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Index: React.FC<Type> = props => {
  const { viewModel = 'PC', updateViewModal } = props;
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;
  return (
    <React.Fragment>
      <IconContainer
        className={viewModel === 'PC' ? 'selected' : ''}
        onClick={() => {
          updateViewModal('PC');
        }}
      >
        <DesktopOutlined />
        <IconMsg>{builder.pc}</IconMsg>
      </IconContainer>
      <IconContainer
        className={viewModel === 'PAD' ? 'selected' : ''}
        onClick={() => {
          updateViewModal('PAD');
        }}
      >
        <TabletOutlined />
        <IconMsg>{builder.pad}</IconMsg>
      </IconContainer>
      <IconContainer
        className={viewModel === 'MOBILE' ? 'selected' : ''}
        onClick={() => {
          updateViewModal('MOBILE');
        }}
      >
        <MobileOutlined />
        <IconMsg>{builder.mobile}</IconMsg>
      </IconContainer>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
