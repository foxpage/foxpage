import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { LinkOutlined } from '@ant-design/icons';
import { Popover, Table, Tag, Tooltip } from 'antd';

import { BasicTemRing, LocaleTag, LocaleView, Name, NameContainer, Ring, VLine } from '@/components/index';
import { FileType } from '@/constants/global';
import { GlobalContext } from '@/pages/system';
import { ContentEntity, File } from '@/types/index';
import { periodFormat } from '@/utils/period-format';

interface ContentListType {
  applicationId: string;
  contents: ContentEntity[];
  fileDetail: File;
  folderId: string;
  loading: boolean;
}

const ContentList: React.FC<ContentListType> = (props) => {
  const { applicationId, contents, fileDetail, folderId, loading } = props;
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

    if (fileDetail?.type === FileType.page) {
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
    } else {
      newList = contents;
    }

    setList(newList);
    setExtendRecord(extendRecord);
  }, [contents, fileDetail]);

  const columns: any = [
    {
      title: global.nameLabel,
      dataIndex: 'title',
      render: (text: string, record: ContentEntity) => (
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
      ),
    },
    {
      title: global.type,
      dataIndex: 'version',
      key: 'version',
      render: (_text: string) => {
        return <Tag color="orange">{content.name}</Tag>;
      },
    },
    {
      title: version.liveVersion,
      dataIndex: 'version',
      key: 'version',
      render: (text: string) => {
        return text || '--';
      },
    },
    {
      title: global.locale,
      dataIndex: 'tag',
      key: 'tag',
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
  ];

  // inherit tag column
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

  return <Table rowKey="id" loading={loading} pagination={false} columns={columns} dataSource={list} />;
};

export default ContentList;
