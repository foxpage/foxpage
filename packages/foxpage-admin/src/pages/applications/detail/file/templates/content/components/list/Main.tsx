import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  UserOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Menu, Popconfirm, Table, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import { LocaleView, Name } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import {
  ContentEntity,
  File,
  ProjectContentCopyParams,
  ProjectContentDeleteParams,
  ProjectContentOfflineParams,
} from '@/types/index';
import { formatter, periodFormat } from '@/utils/index';

const IdLabel = styled.div`
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.75);
  margin-top: 8px;
`;

interface ContentListType {
  applicationId: string;
  folderId: string;
  loading: boolean;
  contents: ContentEntity[];
  fileDetail: File;
  openDrawer: (open: boolean, editContent?: Partial<ContentEntity>) => void;
  offlineContent: (params: ProjectContentOfflineParams) => void;
  copyContent: (params: ProjectContentCopyParams, cb?: () => void) => void;
  deleteContent: (params: ProjectContentDeleteParams) => void;
  openAuthDrawer: (visible: boolean, editContent?: ContentEntity) => void;
}

const ContentList: React.FC<ContentListType> = (props) => {
  const {
    applicationId,
    folderId,
    loading,
    contents,
    fileDetail,
    offlineContent,
    copyContent,
    deleteContent,
    openAuthDrawer,
    openDrawer,
  } = props;
  const { pathname, search } = useLocation();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { content, global, version } = locale.business;

  const handleOffline = (id, fileId) => {
    if (typeof offlineContent === 'function') {
      offlineContent({
        applicationId,
        id,
        fileId,
      });
    }
  };

  const handleCopy = (contentId, fileId) => {
    if (typeof copyContent === 'function' && applicationId) {
      copyContent({
        applicationId,
        fileId,
        fileType: fileDetail.type,
        sourceContentId: contentId,
        targetContentLocales: [],
      });
    }
  };

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'title',
      render: (text: string, record: ContentEntity) => (
        <Link
          to={{
            pathname: '/builder',
            search: `?applicationId=${applicationId}&folderId=${folderId}&fileId=${record.fileId}&contentId=${record.id}`,
            state: { backPathname: pathname, backSearch: search },
          }}>
          <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
            <Name>{text}</Name>
          </Tooltip>
          <IdLabel>
            {global.idLabel}: {record.id}
          </IdLabel>
        </Link>
      ),
    },
    {
      title: <Tooltip title={version.liveVersion}>{version.name}</Tooltip>,
      dataIndex: 'liveVersionNumber',
      key: 'liveVersionNumber',
      width: 90,
      render: (version: string) =>
        !!version ? (
          <Tag color="orange" style={{ width: 40, textAlign: 'center' }}>
            {formatter(version)}
          </Tag>
        ) : (
          ''
        ),
    },
    {
      title: global.locale,
      dataIndex: 'tag',
      key: 'tag',
      width: 170,
      render: (_text: string, record: ContentEntity) => {
        const localesTag = record.tags ? record.tags.filter((item) => item.locale) : [];
        return <LocaleView locales={localesTag} />;
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      width: 200,
      render: (_text: string, record: ContentEntity) => {
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
    {
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
            title={`${content.offlineMessage} ${record.title}?`}
            disabled={fileDetail?.online || !record?.version}
            okText={global.yes}
            cancelText={global.no}
            onConfirm={() => handleOffline(record.id, record.fileId)}>
            <Button
              danger
              type="default"
              size="small"
              shape="circle"
              title={content.offline}
              disabled={fileDetail?.online || !record?.version}
              style={{ marginLeft: 8 }}>
              <VerticalAlignBottomOutlined />
            </Button>
          </Popconfirm>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="copy">
                  <Button
                    type="text"
                    onClick={() => handleCopy(record.id, record.fileId)}
                    style={{ width: '100%', padding: 0, textAlign: 'left' }}>
                    <CopyOutlined /> {content.copy}
                  </Button>
                </Menu.Item>
                <Menu.Item key="auth">
                  <Button
                    type="text"
                    onClick={() => openAuthDrawer(true, record)}
                    style={{ width: '100%', padding: 0, textAlign: 'left' }}>
                    <UserOutlined /> {global.userPermission}
                  </Button>
                </Menu.Item>
                <Menu.Item key="delete">
                  <Popconfirm
                    title={`${content.deleteMessage} ${record.title}?`}
                    disabled={fileDetail?.online || !!record?.version}
                    onConfirm={() => {
                      if (applicationId) {
                        deleteContent({
                          applicationId,
                          id: record.id,
                          status: true,
                          fileId: record.fileId,
                          fileType: 'page',
                        });
                      }
                    }}
                    okText={global.yes}
                    cancelText={global.no}>
                    <Button
                      danger
                      type="text"
                      disabled={fileDetail?.online || !!record?.version}
                      style={{ width: '100%', padding: 0, textAlign: 'left' }}>
                      <DeleteOutlined /> {global.delete}
                    </Button>
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            }>
            <Button type="default" size="small" shape="circle" style={{ marginLeft: 8 }}>
              <EllipsisOutlined />
            </Button>
          </Dropdown>
        </>
      ),
    },
  ];

  return <Table rowKey="id" loading={loading} pagination={false} columns={columns} dataSource={contents} />;
};

export default ContentList;
