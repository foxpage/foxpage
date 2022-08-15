import React, { useContext, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, FileTextOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/resources/detail';
import { FoxPageTable } from '@/components/index';
import { GlobalContext } from '@/pages/system';

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  resLoading: store.applications.detail.resources.detail.resLoading,
  folderPath: store.applications.detail.resources.detail.folderPath,
  resourceList: store.applications.detail.resources.detail.resourceList,
  selectedRowKeys: store.applications.detail.resources.detail.selectedRowKeys,
});

const mapDispatchToProps = {
  fetchResourceData: ACTIONS.fetchResourcesList,
  updateSelectedRowKeys: ACTIONS.updateSelectedRowKeys,
  editorFile: ACTIONS.updateResourcesDetailFileDrawerState,
  editorFolder: ACTIONS.updateResourcesDetailFolderDrawerState,
  removeResource: ACTIONS.removeResources,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const List: React.FC<ComponentsProps> = (props) => {
  const {
    applicationId,
    resLoading = false,
    selectedRowKeys,
    resourceList = [],
    folderPath,
    fetchResourceData,
    updateSelectedRowKeys,
    editorFile,
    editorFolder,
    removeResource,
  } = props;

  const isInitRef = useRef(false);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file, folder } = locale.business;

  // search params
  const history = useHistory();
  const { location } = history;

  useEffect(() => {
    if (!folderPath) return;

    if (applicationId) {
      fetchResourceData({
        applicationId,
        folderPath,
      });

      isInitRef.current = true;
    }
  }, [folderPath, applicationId]);

  const columns: ColumnsType = [
    {
      title: '',
      dataIndex: '__type',
      width: 40,
      render: (__type: string) => (
        <span>
          {__type === 'file' && <FileTextOutlined />}
          {__type === 'folder' && <FolderOpenOutlined />}
        </span>
      ),
    },
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => {
        const { __type, folderPath } = record;
        if (__type === 'file') {
          return name;
        }
        const href = history.createHref({
          ...location,
          pathname: `${location.pathname.replace(/\/$/, '')}/${folderPath}`,
        });
        return <a href={href}>{name}</a>;
      },
    },
    {
      title: file.relPath,
      dataIndex: 'content',
      key: 'content',
      render: (content: any, record: any) => {
        const { __type } = record;
        if (__type !== 'file') {
          return null;
        }
        return content?.realPath || '';
      },
    },
    {
      title: global.actions,
      width: '200px',
      align: 'right',
      key: 'actions',
      render: (record: any) => (
        <span>
          <Button
            type="default"
            size="small"
            shape="circle"
            icon={<EditOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="default"
            size="small"
            shape="circle"
            icon={<DeleteOutlined />}
            style={{ marginLeft: 8 }}
            onClick={() => handleDelete(record)}
          />
        </span>
      ),
    },
  ];

  const handleEdit = (record: any) => {
    const { __type, id, name, content } = record;
    if (__type === 'file') {
      editorFile({
        open: true,
        type: 'edit',
        data: {
          id,
          filepath: content?.realPath || '',
        },
      });
    } else if (__type === 'folder') {
      editorFolder({
        open: true,
        type: 'edit',
        data: {
          id,
          name: name || '',
        },
      });
    }
  };

  const handleDelete = (record: any) => {
    const { id } = record;
    Modal.confirm({
      title: folder.deleteTitle,
      content: folder.deleteMsg,
      okText: global.yes,
      okType: 'danger',
      cancelText: global.no,
      onOk() {
        removeResource({
          applicationId,
          ids: [id],
        });
      },
    });
  };

  const onSelectChange = (_selectedRowKeys: any[]) => {
    updateSelectedRowKeys(_selectedRowKeys);
  };

  return (
    <>
      <FoxPageTable
        rowKey="id"
        scroll={undefined}
        pagination={false}
        loading={!isInitRef.current || resLoading}
        columns={columns}
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
        }}
        dataSource={resourceList}
      />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(List);
