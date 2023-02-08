import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Table as AntTable, Tooltip } from 'antd';
import styled from 'styled-components';

import { Name } from '@/pages/components';
import { GlobalContext } from '@/pages/system';
import { File, PaginationInfo } from '@/types/index';
import { getLocationIfo, periodFormat } from '@/utils/index';

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

  // url search params
  const { page: filePage, searchText: fileSearch } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  const columns: any = [
    {
      title: global.idLabel,
      dataIndex: 'id',
      key: 'id',
      width: 160,
    },
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (text: string, record: File) => (
        <Link
          to={`/applications/${applicationId}/file/templates/content?fileId=${record.id}&filePage=${
            filePage || ''
          }&fileSearch=${fileSearch || ''}`}>
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
      width: 200,
      render: (_text: string, record: File) => {
        return record.creator ? record.creator.email : '--';
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
