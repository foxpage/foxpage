import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation, useParams } from 'react-router-dom';

import { BuildOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table, Tag } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/detail';
import { DeleteButton } from '@/pages/common';
import { suffixTagColor } from '@/pages/common/constant/FileType';
import GlobalContext from '@/pages/GlobalContext';
import { ProjectDetailUrlParams, ProjectFileType } from '@/types/project';
import periodFormat from '@/utils/period-format';
import { isFromWorkspace, PROJECT_URL_PREFIX, WORKSPACE_URL_PREFIX } from '@/utils/project/file';

const PAGE_SIZE = 10;

const mapStateToProps = (store: RootState) => ({
  loading: store.group.project.detail.loading,
  pageInfo: store.group.project.detail.pageInfo,
  fileList: store.group.project.detail.fileList,
});

const mapDispatchToProps = {
  deleteFile: ACTIONS.deleteFile,
  fetchFileList: ACTIONS.fetchFileList,
  openDrawer: ACTIONS.setAddFileDrawerOpenStatus,
};

type ProjectListProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const FileList: React.FC<ProjectListProp> = props => {
  const {
    loading,
    pageInfo = { page: 1, size: 10, total: 1 },
    fileList,
    deleteFile,
    fetchFileList,
    openDrawer,
  } = props;
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;
  const { folderId, applicationId, organizationId } = useParams<ProjectDetailUrlParams>();
  const { pathname, search } = useLocation();
  const fromWorkspace = isFromWorkspace(search);
  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      render: (text: string, record: ProjectFileType) => {
        return (
          <Link
            onClick={() => {
              localStorage['foxpage_project_file'] = JSON.stringify(record);
            }}
            to={`/organization/${organizationId}/${
              fromWorkspace ? WORKSPACE_URL_PREFIX : PROJECT_URL_PREFIX
            }/${applicationId}/folder/${folderId}/file/${record.id}/content/?fileType=${record.type}&from=${
              fromWorkspace ? 'workspace' : 'project'
            }`}
          >
            {text}
          </Link>
        );
      },
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => {
        return <Tag color={suffixTagColor[text]}>{file[text]}</Tag>;
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: ProjectFileType) => {
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
      width: 130,
      render: (_text: string, record: ProjectFileType) => {
        return (
          <React.Fragment>
            <Button type="default" size="small" shape="circle" title={global.build}>
              <Link
                to={{
                  pathname: `/application/${applicationId}/folder/${folderId}/file/${record.id}/builder`,
                  state: { backPathname: pathname, backSearch: search },
                }}
                onClick={() => {
                  localStorage['foxpage_project_file'] = JSON.stringify(record);
                }}
              >
                <BuildOutlined />
              </Link>
            </Button>
            <Button
              type="default"
              size="small"
              shape="circle"
              title={global.edit}
              onClick={() => openDrawer(true, record)}
              style={{ marginLeft: 8 }}
            >
              <EditOutlined />
            </Button>
            <Popconfirm
              title={`${file.deleteMessage}${file[record.type]}?`}
              onConfirm={() => {
                deleteFile({ id: record.id, applicationId, folderId });
              }}
              okText={global.yes}
              cancelText={global.no}
            >
              <DeleteButton
                type="default"
                size="small"
                shape="circle"
                title={global.remove}
                style={{ marginLeft: 8 }}
              />
            </Popconfirm>
          </React.Fragment>
        );
      },
    },
  ];
  return (
    <Table
      rowKey="id"
      dataSource={fileList}
      columns={columns}
      loading={loading}
      pagination={
        pageInfo.total > pageInfo.size
          ? { current: pageInfo.page, pageSize: pageInfo.size, total: pageInfo.total }
          : false
      }
      onChange={pagination => {
        fetchFileList({
          folderId,
          applicationId,
          page: pagination.current || 1,
          size: pagination.pageSize || PAGE_SIZE,
        });
      }}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FileList);
