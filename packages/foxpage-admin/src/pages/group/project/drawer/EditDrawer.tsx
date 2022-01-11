import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { SyncOutlined } from '@ant-design/icons';
import { Button, Form, Input, Select } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/list';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Application } from '@/types/application';

const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const APP_PAGE_SIZE = 1000;

const mapStateToProps = (store: RootState) => ({
  drawerOpen: store.group.project.list.drawerOpen,
  editProject: store.group.project.list.editProject,
  apps: store.group.project.list.apps,
  saveLoading: store.group.project.list.saveLoading,
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

const Drawer: React.FC<DrawerProp> = props => {
  const {
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
  const { organizationId } = useParams<{ organizationId: string }>();

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
          }}
        >
          Apply
          {saveLoading && <SyncOutlined spin={true} style={{ color: '#fff' }} />}
        </Button>
      }
    >
      {editProject ? (
        <div style={{ padding: 12 }}>
          <Form.Item {...formItemLayout} label="Project name">
            <Input
              defaultValue={editProject.name}
              placeholder="Project name"
              onChange={e => update('name', e.target.value)}
            />
          </Form.Item>
          <Form.Item {...formItemLayout} label="Application">
            <Select
              disabled={!!editProject.id}
              defaultValue={editProject.application ? editProject.application.id : undefined}
              onChange={value => {
                update('application', {
                  id: value,
                });
              }}
            >
              {apps.map((app: Application) => (
                <Option value={app.id} key={app.id}>
                  {app.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>
      ) : (
        <div></div>
      )}
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
