import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Button, Form, Input, Radio } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/resources/groups';
import { Group, OperationDrawer } from '@/components/index';
import { ResourceTagEnum } from '@/constants/file';
import { GlobalContext } from '@/pages/system';
import { ApplicationResourceGroupTypeEntity, ApplicationResourcesGroupSaveParams } from '@/types/index';
import { objectEmptyCheck } from '@/utils/empty-check';

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  drawerOpen: store.applications.detail.resources.groups.drawerOpen,
  editGroup: store.applications.detail.resources.groups.editGroup,
  resourceUrl: store.applications.detail.resources.groups.resourceUrl,
});

const mapDispatchToProps = {
  saveGroup: ACTIONS.saveResourcesGroup,
  fetchResourcesGroupTypes: ACTIONS.fetchResourcesGroupTypes,
  fetchResourceRemoteUrl: ACTIONS.fetchResourcesRemoteUrl,
  resetDrawer: ACTIONS.resetResourcesEditDrawerState,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Drawer: React.FC<ComponentsProps> = (props) => {
  const {
    applicationId,
    drawerOpen,
    editGroup,
    resourceUrl,
    saveGroup,
    fetchResourcesGroupTypes,
    fetchResourceRemoteUrl,
    resetDrawer,
  } = props;
  const [resourceType, setResourceType] = useState<ApplicationResourceGroupTypeEntity[]>([]);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, resource } = locale.business;

  const [form] = Form.useForm();

  const getResourceType = (resourceId?: string) => {
    return resourceType.find((item) => item.id === resourceId) || resourceType[0];
  };

  useEffect(() => {
    if (applicationId) {
      fetchResourcesGroupTypes({ applicationId }, (groupTypeList) => setResourceType(groupTypeList));
    }
  }, [applicationId]);

  useEffect(() => {
    if (!objectEmptyCheck(editGroup)) {
      const resourceScope = editGroup.tags.find(
        (item) => item.type === ResourceTagEnum.ResourceConfig,
      )?.resourceScope;
      const resourceId = editGroup.tags.find((item) => item.resourceId)?.resourceId;

      if (resourceScope) {
        fetchResourceRemoteUrl({
          applicationId,
          resourceType: getResourceType(resourceId).name as string,
          resourceScope,
        });
      }

      form.setFieldsValue({
        name: editGroup.name,
        intro: editGroup.intro,
        resourceScope,
        resourceId,
      });
    } else {
      form.setFieldsValue({
        name: undefined,
        intro: undefined,
        resourceScope: undefined,
        resourceId: undefined,
      });
    }
  }, [editGroup]);

  const handleScopeChange = (value) => {
    const resourceId = editGroup?.tags.find((item) => item.resourceId)?.resourceId;
    fetchResourceRemoteUrl({
      applicationId,
      resourceType: getResourceType(resourceId).name as string,
      resourceScope: value,
    });
  };

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        const { name, intro = '', resourceId, resourceScope } = values;
        const params: ApplicationResourcesGroupSaveParams = {
          id: editGroup?.id,
          applicationId,
          name,
          intro,
          resourceId,
          resourceType: getResourceType(resourceId).type as string,
          config: {
            resourceScope,
          },
        };

        saveGroup(params, {
          onSuccess: () => {
            resetDrawer();
            form.resetFields();
          },
        });
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <OperationDrawer
      open={drawerOpen}
      title={editGroup?.id ? resource.editGroup : resource.addGroup}
      onClose={resetDrawer}
      width={480}
      actions={
        <Button type="primary" onClick={handleSave}>
          {global.apply}
        </Button>
      }>
      <Group>
        <Form {...formItemLayout} form={form} name="control-hooks">
          <Form.Item name="name" label={resource.groupName} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="resourceId"
            label={resource.groupType}
            rules={[{ required: true, message: 'resourceType is required' }]}>
            <Radio.Group disabled={editGroup?.id}>
              {resourceType &&
                resourceType.map((item) => (
                  <Radio value={item.id} key={item.id}>
                    <>{item.name}</>
                  </Radio>
                ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item name="intro" label={resource.groupInfo}>
            <Input />
          </Form.Item>
          <Form.Item name="resourceScope" label={resource.resourceScope}>
            <Input onChange={(e) => handleScopeChange(e.target.value)} />
          </Form.Item>
          <Form.Item name="resourceScopeTips" label={resource.resourceScopeAddress}>
            <a href={resourceUrl} target="_blank" style={{ wordBreak: 'break-all' }}>
              {resourceUrl}
            </a>
          </Form.Item>
        </Form>
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
