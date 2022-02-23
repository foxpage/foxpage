import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Button, Form, Input, message, Switch } from 'antd';
import { RootState } from 'typesafe-actions';

import { getComponentsEditVersions } from '@/apis/group/application/packages';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Group, Title } from '@/components/widgets/group';
import GlobalContext from '@/pages/GlobalContext';
import * as ACTIONS from '@/store/actions/group/application/packages/detail';
import { AppComponentEditVersionType } from '@/types/application';

import JsonEditorFormItem from './JsonEditorFormItem';
import PackageSelect from './PackageSelect';
import ResPathTreeSelect from './ResPathTreeSelect';

const mapStateToProps = (store: RootState) => ({
  contentId: store.group.application.packages.detail.componentInfo?.id,
  open: store.group.application.packages.detail.versionDrawer?.open,
  type: store.group.application.packages.detail.versionDrawer?.type,
  packageType: store.group.application.packages.detail.componentInfo?.type,
  data: store.group.application.packages.detail.versionDrawer?.data,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.resetVersionDrawerState,
  addVersion: ACTIONS.addComponentVersionAction,
  editVersion: ACTIONS.editComponentVersionAction,
};

type VersionEditDrawerProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const VersionEditDrawer: React.FC<VersionEditDrawerProps> = ({
  contentId,
  open = false,
  type = 'add',
  data,
  closeDrawer,
  addVersion,
  editVersion,
}) => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const initialValuesRef = useRef<Promise<AppComponentEditVersionType | undefined> | undefined>();
  const versionDetailRef = useRef<AppComponentEditVersionType | undefined>();
  const [form] = Form.useForm();
  const { locale } = useContext(GlobalContext);
  const { global, version } = locale.business;
  const disableState = useMemo(() => {
    return type === 'view';
  }, [type]);
  useMemo(() => {
    if (type === 'add') {
      initialValuesRef.current = undefined;
    } else {
      const { versionId = '' } = data || {};
      if (versionId) {
        initialValuesRef.current = getComponentsEditVersions({
          applicationId,
          id: versionId,
        }).then(rs => {
          const { code, msg, data } = rs;
          if (code !== 200) {
            message.error(msg);
            return;
          } else {
            return data;
          }
        });
      }
    }
  }, [type, data]);
  const afterVisibleChange = useCallback(visiable => {
    if (visiable) {
      initialValuesRef.current?.then(data => {
        if (data) {
          versionDetailRef.current = data;
          const { content, version } = data;
          const { meta = {}, schema, resource, useStyleEditor, enableChildren, changelog = '' } = content || {};
          const { entry, 'editor-entry': editorEntry, dependencies = [] } = resource || {};
          const { browser, node, debug, css } = entry || {};
          const initForm = {
            version,
            meta,
            schema,
            browser: parseValueForTreeSelect(browser),
            node: parseValueForTreeSelect(node),
            debug: parseValueForTreeSelect(debug),
            css: parseValueForTreeSelect(css),
            editor: transformPackageToFormData(editorEntry?.[0]),
            dependencies: dependencies.map(transformPackageToFormData).filter(Boolean),
            useStyleEditor,
            enableChildren,
            changelog,
          };
          form.setFieldsValue(initForm);
        }
      });
    } else {
      initialValuesRef.current = undefined;
      form.resetFields();
    }
  }, []);

  const onSave = () => {
    form
      .validateFields()
      .then(values => {
        const params = transformFormToParams(values);
        if (type === 'add') {
          addVersion(
            {
              ...params,
              applicationId,
              contentId,
            },
            {
              onSuccess: () => closeDrawer(),
            },
          );
        } else {
          const { versionId = '' } = data || {};
          editVersion(
            {
              ...params,
              applicationId,
              id: versionId,
            },
            {
              onSuccess: () => closeDrawer(),
            },
          );
        }
      })
      .catch(info => {
        console.warn('Validate Failed:', info);
      });
  };
  if (!contentId) return null;
  return (
    <OperationDrawer
      open={open}
      title={type === 'edit' ? version.edit : version.add}
      onClose={closeDrawer}
      width={700}
      destroyOnClose
      canExpend
      actions={
        <Button type="primary" onClick={onSave}>
          {global.apply}
        </Button>
      }
      afterVisibleChange={afterVisibleChange}
    >
      <Form layout="vertical" form={form}>
        <Group>
          <Form.Item
            name="version"
            label={<Title>{version.name}</Title>}
            required
            rules={[
              {
                required: true,
                validator: (_rule, value = '') => {
                  const arr = value.split('.');
                  if (
                    arr.length !== 3 ||
                    arr.find((item: string) => {
                      return !item || item !== String(Number(item));
                    }) !== undefined
                  ) {
                    return Promise.reject(version.versionError);
                  }
                  return Promise.resolve('');
                },
              },
            ]}
          >
            <Input placeholder="Version" disabled={disableState} style={{ width: '200px' }} />
          </Form.Item>
        </Group>
        <Group>
          <Title>{version.source}</Title>
          <Form.Item name="browser" label="Browser" rules={[{ required: true }]}>
            <ResPathTreeSelect applicationId={applicationId} disabled={disableState} />
          </Form.Item>
          <Form.Item name="node" label="Node">
            <ResPathTreeSelect applicationId={applicationId} disabled={disableState} />
          </Form.Item>
          <Form.Item name="debug" label="Debug">
            <ResPathTreeSelect applicationId={applicationId} disabled={disableState} />
          </Form.Item>
          <Form.Item name="css" label="Css">
            <ResPathTreeSelect applicationId={applicationId} disabled={disableState} />
          </Form.Item>
        </Group>
        <Group>
          <Form.Item name="editor" label="Editor">
            <PackageSelect applicationId={applicationId} packageType="editor" ignoreContentIds={[contentId]} />
          </Form.Item>
          <Form.Item name="useStyleEditor" label={version.useStyleEditor} valuePropName="checked">
            <Switch />
          </Form.Item>
        </Group>
        <Group>
          <Title>{version.dependency}</Title>
          <Form.Item name="dependencies" label="">
            <PackageSelect
              applicationId={applicationId}
              packageType="component,library"
              mode="multiple"
              disabled={disableState}
              ignoreContentIds={[contentId]}
            />
          </Form.Item>
        </Group>
        <Group>
          <Title>{version.config}</Title>
          <Form.Item name="enableChildren" label={version.enableChildren} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="meta" label="Meta">
            <JsonEditorFormItem />
          </Form.Item>
          <Form.Item name="schema" label="Schema">
            <JsonEditorFormItem />
          </Form.Item>
          <Form.Item name="changelog" label={version.changelog}>
            <Input.TextArea />
          </Form.Item>
        </Group>
      </Form>
    </OperationDrawer>
  );
};

