import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { connect } from 'react-redux';

import { Button, Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/resources/detail';
import { Group, OperationDrawer } from '@/components/index';
import { GlobalContext } from '@/pages/system';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  open: store.applications.detail.resources.detail.folderDrawer.open,
  type: store.applications.detail.resources.detail.folderDrawer.type,
  data: store.applications.detail.resources.detail.folderDrawer.data,
  curFolderId: store.applications.detail.resources.detail.resourceRootInfo?.id,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.resetResourcesDetailFolderDrawerState,
  addFolder: ACTIONS.addFolder,
  updateFolder: ACTIONS.updateFolder,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Drawer: React.FC<ComponentsProps> = (props) => {
  const { applicationId, open, type, data, curFolderId, closeDrawer, addFolder, updateFolder } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, folder } = locale.business;

  const initialValuesRef = useRef<any>({});

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
      .catch((info) => {
        console.error('Validate Failed:', info);
      });
  };

  const onClose = () => {
    closeDrawer();
  };

  return (
    <OperationDrawer
      open={open}
      title={folder.add}
      onClose={onClose}
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
          <Form.Item name="name" label={folder.nameLabel} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Drawer);
