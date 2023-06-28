import React, { useCallback, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { BlockOutlined, FileOutlined, FileTextOutlined, FolderOutlined } from '@ant-design/icons';
import { Spin, Table as AntTable, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import { Name } from '@/components/index';
import { FileType, GlobalType, GlobalTypeColor, ROUTE_CONTENT_MAP, ROUTE_FILE_MAP } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { CommonSearchParams, CommonSearchType, PaginationInfo, ProjectSearchEntity } from '@/types/index';
import { getLocationIfo, periodFormat } from '@/utils/index';

interface ProjectListProp {
  applicationId?: string;
  searchText?: string;
  env: string;
  type: CommonSearchType;
  loading: boolean;
  pageInfo: PaginationInfo;
  list: ProjectSearchEntity[];
  fetchList: (params: CommonSearchParams) => void;
}

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 24px 0 0;
  }
`;

const Path = styled.div`
  color: rgba(0, 0, 0, 0.5);
  font-size: 12px;
`;

const ProjectSearchList: React.FC<ProjectListProp> = (props: ProjectListProp) => {
  const { applicationId, searchText, env, type, loading, pageInfo, list, fetchList } = props;

  // url params
  const location = useLocation();
  const { folderPage, folderSearch, filePage } = getLocationIfo(location);

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { global, file: fileI18n, content: contentI18n, organization: organizationI18n } = locale.business;

  const handleLinkClick = useCallback((entity) => {
    if (entity.level === GlobalType.folder) {
      localStorage['foxpage_project_folder'] = JSON.stringify(entity);
    }
    if (entity.level === GlobalType.file) {
      localStorage['foxpage_project_file'] = JSON.stringify(entity);
    }
  }, []);

  const handleGeneratePathname = useCallback(
    (entity) => {
      if (entity.level === GlobalType.folder) {
        return ROUTE_FILE_MAP[env].replace(':applicationId', entity.application.id);
      }
      if (entity.level === GlobalType.file) {
        return ROUTE_CONTENT_MAP[env].replace(':applicationId', entity.application.id);
      }
      if (entity.level === GlobalType.content) {
        return ROUTE_CONTENT_MAP[env].replace(':applicationId', entity.application.id);
      }
    },
    [env],
  );

  const handleGenerateQueryString = useCallback((entity) => {
    if (entity.level === GlobalType.folder) {
      return `?applicationId=${entity.application.id}&folderId=${entity.id}&folderPage=${
        folderPage || ''
      }&folderSearch=${folderSearch || ''}`;
    }
    if (entity.level === GlobalType.file) {
      return `?applicationId=${entity.application.id}&fileId=${entity.id}&filePage=${
        filePage || ''
      }&folderPage=${folderPage || ''}&folderSearch=${folderSearch || ''}`;
    }
    if (entity.level === GlobalType.content) {
      return `?applicationId=${entity.application.id}&fileId=${entity.parent.fileId}&filePage=${
        filePage || ''
      }&folderPage=${folderPage || ''}&folderSearch=${folderSearch || ''}`;
    }
  }, []);

  const columns: any = [
    {
      title: '',
      dataIndex: '',
      width: 40,
      render: (record) => (
        <>
          {record.level === GlobalType.folder && (
            <FolderOutlined style={{ color: GlobalTypeColor.project }} />
          )}
          {record.level === GlobalType.file && record.type === FileType.page && <FileTextOutlined />}
          {record.level === GlobalType.file && record.type === FileType.template && <FileOutlined />}
          {record.level === GlobalType.file && record.type === FileType.block && <BlockOutlined />}
        </>
      ),
    },
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (text: string, record: ProjectSearchEntity) => {
        const pathname = handleGeneratePathname(record);
        const queryString = handleGenerateQueryString(record);

        return (
          <Link onClick={() => handleLinkClick(record)} to={`${pathname}${queryString}`}>
            <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
              <Name>{text}</Name>
              <Path>
                {record.application.name}\
                {record?.type === GlobalType.project ? record.name : record?.parent?.folderName}
                {record?.level === GlobalType.file && `\\${record.name}`}
                {record?.level === GlobalType.content && `\\${record.parent.fileName}\\${record.name}`}
              </Path>
            </Tooltip>
          </Link>
        );
      },
    },
    {
      title: organizationI18n.name,
      dataIndex: 'organization',
      key: 'organization',
      render: (_, record: ProjectSearchEntity) => record?.organization?.name || '',
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
      render: (_: string, record: ProjectSearchEntity) => {
        const type = {
          project: global.project,
          page: fileI18n.page,
          template: fileI18n.template,
          block: fileI18n.block,
          content: contentI18n.name,
        };

        return record?.level === GlobalType.content ? (
          ''
        ) : (
          <Tag color={GlobalTypeColor[record.type]}>{type[record.type]}</Tag>
        );
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      width: 200,
      render: (_text: string, record: ProjectSearchEntity) => {
        return record.creator ? record.creator.email : '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.updateTime,
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 170,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
  ];

  // remove column application in application detail
  if (type === 'application') {
    columns.splice(2, 1);
  }

  return (
    <Spin spinning={loading}>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={list}
        pagination={
          pageInfo.total > pageInfo.size
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
          fetchList({
            applicationId,
            organizationId,
            type: type,
            page: pagination.current || 1,
            size: pagination.pageSize || 10,
            search: searchText || '',
          });
        }}
      />
    </Spin>
  );
};

export default ProjectSearchList;