const parseValueForTreeSelect = (data?: { contentId: string; path: string }) => {
  const { contentId, path } = data || {};
  if (!data || !contentId || !path) {
    return undefined;
  }
  return {
    value: contentId,
    label: path,
    path,
  };
};
const transformFormToParams = formValues => {
  const {
    version,
    browser,
    node,
    debug,
    css,
    editor,
    dependencies = [],
    useStyleEditor,
    enableChildren,
    meta = {},
    schema = {},
    changelog = '',
  } = formValues || {};
  const editorEntry = [editor]
    .map(item => {
      if (item?.value) {
        return {
          id: item.value as string,
        };
      }
      return undefined;
    })
    .filter(Boolean) as { id: string }[];
  const dep = dependencies
    .map(item => {
      if (item?.value) {
        return {
          id: item.value as string,
        };
      }
      return undefined;
    })
    .filter(Boolean) as { id: string }[];
  return {
    version,
    content: {
      resource: {
        entry: {
          browser: browser?.value || '',
          node: node?.value || '',
          debug: debug?.value || '',
          css: css?.value || '',
        },
        'editor-entry': editorEntry,
        dependencies: dep,
      },
      meta,
      schema,
      useStyleEditor,
      enableChildren,
      changelog,
    },
  };
};

const transformPackageToFormData = (pkg: { id: string; name: string }) => {
  const { id, name } = pkg || {};
  if (id && name) {
    return {
      value: id,
      label: name,
    };
  }
  return undefined;
};

export default connect(mapStateToProps, mapDispatchToProps)(VersionEditDrawer);
