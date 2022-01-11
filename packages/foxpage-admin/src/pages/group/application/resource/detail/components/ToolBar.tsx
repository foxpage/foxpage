import React from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { DeleteOutlined, FolderAddOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

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
  const handleRemove = () => {
    Modal.confirm({
      title: 'Are you sure to delete these?',
      content: 'All content under these nodes will not be visible.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
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
        title="Remove"
        disabled={!curFolderId || selectedRowKeys.length === 0}
        onClick={handleRemove}
      >
        Remove
      </Button>
      <Button
        title="New folder"
        icon={<FolderAddOutlined />}
        style={{ marginLeft: 8 }}
        disabled={!curFolderId}
        onClick={newFolder}
      >
        New folder
      </Button>
      <Button
        title="New file"
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginLeft: 8 }}
        disabled={!curFolderId}
        onClick={newFile}
      >
        New file
      </Button>
    </OperateContainer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolBar);
