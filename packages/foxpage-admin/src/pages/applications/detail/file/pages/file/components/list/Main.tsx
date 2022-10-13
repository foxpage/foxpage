import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table as AntTable, Tooltip } from 'antd';
import styled from 'styled-components';

import { DeleteButton, Name } from '@/pages/components';
import { GlobalContext } from '@/pages/system';
import { File, PaginationInfo, ProjectFileDeleteParams } from '@/types/index';
import { periodFormat } from '@/utils/period-format';

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 36px 0 0;
  }
`;

interface FileListProps {
  applicationId: string;
  loading: boolean;
  pageInfo: PaginationInfo;
  list: File[];
  onPaginationChange: (page?: number, size?: number) => void;
  deleteFile: (params: ProjectFileDeleteParams) => void;
  openDrawer: (open: boolean, editFile?: File) => void;
  openAuthDrawer: (visible: boolean, editFile?: File) => void;
}

const FileList: React.FC<FileListProps> = (props) => {
  const {
    applicationId,
    loading,
    pageInfo,
    list,
    deleteFile,
    onPaginationChange,
    openAuthDrawer,
    openDrawer,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;

  const columns: any = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (text: string, record: File) => (
        <Link to={`/applications/${applicationId}/file/pages/content?fileId=${record.id}`}>
          <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
            <Name style={{ maxWidth: 400 }}>{text}</Name>
          </Tooltip>
        </Link>
      ),
    },
    {
      title: global.project,
      dataIndex: 'folderName',
      key: 'folderName',
      render: (folderName: string, record: File) => (
        <Link
          to={`/applications/${applicationId}/projects/detail?applicationId=${applicationId}&folderId=${record.folderId}`}>
          <Name>{folderName}</Name>
        </Link>
      ),
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: File) => {
        return record.creator ? record.creator.account : '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      key: '',
      width: 130,
      render: (_text: string, record: File) => (
        <>
          <Button
            type="default"
            size="small"
            shape="circle"
            title={global.edit}
            onClick={() => openDrawer(true, record)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            cancelText={global.no}
            okText={global.yes}
            title={`${file.deleteMessage}${file[record.type]}?`}
            onConfirm={() => {
              deleteFile({
                id: record.id,
                applicationId: record.applicationId || applicationId,
                folderId: record.folderId,
              });
            }}>
            <DeleteButton
              type="default"
              size="small"
              shape="circle"
              title={global.remove}
              style={{ marginLeft: 8 }}
            />
          </Popconfirm>
          <Button
            type="default"
            size="small"
            shape="circle"
            title={global.userPermission}
            onClick={() => openAuthDrawer(true, record)}>
            <UserOutlined />
          </Button>
        </>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={list}
      columns={columns}
      loading={loading}
      pagination={
        pageInfo?.total && pageInfo.total > pageInfo.size
          ? {
              position: ['bottomCenter'],
              current: pageInfo.page,
              pageSize: pageInfo.size,
              total: pageInfo.total,
              showSizeChanger: false,
            }
          : false
      }
      onChange={(pagination) => {
        onPaginationChange(pagination.current, pagination.pageSize);
      }}
    />
  );
};

export default FileList;
