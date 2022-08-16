import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { FileOutlined } from '@ant-design/icons';
import { Table as AntTable, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import { suffixTagColor } from '@/constants/file';
import { Name } from '@/pages/components';
import { GlobalContext } from '@/pages/system';
import { File, PaginationInfo } from '@/types/index';
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
}

const FileList: React.FC<FileListProps> = (props) => {
  const { applicationId, loading, pageInfo, list, onPaginationChange } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;

  const columns: any = [
    {
      title: '',
      dataIndex: '',
      width: 40,
      render: () => <FileOutlined />,
    },
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (text: string, record: File) => (
        <Link
          to={`/applications/${applicationId}/file/templates/content?folderId=${record.folderId}&fileId=${record.id}`}>
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
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
      render: (text: string, _record: File) => {
        return <Tag color={suffixTagColor[text]}>{file[text]}</Tag>;
      },
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
  ];

  return (
    <Table
      rowKey="id"
      dataSource={list}
      columns={columns}
      loading={loading}
      pagination={
        pageInfo.total > pageInfo.size
          ? {
              position: ['bottomCenter'],
              current: pageInfo.page,
              pageSize: pageInfo.size,
              total: pageInfo.total,
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
