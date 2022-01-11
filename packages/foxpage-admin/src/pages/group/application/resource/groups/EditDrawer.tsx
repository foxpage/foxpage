import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, Form, Input, Radio } from 'antd';
import { RootState } from 'typesafe-actions';

import { getApplicationsResources } from '@/apis/group/application/resource';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Group } from '@/components/widgets/group';
import { FileTagType } from '@/constants/file';
import * as ACTIONS from '@/store/actions/group/application/resource/groups';
import { AppResourceGroupType, AppResourcesGroupsSaveResourcesGroupParams } from '@/types/application/resources';

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};

const mapStateToProps = (store: RootState) => ({
  drawerOpen: store.group.application.resource.groups.editDrawer.drawerOpen,
  editGroup: store.group.application.resource.groups.editDrawer.group,
});

const mapDispatchToProps = {
  resetDrawer: ACTIONS.resetResourcesEditDrawerState,
  saveGroups: ACTIONS.saveResourcesGroupAction,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Drawer: React.FC<ComponentsProps> = props => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { drawerOpen, editGroup, resetDrawer, saveGroups } = props;
  const [resourceType, setResourceType] = useState<AppResourceGroupType[]>([]);
  const [form] = Form.useForm();
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
      form.setFieldsValue({
        name: editGroup.name,
        intro: editGroup.intro,
        manifestPath: editGroup.tags.find(item => item.type === FileTagType.ResourceConfig)?.manifestPath,
        resourceId: editGroup.tags.find(item => item.resourceId)?.resourceId,
      });
    }
  }, [editGroup]);
  const onSave = () => {
    form
      .validateFields()
      .then(values => {
        const { name, intro = '', resourceId, manifestPath } = values;
        const resource = resourceType.find(item => item.id === resourceId) || resourceType[0];
        const params: AppResourcesGroupsSaveResourcesGroupParams = {
          id: editGroup?.id,
          appId: applicationId,
          name,
          intro,
          resourceId,
          resourceType: resource.type,
          config: {
            manifestPath,
          },
        };
        saveGroups(params, {
          onSuccess: () => {
            resetDrawer();
            form.resetFields();
          },
        });
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };
  return (
    <OperationDrawer
      open={drawerOpen}
      title={editGroup?.id ? 'Edit Group' : 'Add Group'}
      onClose={resetDrawer}
      width={480}
      destroyOnClose
      actions={
        <Button type="primary" onClick={onSave}>
          {editGroup?.id ? 'Edit' : 'Add'} Resource Group
        </Button>
      }
    >
      <Group>
        <Form {...formItemLayout} form={form} name="control-hooks" initialValues={editGroup}>
          <Form.Item name="name" label="Group Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="resourceId"
            label="Resource Type"
            rules={[{ required: true, message: 'resourceType is required' }]}
          >
            <Radio.Group disabled={editGroup?.id}>
              {resourceType &&
                resourceType.map(item => (
                  <Radio value={item.id} key={item.id}>
                    {item.name}
                  </Radio>
                ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item name="intro" label="Group Info">
            <Input />
          </Form.Item>
          <Form.Item name="manifestPath" label="Manifest Path">
            <Input />
          </Form.Item>
        </Form>
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
