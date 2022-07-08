import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { SyncOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/project/list';
import OperationDrawer from '@/components/business/OperationDrawer';
import GlobalContext from '@/pages/GlobalContext';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.organizationId,
  application: store.group.application.settings.application,
  drawerOpen: store.workspace.projects.project.list.drawerOpen,
  editProject: store.workspace.projects.project.list.editProject,
  apps: store.workspace.projects.project.list.apps,
  saveLoading: store.workspace.projects.project.list.saveLoading,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.setAddDrawerOpenStatus,
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
    application,
    drawerOpen,
    editProject,
    saveLoading,
    closeDrawer,
    update,
    save,
    onSaveSuccess,
  } = props;

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { project, global } = locale.business;

  const handleChange = (name) => {
    if (typeof name !== 'undefined') {
      update('name', name);

      // set default app
      update('application', {
        id: application?.id || '',
      });
    }
  };

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
              onChange={(e) => handleChange(e.target.value)}
            />
          </Form.Item>
        </div>
      ) : (
        <div />
      )}
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
