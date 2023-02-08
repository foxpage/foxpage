import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { message, Modal } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/fast';
import { GlobalContext } from '@/pages/system';

import Main from '../Main';

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  groups: store.applications.detail.resources.groups.groupList,
  packages: store.applications.detail.packages.fast.packages,
  saving: store.applications.detail.packages.fast.saving,
  checkedList: store.applications.detail.packages.fast.checkedList,
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
  const { applicationId, visible, checkedList, onVisibleChange, save, saving } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { package: packageI18n } = locale.business;
  const noNeedUpdates = !checkedList || checkedList.length === 0;

  const handleOk = () => {
    if (noNeedUpdates) {
      message.warn(packageI18n.fastSaveEmptyTips);
      return null;
    }
    if (applicationId) save(applicationId);
  };

  return (
    <Modal
      title={packageI18n.quickly}
      open={visible}
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
