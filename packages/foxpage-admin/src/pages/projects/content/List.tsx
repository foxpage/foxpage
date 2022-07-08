import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import { BuildOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Popover, Table, Tag } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/content';
import LocalsView from '@/components/business/LocalsView';
import { FileTypeEnum } from '@/constants/index';
import DeleteButton from '@/pages/common/DeleteButton';
import { BasicTemRing, LocaleTag, Ring, VLine } from '@/pages/components';
import GlobalContext from '@/pages/GlobalContext';
import { ProjectContentType } from '@/types/application/project';
import getLocationIfo from '@/utils/get-location-info';
import periodFormat from '@/utils/period-format';

const mapStateToProps = (store: RootState) => ({
  loading: store.projects.content.loading,
  contents: store.projects.content.contents,
  extendRecord: store.projects.content.extendRecord,
  fileDetail: store.projects.content.fileDetail,
});

const mapDispatchToProps = {
  deleteContent: ACTIONS.deleteContent,
  openDrawer: ACTIONS.updateEditDrawerOpen,
};

type ProjectContentListType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ProjectContent: React.FC<ProjectContentListType> = (props) => {
  const { loading, fileDetail, contents, extendRecord, deleteContent, openDrawer } = props;

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { global, content, version } = locale.business;

  // url search params
  const { pathname, search, applicationId, folderId, fileId } = getLocationIfo(useLocation());

  const columns = [
    {
      title: global.idLabel,
      dataIndex: 'id',
      width: 100,
    },
    {
      title: global.nameLabel,
      dataIndex: 'title',
      render: (text: string, record: ProjectContentType) => {
        return (
          <React.Fragment>
            <Link
              to={{
                pathname: `/application/${applicationId}/folder/${folderId}/file/${fileId}/content/${record.id}/builder`,
                state: { backPathname: pathname, backSearch: search },
              }}>
              {text}
            </Link>
            {fileDetail?.type === FileTypeEnum.page && record.urls?.length > 0 && (
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
          </React.Fragment>
        );
      },
    },
    {
      title: version.liveVersion,
      dataIndex: 'version',
      key: 'version',
      render: (text: string) => {
        return text ? <Tag color="orange">{text}</Tag> : '';
      },
    },
    {
      title: global.locale,
      dataIndex: 'tag',
      key: 'tag',
      width: 170,
      render: (_text: string, record: ProjectContentType) => {
        if (record.isBase) {
          return <LocaleTag color="blue">base</LocaleTag>;
        }
        const localesTag = record.tags ? record.tags.filter((item) => item.locale) : [];
        return <LocalsView locales={localesTag.map((item) => item.locale)} />;
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: ProjectContentType) => {
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
    {
      title: global.actions,
      key: 'updateTime',
      width: 120,
      render: (_text: string, record: ProjectContentType) => {
        return (
          <React.Fragment>
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
          </React.Fragment>
        );
      },
    },
  ];

  if (fileDetail?.type === FileTypeEnum.page) {
    columns.unshift({
      title: '',
      key: '',
      width: 20,
      render: (_text: string, record: ProjectContentType) => {
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

  return <Table rowKey="id" dataSource={contents} columns={columns} loading={loading} pagination={false} />;
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectContent);
