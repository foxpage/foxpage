import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import { DeleteButton, LocaleView, Name } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { ContentEntity, ProjectContentDeleteParams } from '@/types/index';
import { periodFormat } from '@/utils/period-format';

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
  openDrawer: (open: boolean, editContent?: Partial<ContentEntity>) => void;
  deleteContent: (params: ProjectContentDeleteParams) => void;
  openAuthDrawer: (visible: boolean, editContent?: ContentEntity) => void;
}

const ContentList: React.FC<ContentListType> = (props) => {
  const { applicationId, folderId, loading, contents, deleteContent, openAuthDrawer, openDrawer } = props;
  const { pathname, search } = useLocation();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { content, global, version } = locale.business;

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
      dataIndex: 'version',
      key: 'version',
      width: 90,
      render: (version: string) => (!!version ? <Tag color="orange">{version}</Tag> : ''),
    },
    {
      title: global.locale,
      dataIndex: 'tag',
      key: 'tag',
      width: 170,
      render: (_text: string, record: ContentEntity) => {
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
            title={`${content.deleteMessage} ${record.title}?`}
            disabled={!!record?.version}
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
            <DeleteButton
              type="default"
              size="small"
              shape="circle"
              title={global.remove}
              disabled={!!record?.version}
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

  return <Table rowKey="id" loading={loading} pagination={false} columns={columns} dataSource={contents} />;
};

export default ContentList;
