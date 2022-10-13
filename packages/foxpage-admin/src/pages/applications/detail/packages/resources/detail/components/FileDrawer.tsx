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
  open: store.applications.detail.resources.detail.fileDrawer.open,
  type: store.applications.detail.resources.detail.fileDrawer.type,
  data: store.applications.detail.resources.detail.fileDrawer.data,
  curFolderId: store.applications.detail.resources.detail.resourceRootInfo?.id,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.resetResourcesDetailFileDrawerState,
  addFile: ACTIONS.addFile,
  updateFile: ACTIONS.updateFile,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const FileDrawer: React.FC<ComponentsProps> = (props) => {
  const { applicationId, open, type, curFolderId, data = {}, closeDrawer, addFile, updateFile } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;
  const title = type && file[type];

  const initialValuesRef = useRef<any>({});

  const [form] = Form.useForm();

  useMemo(() => {
    let initialValues = {};
    if (type === 'edit') {
      initialValues = {
        filepath: data.filepath || '',
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
        const { filepath } = values;
        if (type === 'add') {
          addFile(
            {
              applicationId,
              curFolderId,
              filepath,
            },
            {
              onSuccess: () => {
                closeDrawer();
                form.resetFields();
              },
            },
          );
        } else if (type === 'edit') {
          updateFile(
            {
              applicationId,
              fileId: data?.id,
              filepath,
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
      title={title}
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
          <Form.Item name="filepath" label={file.filePath} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(FileDrawer);
