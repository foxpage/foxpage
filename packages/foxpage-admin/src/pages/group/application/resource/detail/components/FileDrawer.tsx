import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, Form, Input } from 'antd';
import { RootState } from 'typesafe-actions';

import OperationDrawer from '@/components/business/OperationDrawer';
import { Group } from '@/components/widgets/group';
import GlobalContext from '@/pages/GlobalContext';
import * as ACTIONS from '@/store/actions/group/application/resource/detail';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const mapStateToProps = (store: RootState) => ({
  open: store.group.application.resource.detail.fileDrawer.open,
  type: store.group.application.resource.detail.fileDrawer.type,
  data: store.group.application.resource.detail.fileDrawer.data,
  curFolderId: store.group.application.resource.detail.resourceRootInfo?.id,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.resetResourcesDetailFileDrawerState,
  addFile: ACTIONS.addFileAction,
  updateFile: ACTIONS.updateFileAction,
};

type ComponentsProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const FileDrawer: React.FC<ComponentsProps> = props => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const { open, type, curFolderId, data = {}, closeDrawer, addFile, updateFile } = props;
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;
  const title = file[type];
  const [form] = Form.useForm();
  const initialValuesRef = useRef<any>({});
  useMemo(() => {
    let initialValues = {};
    if (type === 'edit') {
      initialValues = {
        filepath: data.filepath || '',
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
      title={title}
      onClose={onClose}
      width={480}
      destroyOnClose
      actions={
        <Button type="primary" onClick={onSave}>
          {global.apply}
        </Button>
      }
      afterVisibleChange={afterVisibleChange}
    >
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
