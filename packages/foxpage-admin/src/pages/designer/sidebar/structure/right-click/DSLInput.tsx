import { JSONEditor } from '@/pages/designer/components';
import { useFoxpageContext } from '@/pages/designer/context';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';

type IProps = {
  open: boolean;
  onOk?: (data: any) => void;
  onCancel?: () => void;
};

export const DSLInput = (props: IProps) => {
  const { open = false, onOk, onCancel } = props;
  const { foxI18n } = useFoxpageContext();
  const [data, setData] = useState({});

  useEffect(() => {
    if (open === false) {
      setData({});
    }
  }, [open]);

  const handlePropsChange = (value) => {
    setData(value);
  };

  const handleOk = () => {
    onOk?.(data);
  };

  return (
    <Modal
      open={open}
      title={foxI18n.rightClickDSLInputTips}
      maskClosable={false}
      centered={true}
      width={600}
      closable={false}
      onOk={handleOk}
      onCancel={() => onCancel?.()}>
      <div style={{ height: '400px', overflow: 'auto' }}>
        <JSONEditor
          key={String(open)}
          jsonData={data}
          onChangeJSON={handlePropsChange}
          options={{ mode: 'code' }}
        />
      </div>
    </Modal>
  );
};
