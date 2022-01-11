import React from 'react';
import { connect } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';

import { EditOutlined,LinkOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Popover, Table, Tag } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/content';
import LocalsView from '@/components/business/LocalsView';
import DeleteButton from '@/pages/common/DeleteButton';
import { ProjectContentType } from '@/types/application/project';
import { ProjectContentUrlParams } from '@/types/project';
import periodFormat from '@/utils/period-format';

const mapStateToProps = (store: RootState) => ({
  loading: store.group.project.content.loading,
  contents: store.group.project.content.contents,
  fileDetail: store.group.project.content.fileDetail,
});

const mapDispatchToProps = {
  deleteContent: ACTIONS.deleteContent,
  openDrawer: ACTIONS.updateEditDrawerOpen,
};

type ProjectContentListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ProjectContent: React.FC<ProjectContentListType> = props => {
  const { loading, fileDetail, contents, deleteContent, openDrawer } = props;
  const { fileId, folderId, applicationId } = useParams<ProjectContentUrlParams>();

  const { pathname, search } = useLocation();

  const columns = [
    {
      title: 'name',
      dataIndex: 'title',
      render: (text: string, record: ProjectContentType) => {
        return (
          <React.Fragment>
            <Link
              to={{
                pathname: `/application/${applicationId}/folder/${folderId}/file/${fileId}/content/${record.id}/builder`,
                state: { backPathname: pathname, backSearch: search },
              }}
            >
              {text}
            </Link>
            {fileDetail?.type === 'page' && record.urls?.length > 0 && (
              <Popover
                placement="bottom"
                content={
                  <React.Fragment>
                    {record.urls.map(url => {
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
      title: 'Type',
      dataIndex: 'version',
      key: 'version',
      render: () => {
        return <Tag color="orange">content</Tag>;
      },
    },
    {
      title: 'Live Version',
      dataIndex: 'version',
      key: 'version',
      render: (text: string) => {
        return text || '--';
      },
    },
    {
      title: 'Locale',
      dataIndex: 'tag',
      key: 'tag',
      render: (_text: string, record: ProjectContentType) => {
        const localesTag = record.tags ? record.tags.filter(item => item.locale) : [];
        return <LocalsView locales={localesTag.map(item => item.locale)} />;
      },
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: ProjectContentType) => {
        return record.creator ? record.creator.account : '--';
      },
    },
    {
      title: 'CreateTime',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: 'Actions',
      key: 'updateTime',
      width: 120,
      render: (_text: string, record: ProjectContentType) => {
        return (
          <React.Fragment>
            <Button type="default" size="small" shape="circle" title="Edit" onClick={() => openDrawer(true, record)}>
              <EditOutlined />
            </Button>
            <Popconfirm
              title={`Are you sure to delete this ${record.title}?`}
              onConfirm={() => {
                if (fileDetail) {
                  deleteContent({ applicationId, id: record.id, fileId, fileType: fileDetail.type });
                }
              }}
              okText="Yes"
              cancelText="No"
            >
              <DeleteButton type="default" size="small" shape="circle" title="Remove" style={{ marginLeft: 8 }} />
            </Popconfirm>
          </React.Fragment>
        );
      },
    },
  ];
  return <Table rowKey="id" dataSource={contents} columns={columns} loading={loading} pagination={false} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectContent);
