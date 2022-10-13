import React, { useContext, useEffect, useState } from 'react';
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
  contents: ContentEntity[];
  folderId: string;
  loading: boolean;
  openDrawer: (open: boolean, editContent?: Partial<ContentEntity>) => void;
  deleteContent: (params: ProjectContentDeleteParams) => void;
  openAuthDrawer: (visible: boolean, editContent?: ContentEntity) => void;
}

const ContentList: React.FC<ContentListType> = (props) => {
  const { applicationId, contents, folderId, loading, openDrawer, deleteContent, openAuthDrawer } = props;
  const [extendRecord, setExtendRecord] = useState<any>();
  const [list, setList] = useState<any>();
  const { pathname, search } = useLocation();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { content, global, version } = locale.business;

  // re-sort by inherit relation
  useEffect(() => {
    let newList: ContentEntity[] = [];
    let extendRecord: Record<string, string[]> = {};

    const contentRecord: Record<string, ContentEntity[]> = {};

    contents.forEach((item) => {
      if (item.isBase || !item.extendId) {
        newList.push(item);
      } else {
        if (!contentRecord[item.extendId]) {
          contentRecord[item.extendId] = [];
        }
        contentRecord[item.extendId].push(item);

        if (!extendRecord[item.extendId]) {
          extendRecord[item.extendId] = [];
        }
        extendRecord[item.extendId].push(item.id);
      }
    });

    Object.keys(contentRecord).forEach((key) => {
      const children = contentRecord[key];
      if (children && children.length > 0) {
        const idx = newList.findIndex((item) => item.id === key);
        newList.splice(idx + 1, 0, ...children);
      }
    });

    setList(newList);
    setExtendRecord(extendRecord);
  }, [contents]);

  const columns: any = [
    {
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
    },
    {
      title: global.nameLabel,
      dataIndex: 'title',
      render: (text: string, record: ContentEntity) => (
        <>
          <NameContainer>
            <Link
              to={{
                pathname: '/builder',
                search: `?applicationId=${applicationId}&folderId=${folderId}&fileId=${record.fileId}&contentId=${record.id}`,
                state: { backPathname: pathname, backSearch: search },
              }}>
              <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
                <Name>{text}</Name>
              </Tooltip>
            </Link>
            {record.urls && !record.isBase && record.urls.length > 0 && (
              <Popover
                placement="bottom"
                content={
                  <React.Fragment>
                    {record.urls?.map((url) => {
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
      render: (version: string) => (!!version ? <Tag color="orange">{version}</Tag> : ''),
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
            disabled={!!(record.isBase && extendRecord[record.id]?.length) || !!record?.version}
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
              disabled={!!(record.isBase && extendRecord[record.id]?.length) || !!record?.version}
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

  return <Table rowKey="id" loading={loading} pagination={false} columns={columns} dataSource={list} />;
};

export default ContentList;
