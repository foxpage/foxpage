import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { Modal, Select } from 'antd';
import { RootState } from 'typesafe-actions';

import { fetchList as fetchApplicationList } from '@/actions/group/application/list';
import * as ACTIONS from '@/actions/store/list';
import { FileTypeEnum } from '@/constants/index';
import { StoreBuyGoodsType } from '@/constants/store';
import GlobalContext from '@/pages/GlobalContext';

const { Option } = Select;

const PAGE_NUMBER = 1;
const PAGE_SIZE = 9999;

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
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

const BuyModal: React.FC<BuyModalProps> = (props) => {
  const {
    organizationId,
    type,
    buyModalVisible,
    applicationList,
    buyIds,
    updateBuyModalVisible,
    fetchApplicationList,
    addGoods,
  } = props;
  const { locale } = useContext(GlobalContext);
  const { application, store } = locale.business;
  let selectedAppIds: string[] = [];

  useEffect(() => {
    if (buyModalVisible) {
      fetchApplicationList({ organizationId, page: PAGE_NUMBER, size: PAGE_SIZE });
    }
  }, [buyModalVisible, fetchApplicationList, organizationId]);

  const handleClose = () => {
    updateBuyModalVisible(false);
  };

  const handleApplicationChange = (value) => {
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
      title={store.buyModalTitle}
      destroyOnClose
      maskClosable={false}
      visible={buyModalVisible}
      onCancel={handleClose}
      onOk={handleOnOk}>
      <Select
        mode="multiple"
        style={{ width: '100%' }}
        placeholder={application.selectApplication}
        defaultValue={[]}
        onChange={handleApplicationChange}>
        {applicationList?.map((application) => (
          <Option key={application.id} value={application.id}>
            {application.name}
          </Option>
        ))}
      </Select>
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(BuyModal);
