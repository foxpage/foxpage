import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { connect } from 'react-redux';

import { Button, Form, Input, Select } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/list';
import { Group, OperationDrawer } from '@/components/index';
import { ComponentType } from '@/constants/index';
import { GlobalContext } from '@/pages/system';

const { Option } = Select;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  componentDrawer: store.applications.detail.packages.list.componentDrawer,
  packageType: store.applications.detail.packages.list.selectPackage,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.resetComponentDrawerState,
  addComponent: ACTIONS.addComponentAction,
};

type DrawerProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Drawer: React.FC<DrawerProp> = (props) => {
  const { applicationId, componentDrawer, packageType, closeDrawer, addComponent } = props;
  const { open, type, data } = componentDrawer;

  const initialValuesRef = useRef<any>({});

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, version: versionI18n } = locale.business;

  const [form] = Form.useForm();

  useMemo(() => {
    let initialValues = {};
    if (type === 'edit') {
      initialValues = {
        name: data.name || '',
      };
    }
    initialValuesRef.current = initialValues;
  }, [type, data]);

  const afterVisibleChange = useCallback((visiable) => {
    if (visiable) {
      form.setFieldsValue(initialValuesRef.current);
    } else {
      form.resetFields();
    }
  }, []);

  const onSave = () => {
    form
      .validateFields()
      .then((values) => {
        const { name, componentType } = values;
        if (type === 'add') {
          if (applicationId)
            addComponent(
              {
                applicationId,
                name,
                type: packageType,
                componentType,
              },
              {
                onSuccess: () => {
                  closeDrawer();
                },
              },
            );
        } else {
          console.error('unhandled type:', type);
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <OperationDrawer
      open={open}
      title={type === 'edit' ? global.edit : global.add}
      onClose={closeDrawer}
      width={480}
      destroyOnClose
      actions={
        <Button type="primary" onClick={onSave}>
          {global.apply}
        </Button>
      }
      afterVisibleChange={afterVisibleChange}>
      <Group>
        <Form {...formItemLayout} form={form}>
          <Form.Item
            name="name"
            label={global.nameLabel}
            getValueFromEvent={(e) => e.target.value?.trim()}
            rules={[{ required: true }]}>
            <Input placeholder={global.nameLabel} />
          </Form.Item>
          <Form.Item name="componentType" label={versionI18n.componentType} rules={[{ required: true }]}>
            <Select style={{ width: '100%' }}>
              <Option value={ComponentType.reactComponent}>{ComponentType.reactComponent}</Option>
              <Option value={ComponentType.dslTemplate}>{ComponentType.dslTemplate}</Option>
            </Select>
          </Form.Item>
        </Form>
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
