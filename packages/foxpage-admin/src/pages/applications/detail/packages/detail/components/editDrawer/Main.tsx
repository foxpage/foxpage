import React, { useCallback, useContext, useMemo, useRef } from 'react';
import { connect } from 'react-redux';

import { Button, Form, Input, message, Switch } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/detail';
import { getComponentsEditVersions } from '@/apis/application';
import { Group, OperationDrawer, Title } from '@/components/index';
import { StoreGoodsPurchaseType } from '@/constants/store';
import { GlobalContext } from '@/pages/system';
import { ComponentEditVersionEntity } from '@/types/application';

import { JSONEditorFormItem, PackageSelect, ResPathTreeSelect } from './components/index';

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  contentId: store.applications.detail.packages.detail.componentInfo?.id,
  open: store.applications.detail.packages.detail.versionDrawer?.open,
  type: store.applications.detail.packages.detail.versionDrawer?.type,
  data: store.applications.detail.packages.detail.versionDrawer?.data,
  packageType: store.applications.detail.packages.detail.componentInfo?.type,
  fileDetail: store.applications.detail.packages.detail.fileDetail,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.resetVersionDrawerState,
  addVersion: ACTIONS.addComponentVersionAction,
  editVersion: ACTIONS.editComponentVersionAction,
};

type ComponentDetailEditDrawerType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const VersionEditDrawer: React.FC<ComponentDetailEditDrawerType> = (props) => {
  const {
    applicationId,
    contentId,
    open,
    type,
    data,
    closeDrawer,
    addVersion,
    editVersion,
    fileDetail,
  } = props;

  const initialValuesRef = useRef<Promise<ComponentEditVersionEntity | undefined> | undefined>();
  const versionDetailRef = useRef<ComponentEditVersionEntity | undefined>();

  const isSystemComponent = fileDetail?.type === 'systemComponent';
  const isComponent = fileDetail?.type === 'component' || isSystemComponent;
  const isRefer = !!fileDetail?.tags?.find((item) => item.type === StoreGoodsPurchaseType.reference);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, version } = locale.business;

  const [form] = Form.useForm();

  useMemo(() => {
    if (type === 'add') {
      initialValuesRef.current = undefined;
    } else {
      const { versionId = '' } = data || {};
      if (applicationId && versionId) {
        initialValuesRef.current = getComponentsEditVersions({
          applicationId,
          id: versionId,
        }).then((rs) => {
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

  const disableState = useMemo(() => {
    return type === 'view';
  }, [type]);

  const afterVisibleChange = useCallback((visiable) => {
    if (visiable) {
      initialValuesRef.current?.then((data) => {
        if (data) {
          versionDetailRef.current = data;
          const { content, version } = data;
          const { meta = {}, schema, resource, useStyleEditor, enableChildren, changelog = '' } =
            content || {};
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
    if (isRefer) {
      return;
    }

    form
      .validateFields()
      .then((values) => {
        const params = transformFormToParams(values);
        if (type === 'add') {
          addVersion(
            {
              ...params,
              applicationId,
              contentId,
            } as any,
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
            } as any,
            {
              onSuccess: () => closeDrawer(),
            },
          );
        }
      })
      .catch((info) => {
        console.warn('Validate Failed:', info);
      });
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

  const transformFormToParams = (formValues) => {
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
      .map((item) => {
        if (item?.value) {
          return {
            id: item.value as string,
          };
        }
        return undefined;
      })
      .filter(Boolean) as { id: string }[];

    const dep = dependencies
      .map((item) => {
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

  if (!contentId) return null;

  return (
    <OperationDrawer
      destroyOnClose
      canExpend
      width={700}
      title={type === 'edit' ? version.edit : version.add}
      actions={
        <Button type="primary" onClick={onSave} disabled={isRefer}>
          {global.apply}
        </Button>
      }
      open={open}
      onClose={closeDrawer}
      afterVisibleChange={afterVisibleChange}>
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
            ]}>
            <Input placeholder="Version" disabled={disableState} style={{ width: '200px' }} />
          </Form.Item>
        </Group>
        {!isSystemComponent && (
          <Group>
            <Title>{version.source}</Title>
            <Form.Item name="browser" label="Browser" rules={[{ required: true }]}>
              <ResPathTreeSelect applicationId={applicationId || ''} disabled={disableState} />
            </Form.Item>
            {isComponent && applicationId && (
              <>
                <Form.Item name="node" label="Node">
                  <ResPathTreeSelect applicationId={applicationId} disabled={disableState} />
                </Form.Item>
                <Form.Item name="debug" label="Debug">
                  <ResPathTreeSelect applicationId={applicationId} disabled={disableState} />
                </Form.Item>
                <Form.Item name="css" label="Css">
                  <ResPathTreeSelect applicationId={applicationId} disabled={disableState} />
                </Form.Item>
              </>
            )}
          </Group>
        )}

        {isComponent && applicationId && (
          <Group>
            <Form.Item name="editor" label="Editor">
              <PackageSelect
                applicationId={applicationId}
                packageType="editor"
                ignoreContentIds={[contentId]}
                disabled={isRefer}
              />
            </Form.Item>
            <Form.Item name="useStyleEditor" label={version.useStyleEditor} valuePropName="checked">
              <Switch disabled={isRefer} />
            </Form.Item>
          </Group>
        )}

        {isComponent && applicationId && (
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
        )}

        <Group>
          <Title>{version.config}</Title>
          {isComponent && (
            <Form.Item name="enableChildren" label={version.enableChildren} valuePropName="checked">
              <Switch disabled={isRefer} />
            </Form.Item>
          )}

          <Form.Item name="meta" label="Meta">
            <JSONEditorFormItem disabled={isRefer} />
          </Form.Item>
          <Form.Item name="schema" label="Schema">
            <JSONEditorFormItem disabled={isRefer} />
          </Form.Item>
          <Form.Item name="changelog" label={version.changelog}>
            <Input.TextArea disabled={isRefer} />
          </Form.Item>
        </Group>
      </Form>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(VersionEditDrawer);
