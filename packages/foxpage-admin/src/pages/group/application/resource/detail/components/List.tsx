import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, FileOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { RootState } from 'typesafe-actions';

import { FoxpageTable } from '@/pages/common';
import * as ACTIONS from '@/store/actions/group/application/resource/detail';

const mapStateToProps = (store: RootState) => ({
  resLoading: store.group.application.resource.detail.resLoading,
  resourceList: store.group.application.resource.detail.resourceList,
  selectedRowKeys: store.group.application.resource.detail.selectedRowKeys,
  folderPath: store.group.application.resource.detail.folderPath,
});

const mapDispatchToProps = {
  fetchResourceData: ACTIONS.fetchResourcesListAction,
  updateSelectedRowKeys: (selectedRowKeys: string[]) => ACTIONS.updateResourcesDetailState({ selectedRowKeys }),
  editorFile: (data: any) =>
    ACTIONS.updateResourcesDetailFileDrawerState({
      open: true,
      type: 'edit',
      data,
    }),
  editorFolder: (data: any) =>
    ACTIONS.updateResourcesDetailFolderDrawerState({
      open: true,
      type: 'edit',
      data,
    }),
  removeResource: ACTIONS.removeResourcesAction,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const List: React.FC<ComponentsProps> = ({
  resLoading = false,
  selectedRowKeys,
  resourceList = [],
  folderPath,
  fetchResourceData,
  updateSelectedRowKeys,
  editorFile,
  editorFolder,
  removeResource,
}) => {
  const isInitRef = useRef(false);
  const history = useHistory();
  const { location } = history;
  const { applicationId } = useParams<{ applicationId: string }>();
  const columns: ColumnsType = [
    {
      title: '',
      dataIndex: '__type',
      width: 40,
      render: (__type: string) => (
        <span>
          {__type === 'file' && <FileOutlined />}
          {__type === 'folder' && <FolderOpenOutlined />}
        </span>
      ),
    },
    {
      title: 'Name',
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
      title: 'Rel Path',
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
      title: 'Actions',
      width: '200px',
      align: 'right',
      key: 'actions',
      render: (record: any) => {
        return (
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
        );
      },
    },
  ];
  const handleEdit = (record: any) => {
    const { __type, id, name, content } = record;
    if (__type === 'file') {
      editorFile({
        id,
        filepath: content?.realPath || '',
      });
    } else if (__type === 'folder') {
      editorFolder({
        id,
        name: name || '',
      });
    }
  };
  const handleDelete = (record: any) => {
    const { id } = record;
    Modal.confirm({
      title: 'Are you sure to delete it?',
      content: 'All content under these node will not be visible.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        removeResource({
          applicationId,
          selectedRowKeys: [id],
        });
      },
    });
  };
  const onSelectChange = (_selectedRowKeys: any[]) => {
    updateSelectedRowKeys(_selectedRowKeys);
  };
  useEffect(() => {
    if (!folderPath) return;
    isInitRef.current = true;
    fetchResourceData({
      appId: applicationId,
      folderPath,
    });
  }, [folderPath, applicationId]);
  return (
    <>
      <FoxpageTable
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
