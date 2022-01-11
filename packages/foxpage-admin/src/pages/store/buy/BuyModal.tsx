import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { Modal, Select } from 'antd';
import { RootState } from 'typesafe-actions';

import { fetchList as fetchApplicationList } from '@/actions/group/application/list';
import * as ACTIONS from '@/actions/store/list';
import { FileTypeEnum } from '@/constants/index';
import { StoreBuyGoodsType } from '@/constants/store';
import { getLoginUser } from '@/utils/login-user';

const { Option } = Select;

const mapStateToProps = (store: RootState) => ({
  buyModalVisible: store.store.list.buyModalVisible,
  applicationList: store.group.application.list.list,
  buyIds: store.store.list.buyIds,
  type: store.store.list.type,
});

const mapDispatchToProps = {
  updateBuyModalVisible: ACTIONS.updateBuyModalVisible,
  addGoods: ACTIONS.addGoods,
  fetchApplicationList: fetchApplicationList,
};

type BuyModalProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const BuyModal: React.FC<BuyModalProps> = props => {
  const { type, buyModalVisible, applicationList, buyIds, updateBuyModalVisible, fetchApplicationList, addGoods } =
    props;
  const userInfo = getLoginUser();
  let selectedAppIds: string[] = [];

  useEffect(() => {
    if (buyModalVisible && userInfo) {
      fetchApplicationList({ organizationId: userInfo?.organizationId });
    }
  }, [buyModalVisible]);

  const handleClose = () => {
    updateBuyModalVisible(false);
  };

  const handleApplicationChange = value => {
    selectedAppIds = value;
  };

  const handleOnOk = () => {
    addGoods({
      appIds: selectedAppIds,
      goodsIds: buyIds,
      delivery: type === FileTypeEnum.package ? StoreBuyGoodsType.reference : StoreBuyGoodsType.clone,
    });
  };

  return (
    <Modal
      title="Application Selector"
      destroyOnClose
      maskClosable={false}
      visible={buyModalVisible}
      onCancel={handleClose}
      onOk={handleOnOk}
    >
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="select application"
        defaultValue={[]}
        onChange={handleApplicationChange}
      >
        {applicationList?.map(application => (
          <Option key={application.id} value={application.id}>
            {application.name}
          </Option>
        ))}
      </Select>
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(BuyModal);
