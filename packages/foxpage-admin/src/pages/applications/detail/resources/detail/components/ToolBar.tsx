import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { DeleteOutlined, FolderAddOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/resources/detail';
import { GlobalContext } from '@/pages/system';

const OperateContainer = styled.div`
  text-align: right;
  margin-bottom: 8px;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  curFolderId: store.applications.detail.resources.detail.resourceRootInfo?.id,
  selectedRowKeys: store.applications.detail.resources.detail.selectedRowKeys,
});

const mapDispatchToProps = {
  newFolder: ACTIONS.updateResourcesDetailFolderDrawerState,
  newFile: ACTIONS.updateResourcesDetailFileDrawerState,
  removeSources: ACTIONS.removeResources,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ToolBar: React.FC<ComponentsProps> = (props) => {
  const { applicationId, curFolderId, selectedRowKeys, newFolder, newFile, removeSources } = props;

  // i18n
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
        removeSources({
          applicationId,
          ids: selectedRowKeys,
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
        onClick={handleRemove}>
        {global.remove}
      </Button>
      <Button
        title={folder.add}
        icon={<FolderAddOutlined />}
        style={{ marginLeft: 8 }}
        disabled={!curFolderId}
        onClick={() => newFolder({ open: true, type: 'add' })}>
        {folder.add}
      </Button>
      <Button
        title={file.add}
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginLeft: 8 }}
        disabled={!curFolderId}
        onClick={() => newFile({ open: true, type: 'add' })}>
        {file.add}
      </Button>
    </OperateContainer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ToolBar);
