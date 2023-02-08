import React, { useEffect, useState } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload } from 'antd';
import styled from 'styled-components';

const Container = styled.div`
  .ant-upload-list-picture-card-container {
    width: 226px;
  }
  .ant-upload-list-item-list-type-picture-card {
    width: 226px !important;
  }
  .ant-upload-select-picture-card {
    width: 226px !important;
  }
`;

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function CoverUpload(props) {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [fileList, setFileList] = useState(
    props.value && props.value.url ? [{ uid: props.value.id, id: props.value.id, url: props.value.url }] : [],
  );
  const { value, onChange } = props;
  const uploadProps = {
    name: 'file',
    // @ts-ignore
    action: `${APP_CONFIG.foxpageApi}api/picture/upload`,
    headers: {},
    withCredentials: true,
    accept: 'image/*',
  };

  useEffect(() => {
    if (value && value.id && value.url) {
      setFileList([{ uid: value.id, id: value.id, url: value.url }]);
    }
  }, [value]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
  };

  const handleChange = ({ fileList: newFileList }) => {
    if (newFileList.length > 0) {
      const validFile = newFileList[newFileList.length - 1];
      if (validFile.status === 'done') {
        const { response = {} } = validFile;
        const { id, url } = response.data || {};
        setFileList([
          {
            uid: validFile.uid,
            // @ts-ignore
            name: validFile.name,
            status: validFile.status,
            url,
            id,
          },
        ]);
        onChange({ url, id });
      } else {
        setFileList([validFile]);
      }
    } else {
      setFileList([]);
      onChange('');
    }
  };

  const handleCancel = () => {
    setPreviewVisible(false);
  };

  return (
    <Container>
      <Upload
        {...uploadProps}
        // @ts-ignore
        fileList={fileList}
        listType="picture-card"
        onPreview={handlePreview}
        onChange={handleChange}>
        <div>
          <PlusOutlined />
          <div className="ant-upload-text">Upload</div>
        </div>
      </Upload>
      <Modal open={previewVisible} width="1080px" footer={null} onCancel={handleCancel}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Container>
  );
}

export default CoverUpload;
