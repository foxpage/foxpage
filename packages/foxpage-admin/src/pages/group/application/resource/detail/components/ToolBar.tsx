import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { DeleteOutlined, FolderAddOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import GlobalContext from '@/pages/GlobalContext';
import * as ACTIONS from '@/store/actions/group/application/resource/detail';

const OperateContainer = styled.div`
  text-align: right;
  margin-bottom: 8px;
`;

const mapStateToProps = (store: RootState) => ({
  curFolderId: store.group.application.resource.detail.resourceRootInfo?.id,
  selectedRowKeys: store.group.application.resource.detail.selectedRowKeys,
});

const mapDispatchToProps = {
  newFolder: () => ACTIONS.updateResourcesDetailFolderDrawerState({ open: true, type: 'add' }),
  newFile: () => ACTIONS.updateResourcesDetailFileDrawerState({ open: true, type: 'add' }),
  remove: ACTIONS.removeResourcesAction,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ToolBar: React.FC<ComponentsProps> = ({ curFolderId, selectedRowKeys, newFolder, newFile, remove }) => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { locale } = useContext(GlobalContext);
  const { global, file, folder } = locale.business;
  const handleRemove = () => {
    Modal.confirm({
      title: folder.deleteTitle,
      content: folder.deleteMsg,
      okText: global.yes,
      okType: 'danger',
      cancelText: global.no,
      onOk() {
        remove({
          applicationId,
          selectedRowKeys,
        });
      },
    });
  };
  return (
    <OperateContainer>
      <Button
        danger
        type="primary"
        icon={<DeleteOutlined />}
        title={global.remove}
        disabled={!curFolderId || selectedRowKeys.length === 0}
        onClick={handleRemove}
      >
        {global.remove}
      </Button>
      <Button
        title={folder.add}
        icon={<FolderAddOutlined />}
        style={{ marginLeft: 8 }}
        disabled={!curFolderId}
        onClick={newFolder}
      >
        {folder.add}
      </Button>
      <Button
        title={file.add}
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginLeft: 8 }}
        disabled={!curFolderId}
        onClick={newFile}
      >
        {file.add}
      </Button>
    </OperateContainer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolBar);
