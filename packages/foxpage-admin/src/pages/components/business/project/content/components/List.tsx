import React, { useContext, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { EditOutlined, LinkOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Popover, Table, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import {
  BasicTemRing,
  DeleteButton,
  LocaleTag,
  LocaleView,
  Name,
  NameContainer,
  Ring,
  VLine,
} from '@/components/index';
import { FileType } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ContentEntity, File, ProjectContentDeleteParams } from '@/types/index';
import { getLocationIfo, periodFormat } from '@/utils/index';

const IdLabel = styled.div`
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.75);
  margin-top: 8px;
`;

interface ProjectContentList {
  type: string;
  loading: boolean;
  contentList: ContentEntity[];
  extendRecord: Record<string, string[]>;
  fileDetail: File;
  openDrawer: (open: boolean, editContent?: Partial<ContentEntity>) => void;
  deleteContent: (params: ProjectContentDeleteParams) => void;
  openAuthDrawer?: (visible: boolean, editContent?: ContentEntity) => void;
}

const ProjectContentList: React.FC<ProjectContentList> = (props: ProjectContentList) => {
  const {
    type,
    loading,
    fileDetail,
    contentList,
    extendRecord,
    deleteContent,
    openDrawer,
    openAuthDrawer,
  } = props;

  // url search params
  const { pathname, search, applicationId, folderId, fileId } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, content, version } = locale.business;

  const handleAuthorize = (open: boolean, content: ContentEntity) => {
    if (typeof openAuthDrawer === 'function') {
      openAuthDrawer(open, content);
    }
  };

  const authorizeAdmin = useMemo(() => type === 'personal' || type === 'application', [type]);

  const columns: any = [
    {
      title: global.nameLabel,
      dataIndex: 'title',
      render: (text: string, record: ContentEntity) => (
        <>
          <NameContainer>
            <Link
              to={{
                pathname: '/builder',
                search: `?applicationId=${applicationId}&folderId=${folderId}&fileId=${fileId}&contentId=${record.id}`,
                state: { backPathname: pathname, backSearch: search },
              }}>
              <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
                <Name style={{ maxWidth: type === 'projects' ? 240 : 150 }}>{text}</Name>
              </Tooltip>
            </Link>
            {fileDetail?.type === FileType.page && !record.isBase && record.urls?.length > 0 && (
              <Popover
                placement="bottom"
                content={
                  <React.Fragment>
                    {record.urls.map((url) => {
                      return (
                        <p key={url}>
                          <a href={url} target="_blank">
                            {url}
                          </a>
                        </p>
                      );
                    })}
                  </React.Fragment>
                }
                trigger="hover">
                <LinkOutlined style={{ marginLeft: 6 }} />
              </Popover>
            )}
          </NameContainer>
          <IdLabel>
            {global.idLabel}: {record.id}
          </IdLabel>
        </>
      ),
    },
    {
      title: <Tooltip title={version.liveVersion}>{version.name}</Tooltip>,
      dataIndex: 'version',
      key: 'version',
      width: 90,
      render: (text: string) => {
        return text ? <Tag color="orange">{text}</Tag> : '';
      },
    },
    {
      title: global.locale,
      dataIndex: 'tag',
      key: 'tag',
      width: 170,
      render: (_text: string, record: ContentEntity) => {
        if (record.isBase) {
          return <LocaleTag color="blue">base</LocaleTag>;
        }

        const localesTag = record.tags ? record.tags.filter((item) => item.locale) : [];
        return <LocaleView locales={localesTag.map((item) => item.locale) as string[]} />;
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: ContentEntity) => {
        return record.creator ? record.creator.account : '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
  ];

  if (fileDetail?.type === FileType.page) {
    columns.unshift({
      title: '',
      key: '',
      width: 20,
      render: (_text: string, record: ContentEntity) => {
        if (record.isBase && extendRecord[record.id]?.length) {
          return <BasicTemRing />;
        }
        if (record.extendId) {
          return (
            <>
              <Ring />
              <VLine />
            </>
          );
        }
        return <></>;
      },
    });
  }

  if (authorizeAdmin) {
    columns.push({
      title: global.actions,
      key: '',
      width: 130,
      render: (_text: string, record: ContentEntity) => (
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
            title={`${content.deleteMessage} ${record.title}?`}
            onConfirm={() => {
              if (applicationId && fileId && fileDetail) {
                deleteContent({
                  applicationId,
                  id: record.id,
                  status: true,
                  fileId,
                  fileType: fileDetail.type,
                });
              }
            }}
            okText={global.yes}
            cancelText={global.no}>
            <DeleteButton
              type="default"
              size="small"
              shape="circle"
              title={global.remove}
              style={{ marginLeft: 8 }}
              disabled={!!(record.isBase && extendRecord[record.id]?.length)}
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
      ),
    });
  }

  return (
    <Table rowKey="id" loading={loading} pagination={false} columns={columns} dataSource={contentList} />
  );
};

export default ProjectContentList;
