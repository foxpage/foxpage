import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Divider, Popconfirm, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/variable';
import EditDrawer from '@/pages/builder/toolbar/tools/variable/EditDrawer';
import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import GlobalContext from '@/pages/GlobalContext';
import VariableType from '@/types/application/variable.d';
import periodFormat from '@/utils/period-format';

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
    openEditDrawer,
    getApplicationVariables,
    getVariableBuildVersion,
    deleteVariables,
    clearAll,
  } = props;

  const { locale } = useContext(GlobalContext);
  const { global, folder, application } = locale.business;

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
      width: 100,
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
      </FoxpageDetailContent>

      <EditDrawer applicationId={applicationId} folderId={folderId} onSave={handleSave} />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Variable);
