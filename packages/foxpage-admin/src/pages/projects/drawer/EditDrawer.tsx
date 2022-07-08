import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { SyncOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/projects/list';
import OperationDrawer from '@/components/business/OperationDrawer';
import GlobalContext from '@/pages/GlobalContext';
import { Application } from '@/types/application';

const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const APP_PAGE_SIZE = 1000;

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  drawerOpen: store.projects.list.drawerOpen,
  editProject: store.projects.list.editProject,
  apps: store.projects.list.apps,
  saveLoading: store.projects.list.saveLoading,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.setAddDrawerOpenStatus,
  fetchApps: ACTIONS.fetchApps,
  update: ACTIONS.updateEditProjectValue,
  save: ACTIONS.saveProject,
};

interface IProps {
  onSaveSuccess?: () => void;
}

type DrawerProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const Drawer: React.FC<DrawerProp> = (props) => {
  const {
    organizationId,
    drawerOpen,
    editProject,
    apps = [],
    saveLoading,
    closeDrawer,
    update,
    fetchApps,
    save,
    onSaveSuccess,
  } = props;

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { project, global } = locale.business;

  useEffect(() => {
    fetchApps({ page: 1, size: APP_PAGE_SIZE });
  }, []);

  return (
    <OperationDrawer
      open={drawerOpen}
      title={editProject?.id ? 'Edit' : 'Add'}
      onClose={() => {
        closeDrawer(false);
      }}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            save({ organizationId, onSuccess: onSaveSuccess });
          }}>
          {global.apply}
          {saveLoading && <SyncOutlined spin={true} style={{ color: '#fff' }} />}
        </Button>
      }>
      {editProject ? (
        <div style={{ padding: 12 }}>
          <Form.Item {...formItemLayout} label={project.nameLabel}>
            <Input
              defaultValue={editProject.name}
              placeholder={project.nameLabel}
              onChange={(e) => update('name', e.target.value)}
            />
          </Form.Item>
          <Form.Item {...formItemLayout} label={global.application}>
            <Select
              disabled={!!editProject.id}
              defaultValue={editProject.application ? editProject.application.id : undefined}
              onChange={(value) => {
                update('application', {
                  id: value,
                });
              }}>
              {apps.map((app: Application) => (
                <Option value={app.id} key={app.id}>
                  {app.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      ) : (
        <div />
      )}
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
