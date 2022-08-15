import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Table, Tag, Tooltip } from 'antd';

import { LocaleView, Name } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import { ContentEntity } from '@/types/index';
import { periodFormat } from '@/utils/period-format';

interface ContentListType {
  applicationId: string;
  folderId: string;
  loading: boolean;
  contents: ContentEntity[];
}

const ContentList: React.FC<ContentListType> = (props) => {
  const { applicationId, folderId, loading, contents } = props;
  const { pathname, search } = useLocation();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { content, global, version } = locale.business;

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'title',
      render: (text: string, record: ContentEntity) => (
        <>
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
        </>
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

  return <Table rowKey="id" loading={loading} pagination={false} columns={columns} dataSource={contents} />;
};

export default ContentList;
