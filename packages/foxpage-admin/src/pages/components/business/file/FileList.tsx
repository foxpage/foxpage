import React from 'react';
import { Link } from 'react-router-dom';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Divider, Popconfirm, Table, Tag } from 'antd';

import { suffixTagColor } from '@/pages/common/constant/FileType';
import { FileType } from '@/types/application/file';
import { PaginationInfo } from '@/types/common';
import periodFormat from '@/utils/period-format';

interface FileListProps {
  loading: boolean;
  list: FileType[];
  pageInfo: PaginationInfo;
  fileType: string;
  organizationId: string;
  applicationId: string;
  onDelete: (file: FileType) => void;
  onEdit: (file: FileType) => void;
  onPageInfoChange: (page?: number, size?: number) => void;
}

const FileList: React.FC<FileListProps> = props => {
  const { loading, organizationId, applicationId, fileType, list, pageInfo, onEdit, onDelete, onPageInfoChange } =
    props;

  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      render: (text: string, record: FileType) => {
        return (
          <>
            <Link
              to={`/organization/${organizationId}/application/${applicationId}/detail/${fileType}/${record.id}/content/?folderId=${record.folderId}`}
            >
              {text}
            </Link>
            {record.tags?.find(item => item.copyFrom) && (
              <Tag color={suffixTagColor.refer} style={{ marginLeft: 4 }}>
                refer
              </Tag>
            )}
          </>
        );
      },
    },
    {
      title: 'Folder',
      dataIndex: 'folderName',
      key: 'folderName',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (text: string, _record: FileType) => {
        return <Tag color={suffixTagColor[text]}>{text}</Tag>;
      },
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: FileType) => {
        return record.creator ? record.creator.account : '--';
      },
    },
    {
      title: 'CreateTime',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: 'Actions',
      key: 'updateTime',
      width: 130,
      render: (_text: string, record: FileType) => {
        return (
          // /application/:applicationId/folder/:folderId/file/:fileId/builder
          <React.Fragment>
            {/* <Button type="default" size="small" shape="circle" title="build">
              <Link
                to="1"
                // to={`/application/${applicationId}/folder/${folderId}/file/${record.id}/builder`}
                onClick={() => {
                  localStorage.foxpage_project_file = JSON.stringify(record);
                }}
              >
                <BuildOutlined />
              </Link>
            </Button> */}
            <Button
              type="default"
              size="small"
              shape="circle"
              title="Edit"
              onClick={() => {
                onEdit(record);
              }}
            >
              <EditOutlined />
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title={`Are you sure to delete this ${record.type}?`}
              onConfirm={() => {
                onDelete(record);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button size="small" shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </React.Fragment>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={list}
      columns={columns}
      loading={loading}
      pagination={
        pageInfo.total > pageInfo.size
          ? { position: ['bottomCenter'], current: pageInfo.page, pageSize: pageInfo.size, total: pageInfo.total }
          : false
      }
      onChange={pagination => {
        onPageInfoChange(pagination.current, pagination.pageSize);
      }}
    />
  );
};

export default FileList;
