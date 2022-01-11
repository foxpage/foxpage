import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Drawer, Popconfirm, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/variable';
import { ScopeEnum } from '@/constants/index';
import RightCloseIcon from '@/pages/builder/component/close';
import ScopeSelect from '@/pages/components/common/ScopeSelect';
import VariableType from '@/types/application/variable.d';

import DeleteButton from '../../common/DeleteButton';
import BuilderContext from '../BuilderContext';

import EditDrawer from './EditDrawer';

interface IProps {
  visible: boolean;
  onClose: () => void;
}
const mapStateToProps = (store: RootState) => ({
  loading: store.builder.variable.loading,
  variables: store.builder.variable.variables,
  storeApplicationId: store.builder.page.applicationId,
  storeFolderId: store.builder.page.folderId,
});

const mapDispatchToProps = {
  getVariables: ACTIONS.getVariables,
  getVariableBuildVersion: ACTIONS.getVariableBuilderVersion,
  openEditDrawer: ACTIONS.updateVariableEditDrawerOpen,
  deleteVariables: ACTIONS.deleteVariable,
  save: ACTIONS.saveVariable,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const Variable: React.FC<Type> = props => {
  const {
    visible,
    loading,
    variables,
    storeApplicationId,
    storeFolderId,
    save,
    onClose,
    openEditDrawer,
    getVariables,
    getVariableBuildVersion,
    deleteVariables,
  } = props;
  const { container } = useContext(BuilderContext);
  const [group, setGroup] = useState<ScopeEnum>(ScopeEnum.project);

  useEffect(() => {
    setGroup(ScopeEnum.project);
    if (storeApplicationId && storeFolderId) {
      getVariables(storeFolderId);
    }
  }, [storeApplicationId, storeFolderId]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (_text: string, record: VariableType) => {
        const schemas = record.content?.schemas;
        return <React.Fragment>{schemas.length > 0 ? schemas[0].type : '--'}</React.Fragment>;
      },
    },
    {
      title: 'Actions',
      key: 'updateTime',
      width: 100,
      render: (_text: string, record: VariableType) => {
        return (
          <React.Fragment>
            {group === 'project' && (
              <React.Fragment>
                <Button
                  type="default"
                  size="small"
                  shape="circle"
                  title="Edit"
                  onClick={() => {
                    openEditDrawer(record);
                    getVariableBuildVersion(record, storeApplicationId);
                  }}
                  style={{ marginLeft: 8 }}
                >
                  <EditOutlined />
                </Button>
                <Popconfirm
                  title="Are you sure to delete this variable?"
                  onConfirm={() => {
                    deleteVariables({ applicationId: storeApplicationId, fileId: record.id, folderId: storeFolderId });
                  }}
                  okText="Yes"
                  cancelText="No"
                >
                  <DeleteButton type="default" size="small" shape="circle" title="Remove" style={{ marginLeft: 8 }} />
                </Popconfirm>
              </React.Fragment>
            )}
            {group === 'application' && (
              <React.Fragment>
                <Button
                  type="default"
                  size="small"
                  shape="circle"
                  title="View"
                  onClick={() => {
                    openEditDrawer(record);
                    getVariableBuildVersion(record, storeApplicationId);
                  }}
                  style={{ marginLeft: 8 }}
                >
                  <EyeOutlined />
                </Button>
              </React.Fragment>
            )}
          </React.Fragment>
        );
      },
    },
  ];
  return (
    <React.Fragment>
      <Drawer
        title="Variable"
        placement="left"
        visible={visible}
        onClose={onClose}
        mask={false}
        style={{
          position: 'absolute',
          top: 8,
          height: 'calc(100% - 16px)',
          transition: 'none',
          left: 46,
          maxHeight: 600,
          overflowY: 'auto',
          width: '500px',
        }}
        closable={false}
        extra={<RightCloseIcon onClose={onClose} />}
        bodyStyle={{ padding: 12 }}
        getContainer={container}
      >
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <ScopeSelect
            scope={group}
            onScopeChange={group => {
              setGroup(group);
              if (group === 'project') {
                getVariables(storeFolderId);
              } else {
                getVariables();
              }
            }}
          />
          {group === 'project' && (
            <Button
              size="small"
              type="primary"
              onClick={() => {
                openEditDrawer(true);
              }}
            >
              <PlusOutlined /> Add Variable
            </Button>
          )}
        </div>
        <Table rowKey="id" loading={loading} dataSource={variables} columns={columns} pagination={false} size="small" />
      </Drawer>
      <EditDrawer
        applicationId={storeApplicationId}
        folderId={storeFolderId}
        onSave={() => {
          save({ folderId: storeFolderId, applicationId: storeApplicationId });
        }}
      />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Variable);
