import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { BranchesOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Table, Tag } from 'antd';

import { GlobalContext } from '@/pages/system';
import { ContentVersionData } from '@/types/index';
import { periodFormat } from '@/utils/period-format';

type IProps = {
  applicationId: string;
  folderId: string;
  fileId: string;
  list: ContentVersionData[];
  onClick?: (value: ContentVersionData) => void;
};

export const List = (props: IProps) => {
  const { applicationId, folderId, fileId, list = [] } = props;
  const { locale } = useContext(GlobalContext);
  const { history, version, global } = locale.business;
  const { pathname, search } = useLocation();

  const columns: any = [
    {
      title: '',
      key: '',
      width: 20,
      render: () => <BranchesOutlined />,
    },
    {
      title: version.name,
      dataIndex: 'version',
      key: 'version',
      render: (value: string, record: ContentVersionData) => {
        return (
          <span>
            {value} {record.isLive ? <Tag color="green">{history.live}</Tag> : ''}
          </span>
        );
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      width: 160,
      render: (_text: string, record: ContentVersionData) => {
        return record.creator ? record.creator?.email : '--';
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
      title: global.publisher,
      dataIndex: 'publisher',
      key: 'publisher',
      width: 160,
      render: (_text: string, record: ContentVersionData) => {
        return record?.publisher ? record.publisher?.email : '--';
      },
    },
    {
      title: history.publishTime,
      dataIndex: 'updateTime',
      key: 'updateTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      key: '',
      width: 80,
      render: (_text: string, record: ContentVersionData) => {
        return (
          <Button type="default" size="small" shape="circle" title={history.view}>
            <Link
              to={{
                pathname: '/preview',
                search: `?applicationId=${applicationId}&folderId=${folderId}&fileId=${fileId}&contentId=${record.contentId}&versionId=${record.id}`,
                state: { backPathname: pathname, backSearch: search },
              }}>
              <EyeOutlined />
            </Link>
          </Button>
        );
      },
    },
  ];
  return <Table rowKey="id" dataSource={list} columns={columns} pagination={false} />;
};
