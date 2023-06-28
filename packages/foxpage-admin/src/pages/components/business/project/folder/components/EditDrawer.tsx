import React, { useContext, useEffect } from 'react';

import { SyncOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Select } from 'antd';

import { OperationDrawer } from '@/components/index';
import { GlobalContext } from '@/pages/system';
import {
  Application,
  PaginationInfo,
  PaginationReqParams,
  ProjectEntity,
  ProjectListFetchParams,
  ProjectSaveParams,
} from '@/types/index';

const APP_PAGE_SIZE = 1000;

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

interface DrawerProps {
  type: string;
  applicationId?: string;
  saveLoading: boolean;
  pageInfo: PaginationInfo;
  search?: string;
  drawerOpen: boolean;
  editProject: ProjectEntity;
  apps?: Application[];
  fetchProjectList: (params: ProjectListFetchParams) => void;
  fetchApps?: (params: PaginationReqParams) => void;
  updateEditProject: (name: string, value: unknown) => void;
  saveProject: (params: ProjectSaveParams, cb?: () => void) => void;
  closeDrawer: (open: boolean, editProject?: ProjectEntity) => void;
}

const Drawer: React.FC<DrawerProps> = (props: DrawerProps) => {
  const {
    applicationId,
    saveLoading,
    search,
    pageInfo,
    drawerOpen,
    editProject,
    apps = [],
    fetchProjectList,
    fetchApps,
    updateEditProject,
    saveProject,
    closeDrawer,
  } = props;

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { global, application: applicationI18n } = locale.business;

  useEffect(() => {
    if (typeof fetchApps === 'function') fetchApps({ page: 1, size: APP_PAGE_SIZE });
  }, []);

  const handleSave = () => {
    if (organizationId) {
      const { name = '', application } = editProject || {};

      if (!name) {
        message.warning(applicationI18n.nameInvalid);
        return;
      }
      if (String(name).length < 5) {
        message.warning(applicationI18n.nameLengthInvalid);
        return;
      }
      if (!applicationId && (!application || !application?.id) && !search) {
        message.warning(applicationI18n.notSelectError);
        return;
      }

      saveProject({ organizationId, applicationId: search }, () => {
        // close drawer
        closeDrawer(false);

        // refresh project list
        fetchProjectList({
          organizationId,
          applicationId,
          page: pageInfo.page,
          size: pageInfo.size,
          search,
        });
      });
    }
  };

  return (
    <OperationDrawer
      destroyOnClose
      width={480}
      title={editProject?.id ? global.edit : global.add}
      open={drawerOpen}
      onClose={() => {
        closeDrawer(false);
      }}
      actions={
        <Button type="primary" onClick={handleSave}>
          {global.save}
          {saveLoading && <SyncOutlined spin={true} style={{ color: '#fff' }} />}
        </Button>
      }>
      {editProject ? (
        <div style={{ padding: '24px 12px' }}>
          <Form.Item {...formItemLayout} label={global.nameLabel}>
            <Input
              defaultValue={editProject.name}
              placeholder={applicationI18n.nameLengthInvalid?.toLowerCase()}
              onChange={(e) => updateEditProject('name', e.target.value)}
            />
          </Form.Item>
          {!applicationId && (
            <Form.Item {...formItemLayout} label={global.application}>
              <Select
                showSearch
                allowClear
                optionFilterProp="children"
                placeholder={applicationI18n.selectApplication}
                disabled={!!editProject.id}
                defaultValue={editProject.application ? editProject.application.id : search || undefined}
                onChange={(value) => {
                  updateEditProject('application', {
                    id: value,
                  });
                }}>
                {apps.map((app: Application) => (
                  <Option value={app.id} key={app.id}>
                    {app.name}
                    {app?.organization?.name ? `(${app.organization.name})` : ''}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
        </div>
      ) : (
        <div />
      )}
    </OperationDrawer>
  );
};

export default Drawer;
