import React, { useEffect, useState } from 'react';

import { QrcodeOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import QRCode from 'qrcode';

interface Props {
  url: string;
  children?: React.ReactElement | string;
  size?: number;
}

export function UrlWithQRcode(props: Props) {
  const { url, size = 128 } = props;
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(url, { width: size }).then((codeUrl) => {
      setQrCode(codeUrl);
    });
  }, [url, size]);

  return (
    <>
      <Dropdown trigger={['hover']} overlay={<img src={qrCode} className="qr-code" />}>
        <QrcodeOutlined style={{ marginRight: 8 }} className="qr-code-outlined" />
      </Dropdown>
      {props.children}
    </>
  );
}

export default UrlWithQRcode;
