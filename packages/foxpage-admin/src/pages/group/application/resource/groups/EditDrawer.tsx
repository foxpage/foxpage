import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, Form, Input, Radio } from 'antd';
import { RootState } from 'typesafe-actions';

import { getApplicationsResources } from '@/apis/group/application/resource';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Group } from '@/components/widgets/group';
import { FileTagType } from '@/constants/file';
import GlobalContext from '@/pages/GlobalContext';
import * as ACTIONS from '@/store/actions/group/application/resource/groups';
import {
  AppResourceGroupType,
  AppResourcesGroupsSaveResourcesGroupParams,
} from '@/types/application/resources';

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};

const mapStateToProps = (store: RootState) => ({
  drawerOpen: store.group.application.resource.groups.editDrawer.drawerOpen,
  editGroup: store.group.application.resource.groups.editDrawer.group,
  resourceUrl: store.group.application.resource.groups.resourceUrl,
});

const mapDispatchToProps = {
  resetDrawer: ACTIONS.resetResourcesEditDrawerState,
  saveGroups: ACTIONS.saveResourcesGroupAction,
  getResourceUrl: ACTIONS.getResourceUrl,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Drawer: React.FC<ComponentsProps> = (props) => {
  const { drawerOpen, resourceUrl, getResourceUrl, editGroup, resetDrawer, saveGroups } = props;
  const [resourceType, setResourceType] = useState<AppResourceGroupType[]>([]);

  const { applicationId } = useParams<{ applicationId: string }>();

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { global, resource } = locale.business;

  const [form] = Form.useForm();

  const getResourceType = (resourceId?: string) => {
    return resourceType.find((item) => item.id === resourceId) || resourceType[0];
  };

  const fetchResourceType = useCallback(async () => {
    const rs = await getApplicationsResources({
      applicationId,
    });
    if (rs.code === 200) {
      setResourceType(rs.data || []);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchResourceType();
  }, []);

  useEffect(() => {
    if (editGroup) {
      const resourceScope = editGroup.tags.find((item) => item.type === FileTagType.ResourceConfig)
        ?.resourceScope;
      const resourceId = editGroup.tags.find((item) => item.resourceId)?.resourceId;
      if (resourceScope) {
        getResourceUrl({ applicationId, resourceType: getResourceType(resourceId).name, resourceScope });
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
    getResourceUrl({ applicationId, resourceType: getResourceType(resourceId).name, resourceScope: value });
  };

  const onSave = () => {
    form
      .validateFields()
      .then((values) => {
        const { name, intro = '', resourceId, resourceScope } = values;
        const params: AppResourcesGroupsSaveResourcesGroupParams = {
          id: editGroup?.id,
          appId: applicationId,
          name,
          intro,
          resourceId,
          resourceType: getResourceType(resourceId).type,
          config: {
            resourceScope,
          },
        };
        saveGroups(params, {
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
        <Button type="primary" onClick={onSave}>
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
                    {item.name}
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
            <a href={resourceUrl} target="_blank">
              {resourceUrl}
            </a>
          </Form.Item>
        </Form>
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
