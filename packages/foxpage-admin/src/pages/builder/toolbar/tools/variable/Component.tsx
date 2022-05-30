import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Drawer, Popconfirm, Table } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/variable';
import { ScopeEnum } from '@/constants/index';
import RightCloseIcon from '@/pages/builder/component/close';
import DeleteButton from '@/pages/common/DeleteButton';
import ScopeSelect from '@/pages/components/common/ScopeSelect';
import GlobalContext from '@/pages/GlobalContext';
import VariableType from '@/types/application/variable.d';

import BuilderContext from '../../../BuilderContext';
import { DrawerHeader } from '../common/CommonStyles';

import EditDrawer from './EditDrawer';

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

interface DProps extends Omit<DrawerProps, 'onClose'> {
  onClose?: () => void;
}

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & DProps;

const Variable: React.FC<Type> = (props) => {
  const {
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
  const { locale } = useContext(GlobalContext);
  const { global, variable } = locale.business;

  useEffect(() => {
    setGroup(ScopeEnum.project);
    if (storeApplicationId && storeFolderId) {
      getVariables(storeFolderId);
    }
  }, [storeApplicationId, storeFolderId]);

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
      render: (_text: string, record: VariableType) => {
        const schemas = record.content?.schemas;
        return <React.Fragment>{schemas.length > 0 ? schemas[0].type : '--'}</React.Fragment>;
      },
    },
    {
      title: global.actions,
      key: 'updateTime',
      width: 100,
      render: (_text: string, record: VariableType) => {
        return (
          <React.Fragment>
            {group === ScopeEnum.project && (
              <React.Fragment>
                <Button
                  type="default"
                  size="small"
                  shape="circle"
                  title={global.edit}
                  onClick={() => {
                    openEditDrawer(record);
                    getVariableBuildVersion(record, storeApplicationId);
                  }}
                  style={{ marginLeft: 8 }}>
                  <EditOutlined />
                </Button>
                <Popconfirm
                  title={`${global.deleteMsg}${record.name}`}
                  onConfirm={() => {
                    deleteVariables({
                      applicationId: storeApplicationId,
                      fileId: record.id,
                      folderId: storeFolderId,
                    });
                  }}
                  okText={global.yes}
                  cancelText={global.no}>
                  <DeleteButton
                    type="default"
                    size="small"
                    shape="circle"
                    title={global.remove}
                    style={{ marginLeft: 8 }}
                  />
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
                  style={{ marginLeft: 8 }}>
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
        title={<DrawerHeader>{variable.title}</DrawerHeader>}
        placement="left"
        visible
        destroyOnClose
        mask={false}
        closable={false}
        extra={<RightCloseIcon onClose={onClose} />}
        width={410}
        getContainer={container}
        onClose={onClose}
        headerStyle={{ padding: 16 }}
        bodyStyle={{ padding: 16 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 50,
          boxShadow: 'rgba(0, 0, 0, 0.1) 4px 4px 4px 2px',
          overflowY: 'auto',
          transition: 'none',
        }}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
          <ScopeSelect
            scope={group}
            onScopeChange={(group) => {
              setGroup(group);
              if (group === ScopeEnum.project) {
                getVariables(storeFolderId);
              } else {
                getVariables();
              }
            }}
          />
          {group === ScopeEnum.project && (
            <Button
              size="small"
              type="primary"
              onClick={() => {
                openEditDrawer(true);
              }}>
              <PlusOutlined /> {variable.add}
            </Button>
          )}
        </div>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={variables}
          columns={columns}
          pagination={false}
          size="small"
        />
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
