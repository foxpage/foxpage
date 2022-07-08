import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Divider, Popconfirm, Table, Tag } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/variable';
import EditDrawer from '@/pages/builder/toolbar/tools/variable/EditDrawer';
import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import { PublishIcon } from '@/pages/common/CustomIcon';
import GlobalContext from '@/pages/GlobalContext';
import VariableType from '@/types/application/variable.d';
import periodFormat from '@/utils/period-format';

const PublishOutlined = styled(PublishIcon)`
  width: 16px;
  height: 16px;
  svg {
    width: 16px;
    height: 16px;
  }
`;

const OptionsBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

interface IProps {
  visible: boolean;
  onClose: () => void;
}
const mapStateToProps = (store: RootState) => ({
  loading: store.builder.variable.loading,
  variables: store.builder.variable.variables,
  pageInfo: store.builder.variable.pageInfo,
});

const mapDispatchToProps = {
  getApplicationVariables: ACTIONS.getApplicationVariables,
  getVariableBuildVersion: ACTIONS.getVariableBuilderVersion,
  openEditDrawer: ACTIONS.updateVariableEditDrawerOpen,
  deleteVariables: ACTIONS.deleteVariable,
  save: ACTIONS.saveVariable,
  publish: ACTIONS.publishVariable,
  commitToStore: ACTIONS.commitToStore,
  clearAll: ACTIONS.clearAll,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const Variable: React.FC<Type> = (props) => {
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const { applicationId } = useParams<{ applicationId: string }>();
  const {
    loading,
    variables,
    pageInfo,
    save,
    publish,
    openEditDrawer,
    getApplicationVariables,
    getVariableBuildVersion,
    deleteVariables,
    commitToStore,
    clearAll,
  } = props;

  const { locale } = useContext(GlobalContext);
  const { global, folder, application, store, variable } = locale.business;

  useEffect(() => {
    getApplicationVariables(applicationId, pageInfo);
    return () => {
      clearAll();
    };
  }, []);

  const handleDelete = (id: string) => {
    const page = variables.length === 1 && pageInfo.page > 1 ? pageInfo.page - 1 : pageInfo.page;
    deleteVariables({
      applicationId,
      fileId: id,
      successCb: () => {
        getApplicationVariables(applicationId, { ...pageInfo, page });
      },
    });
  };

  const handleSave = () => {
    save({
      applicationId,
      folderId,
      successCb: () => {
        getApplicationVariables(applicationId, pageInfo);
      },
    });
  };

  const handlePublish = (contentId) => {
    if (contentId) {
      publish(
        {
          applicationId,
          contentId,
          status: 'release',
        },
        () => {
          getApplicationVariables(applicationId, pageInfo);
        },
      );
    }
  };

  const handleCommit = (id, isOnline) => {
    if (id) {
      commitToStore(
        {
          id,
          applicationId: applicationId,
          type: 'variable',
          isOnline,
        },
        () => {
          getApplicationVariables(applicationId, pageInfo);
        },
      );
    }
  };

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => {
        return (
          <>
            {text}
            {/* {record.tags?.find(item => item.copyFrom) && (
              <Tag color={suffixTagColor.refer} style={{ marginLeft: 4 }}>
                refer
              </Tag>
            )} */}
          </>
        );
      },
    },
    {
      title: folder.name,
      dataIndex: 'folderName',
      key: 'folderName',
      render: (folderName) =>
        folderName === '_variable' ? <Tag color="blue">Application</Tag> : <span>{folderName}</span>,
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'schemas',
      render: (_text: string, record: VariableType) => {
        const schemas = record.content?.schemas;
        return <React.Fragment>{schemas?.length > 0 ? schemas[0].type : '--'}</React.Fragment>;
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: VariableType) => {
        return record.creator.account;
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => {
        return periodFormat(text, 'unknown');
      },
    },
    {
      title: global.actions,
      key: 'id',
      width: 180,
      render: (_text: string, record: VariableType) => {
        return (
          <React.Fragment>
            <Button
              type="default"
              size="small"
              shape="circle"
              title="Edit"
              onClick={() => {
                setFolderId(record.folderId);
                openEditDrawer(record);
                getVariableBuildVersion(record, applicationId);
              }}>
              <EditOutlined />
            </Button>
            <Divider type="vertical" />
            <Button
              type="default"
              size="small"
              shape="circle"
              title={global.publish}
              onClick={() => handlePublish(record.contentId)}>
              <PublishOutlined />
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title={record?.online ? store.revokeTitle : store.commitTitle}
              okText={global.yes}
              cancelText={global.no}
              onConfirm={() => handleCommit(record.id, record.online)}>
              <Button
                type="default"
                size="small"
                shape="circle"
                title={record?.online ? store.revoke : store.commit}>
                {record?.online ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
              </Button>
            </Popconfirm>
            <Divider type="vertical" />
            <Popconfirm
              title={`${global.deleteMsg} ${record.name}?`}
              onConfirm={() => {
                handleDelete(record.id);
              }}
              okText={global.yes}
              cancelText={global.no}>
              <Button size="small" shape="circle" icon={<DeleteOutlined />} />
            </Popconfirm>
          </React.Fragment>
        );
      },
    },
  ];

  return (
    <React.Fragment>
      <FoxpageDetailContent
        breadcrumb={
          <FoxpageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/application' },
              { name: global.variables },
            ]}
          />
        }>
        <>
          <OptionsBox>
            <Button type="primary" onClick={() => openEditDrawer(true)}>
              <PlusOutlined /> {variable.add}
            </Button>
          </OptionsBox>
          <Table
            rowKey={(record: VariableType) => record.id.toString()}
            loading={loading}
            dataSource={variables}
            columns={columns}
            pagination={
              pageInfo.total > pageInfo.size
                ? {
                    position: ['bottomCenter'],
                    current: pageInfo.page,
                    pageSize: pageInfo.size,
                    total: pageInfo.total,
                  }
                : false
            }
            onChange={(pagination) => {
              if (pagination.current && pagination.pageSize) {
                getApplicationVariables(applicationId, {
                  ...pageInfo,
                  page: pagination.current,
                  size: pagination.pageSize,
                });
              }
            }}
          />
        </>
      </FoxpageDetailContent>

      <EditDrawer applicationId={applicationId} folderId={folderId} onSave={handleSave} />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Variable);
