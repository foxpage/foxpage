import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { SyncOutlined } from '@ant-design/icons';
import { Button, Form, Input, message } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/applications/list';
import { OperationDrawer } from '@/components/index';
import { GlobalContext } from '@/pages/system';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const mapStateToProps = (store: RootState) => ({
  saveLoading: store.workspace.applications.list.saveLoading,
  drawerOpen: store.workspace.applications.list.editDrawerVisible,
  editApp: store.workspace.applications.list.editApp,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.openEditDrawer,
  updateApp: ACTIONS.updateApp,
  saveApp: ACTIONS.saveApp,
};

type TeamEditDrawerType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Drawer: React.FC<TeamEditDrawerType> = (props) => {
  const { saveLoading, drawerOpen, editApp, closeDrawer, updateApp, saveApp } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, application } = locale.business;

  const handleSave = () => {
    if (!editApp.name) {
      message.warning(application.nameInvalid);
      return;
    }

    saveApp();
  };

  return (
    <OperationDrawer
      destroyOnClose
      title={editApp.id ? application.edit : application.add}
      width={480}
      open={drawerOpen}
      actions={
        <Button type="primary" onClick={handleSave}>
          {global.apply}
          {saveLoading && <SyncOutlined spin={true} style={{ color: '#fff' }} />}
        </Button>
      }
      onClose={() => closeDrawer(false)}>
      {editApp ? (
        <div style={{ padding: 12 }}>
          <Form.Item {...formItemLayout} label={application.nameLabel}>
            <Input
              value={editApp?.name}
              placeholder={application.nameLabel}
              onChange={(e) => updateApp('name', e.target.value)}
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
