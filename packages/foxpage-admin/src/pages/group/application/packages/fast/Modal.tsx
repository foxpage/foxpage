import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { message, Modal } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/packages/fast';
import GlobalContext from '@/pages/GlobalContext';
import { ApplicationUrlParams } from '@/types/application';

import Main from './Main';

const mapStateToProps = (store: RootState) => ({
  groups: store.group.application.resource.groups.groupList,
  packages: store.group.application.packages.fast.packages,
  saving: store.group.application.packages.fast.saving,
  checkedList: store.group.application.packages.fast.checkedList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchPackages: ACTIONS.fetchPackages,
  save: ACTIONS.saveChanges,
};

export type IProps = {
  visible?: boolean;
  onVisibleChange: (state: boolean) => void;
};

type ModalProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

export const RegisterModal = (props: ModalProps) => {
  const { visible, checkedList, onVisibleChange, save, saving } = props;
  const { locale } = useContext(GlobalContext);
  const { applicationId } = useParams<ApplicationUrlParams>();
  const { package: packageI18n } = locale.business;
  const noNeedUpdates = !checkedList || checkedList.length === 0;

  const handleOk = () => {
    if (noNeedUpdates) {
      message.warn(packageI18n.fastSaveEmptyTips);
      return null;
    }
    save(applicationId);
  };

  return (
    <Modal
      title={packageI18n.quickly}
      visible={visible}
      onOk={handleOk}
      okButtonProps={{ disabled: noNeedUpdates }}
      onCancel={() => onVisibleChange(false)}
      confirmLoading={saving}
      destroyOnClose={true}
      maskClosable={false}
      bodyStyle={{ padding: '24px 0' }}
      width={1000}>
      <Main />
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(RegisterModal);
