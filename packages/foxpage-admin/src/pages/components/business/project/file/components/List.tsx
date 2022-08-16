import React, { useContext, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { BuildOutlined, EditOutlined, FileOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table as AntTable, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import { DeleteButton, Name } from '@/components/index';
import { suffixTagColor } from '@/constants/file';
import { GlobalContext } from '@/pages/system';
import { File, PaginationInfo, ProjectFileDeleteParams, ProjectFileFetchParams } from '@/types/index';
import { getLocationIfo, periodFormat } from '@/utils/index';

const PAGE_SIZE = 10;

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

interface ProjectFileListProps {
  type: string;
  loading: boolean;
  pageInfo: PaginationInfo;
  fileList: File[];
  openDrawer: (open: boolean, editFile?: File) => void;
  deleteFile: (params: ProjectFileDeleteParams) => void;
  fetchFileList: (params: ProjectFileFetchParams) => void;
  openAuthDrawer?: (visible: boolean, editFile?: File) => void;
}

const ProjectFileList: React.FC<ProjectFileListProps> = (props: ProjectFileListProps) => {
  const { type, loading, pageInfo, fileList, deleteFile, fetchFileList, openDrawer, openAuthDrawer } = props;

  // get multi-language
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;

  // url search params
  const { pathname, search, applicationId, folderId } = getLocationIfo(useLocation());

  const handleAuthorize = (open: boolean, file: File) => {
    if (typeof openAuthDrawer === 'function') {
      openAuthDrawer(open, file);
    }
  };

  const authorizeAdmin = useMemo(() => type === 'personal' || type === 'application', [type]);

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
      render: (text: string, record: File) => {
        const slugMap = {
          application: `/applications/${applicationId}/projects/content`,
          personal: '/workspace/projects/personal',
          involved: '/workspace/projects/involved',
          projects: '/projects',
        };

        return (
          <Link
            onClick={() => {
              localStorage['foxpage_project_file'] = JSON.stringify(record);
            }}
            to={`${slugMap[type]}/content?applicationId=${applicationId}&folderId=${folderId}&fileId=${record.id}&fileType=${record.type}`}>
            <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
              <Name style={{ maxWidth: type === 'projects' ? 260 : 240 }}>{text}</Name>
            </Tooltip>
          </Link>
        );
      },
    },
    {
      title: global.idLabel,
      dataIndex: 'id',
      width: 100,
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => <Tag color={suffixTagColor[text]}>{file[text]}</Tag>,
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (creator) => creator?.account || '--',
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      key: '',
      width: authorizeAdmin ? 160 : 80,
      render: (_text: string, record: File) => (
        <>
          <Button
            type="default"
            size="small"
            shape="circle"
            title={global.build}
            disabled={!record?.hasContent}>
            <Link
              to={{
                pathname: '/builder',
                search: `?applicationId=${applicationId}&folderId=${folderId}&fileId=${record.id}`,
                state: { backPathname: pathname, backSearch: search },
              }}
              onClick={() => {
                localStorage['foxpage_project_file'] = JSON.stringify(record);
              }}>
              <BuildOutlined />
            </Link>
          </Button>
          {authorizeAdmin && (
            <>
              <Button
                type="default"
                size="small"
                shape="circle"
                title={global.edit}
                onClick={() => openDrawer(true, record)}
                style={{ marginLeft: 8 }}>
                <EditOutlined />
              </Button>
              <Popconfirm
                cancelText={global.no}
                okText={global.yes}
                title={`${file.deleteMessage}${file[record.type]}?`}
                onConfirm={() => {
                  deleteFile({
                    id: record.id,
                    applicationId: applicationId as string,
                    folderId: folderId as string,
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
                onClick={() => handleAuthorize(true, record)}>
                <UserOutlined />
              </Button>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      dataSource={fileList}
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
        fetchFileList({
          id: folderId as string,
          applicationId: applicationId as string,
          page: pagination.current || 1,
          size: pagination.pageSize || PAGE_SIZE,
        });
      }}
    />
  );
};

export default ProjectFileList;
