import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Modal, Radio, Select } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/store/list';
import { FileType, StoreGoodsPurchaseType } from '@/constants/index';
import { GlobalContext } from '@/pages/system';

const { Option } = Select;

const PAGE_NUMBER = 1;
const PAGE_SIZE = 9999;

const mapStateToProps = (store: RootState) => ({
  applicationList: store.store.list.applicationList,
  buyIds: store.store.list.buyIds,
  visible: store.store.list.buyModalVisible,
  type: store.store.list.type,
});

const mapDispatchToProps = {
  updateBuyModalVisible: ACTIONS.updateBuyModalVisible,
  addGoods: ACTIONS.addGoods,
  fetchApplicationList: ACTIONS.fetchApplicationList,
};

type BuyModalProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const BuyModal: React.FC<BuyModalProps> = (props) => {
  const { applicationList, buyIds, type, visible, updateBuyModalVisible, fetchApplicationList, addGoods } =
    props;
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [deliveryType, setDeliveryType] = useState<StoreGoodsPurchaseType | undefined>();

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { application, store } = locale.business;

  const deliveryTypeMap = [
    {
      label: store.clone,
      value: StoreGoodsPurchaseType.clone,
    },
    {
      label: store.refer,
      value: StoreGoodsPurchaseType.reference,
    },
  ];

  useEffect(() => {
    if (!visible) {
      setSelectedAppIds([]);
      setDeliveryType(undefined);
    } else {
      const _deliveryType =
        type === 'package' ? StoreGoodsPurchaseType.reference : StoreGoodsPurchaseType.clone;

      setDeliveryType(_deliveryType);
    }
  }, [type, visible]);

  useEffect(() => {
    if (visible) {
      fetchApplicationList({ organizationId, page: PAGE_NUMBER, size: PAGE_SIZE });
    }
  }, [visible, fetchApplicationList, organizationId]);

  const handleClose = () => {
    updateBuyModalVisible(false);
  };

  const handleOnOk = () => {
    addGoods({
      appIds: selectedAppIds,
      goodsIds: buyIds,
      delivery: deliveryType || StoreGoodsPurchaseType.clone,
    });
  };

  return (
    <Modal
      title={store.buyModalTitle}
      destroyOnClose
      maskClosable={false}
      open={visible}
      onCancel={handleClose}
      onOk={handleOnOk}>
      <Select
        mode="multiple"
        placeholder={application.selectApplication}
        value={selectedAppIds}
        onChange={setSelectedAppIds}
        style={{ width: '100%', marginBottom: 16 }}>
        {applicationList?.map((application) => (
          <Option key={application.id} value={application.id}>
            {application.name}
          </Option>
        ))}
      </Select>
      <Radio.Group
        disabled={type === FileType.variable}
        options={deliveryTypeMap}
        value={deliveryType}
        onChange={(e) => setDeliveryType(e.target.value)}
      />
    </Modal>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(BuyModal);
