import React, { useCallback, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import OperationDrawer from '@/components/business/OperationDrawer';
import { Group } from '@/components/widgets/group';
import * as ACTIONS from '@/store/actions/group/application/packages/list';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const mapStateToProps = (store: RootState) => ({
  componentDrawer: store.group.application.packages.list.componentDrawer,
  packageType: store.group.application.packages.list.selectPackage,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.resetComponentDrawerState,
  addComponent: ACTIONS.addComponentAction,
};
type DrawerProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;
const Drawer: React.FC<DrawerProp> = props => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { componentDrawer, packageType, closeDrawer, addComponent } = props;
  const { open, type, data } = componentDrawer;
  const [form] = Form.useForm();
  const initialValuesRef = useRef<any>({});
  useMemo(() => {
    let initialValues = {};
    if (type === 'edit') {
      initialValues = {
        name: data.name || '',
      };
    }
    initialValuesRef.current = initialValues;
  }, [type, data]);
  const afterVisibleChange = useCallback(visiable => {
    if (visiable) {
      form.setFieldsValue(initialValuesRef.current);
    } else {
      form.resetFields();
    }
  }, []);
  const onSave = () => {
    form
      .validateFields()
      .then(values => {
        const { name } = values;
        if (type === 'add') {
          addComponent(
            {
              applicationId,
              name,
              type: packageType,
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
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };
  return (
    <OperationDrawer
      open={open}
      title={type === 'edit' ? 'Edit Component' : 'Add Component'}
      onClose={closeDrawer}
      width={480}
      destroyOnClose
      actions={
        <Button type="primary" onClick={onSave}>
          Apply
        </Button>
      }
      afterVisibleChange={afterVisibleChange}
    >
      <Group>
        <Form {...formItemLayout} form={form}>
          <Form.Item
            name="name"
            label="Name"
            getValueFromEvent={e => e.target.value?.trim()}
            rules={[{ required: true }]}
          >
            <Input placeholder="Component name" />
          </Form.Item>
        </Form>
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
