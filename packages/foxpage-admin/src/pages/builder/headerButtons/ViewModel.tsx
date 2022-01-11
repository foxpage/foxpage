import React from 'react';
import { connect } from 'react-redux';

import { DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';

import * as ACTIONS from '@/actions/builder/template';

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

  return (
    <React.Fragment>
      <IconContainer
        className={viewModel === 'PC' ? 'selected' : ''}
        onClick={() => {
          updateViewModal('PC');
        }}
      >
        <DesktopOutlined />
        <IconMsg>PC</IconMsg>
      </IconContainer>
      <IconContainer
        className={viewModel === 'PAD' ? 'selected' : ''}
        onClick={() => {
          updateViewModal('PAD');
        }}
      >
        <TabletOutlined />
        <IconMsg>Pad</IconMsg>
      </IconContainer>
      <IconContainer
        className={viewModel === 'MOBILE' ? 'selected' : ''}
        onClick={() => {
          updateViewModal('MOBILE');
        }}
      >
        <MobileOutlined />
        <IconMsg>Mobile</IconMsg>
      </IconContainer>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
