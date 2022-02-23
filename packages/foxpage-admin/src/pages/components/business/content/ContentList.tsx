import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Divider, Popconfirm, Popover, Table, Tag } from 'antd';

import LocalsView from '@/components/business/LocalsView';
import { FileTypeEnum } from '@/constants/global';
import GlobalContext from '@/pages/GlobalContext';
import { ContentType } from '@/types/application/content';
import periodFormat from '@/utils/period-format';

interface ContentListType {
  applicationId: string;
  folderId: string;
  fileType: string;
  loading: boolean;
  contents: ContentType[];
  onDelete: (content: ContentType) => void;
  onEdit: (content: ContentType) => void;
}

const ContentList: React.FC<ContentListType> = props => {
  const { loading, contents, fileType, applicationId, folderId, onDelete, onEdit } = props;
  const { pathname, search } = useLocation();
  const { locale } = useContext(GlobalContext);
  const { global, version } = locale.business;
  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'title',
      render: (text: string, record: ContentType) => {
        return (
          <React.Fragment>
            <Link
              to={{
                pathname: `/application/${applicationId}/folder/${folderId}/file/${record.fileId}/content/${record.id}/builder`,
                state: { backPathname: pathname, backSearch: search },
              }}
            >
              {text}
            </Link>
            {fileType === FileTypeEnum.page && record.urls && record.urls.length > 0 && (
              <Popover
                placement="bottom"
                content={
                  <React.Fragment>
                    {record.urls?.map(url => {
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
                trigger="hover"
              >
                <LinkOutlined style={{ marginLeft: 6 }} />
              </Popover>
            )}
          </React.Fragment>
        );
      },
    },
    {
      title: global.type,
      dataIndex: 'version',
      key: 'version',
      render: (_text: string) => {
        return <Tag color="orange">content</Tag>;
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
      render: (_text: string, record: ContentType) => {
        const localesTag = record.tags ? record.tags.filter(item => item.locale) : [];
        return <LocalsView locales={localesTag.map(item => item.locale)} />;
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: ContentType) => {
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
      key: 'updateTime',
      width: 120,
      render: (_text: string, record: ContentType) => {
        return (
          <React.Fragment>
            <Button type="default" size="small" shape="circle" title={global.edit} onClick={() => onEdit(record)}>
              <EditOutlined />
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title={`${global.deleteMsg}${record.title}?`}
              onConfirm={() => {
                onDelete(record);
              }}
              okText={global.yes}
              cancelText={global.no}
            >
              <Button size="small" shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </React.Fragment>
        );
      },
    },
  ];
  return <Table rowKey="id" dataSource={contents} columns={columns} loading={loading} pagination={false} />;
};

export default ContentList;
