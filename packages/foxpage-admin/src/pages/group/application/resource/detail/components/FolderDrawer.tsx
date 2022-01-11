import React, { useCallback, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/application/resource/detail';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Group } from '@/components/widgets/group';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const mapStateToProps = (store: RootState) => ({
  open: store.group.application.resource.detail.folderDrawer.open,
  type: store.group.application.resource.detail.folderDrawer.type,
  data: store.group.application.resource.detail.folderDrawer.data,
  curFolderId: store.group.application.resource.detail.resourceRootInfo?.id,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.resetResourcesDetailFolderDrawerState,
  addFolder: ACTIONS.addFolderAction,
  updateFolder: ACTIONS.updateFolderAction,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Drawer: React.FC<ComponentsProps> = props => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { open, type, data, curFolderId, closeDrawer, addFolder, updateFolder } = props;
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
          addFolder(
            {
              applicationId,
              curFolderId,
              name,
            },
            {
              onSuccess: () => {
                closeDrawer();
                form.resetFields();
              },
            },
          );
        } else if (type === 'edit') {
          updateFolder(
            {
              applicationId,
              folderId: data?.id,
              name,
            },
            {
              onSuccess: () => {
                closeDrawer();
                form.resetFields();
              },
            },
          );
        }
      })
      .catch(info => {
        console.error('Validate Failed:', info);
      });
  };
  const onClose = () => {
    closeDrawer();
  };
  return (
    <OperationDrawer
      open={open}
      title={'Add Folder'}
      onClose={onClose}
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
          <Form.Item name="name" label="Folder Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
