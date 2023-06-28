import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { BarsOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Select, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import { openEditDrawer } from '@/actions/applications/detail/file/functions';
import * as ACTIONS from '@/actions/applications/detail/file/variables';
import { saveMock } from '@/actions/builder/header';
import { updateMock } from '@/actions/builder/main';
import { Field, Group, Label, OperationDrawer } from '@/components/index';
import { FileType, VariableTypes } from '@/constants/index';
import { JSONCodeEditor } from '@/pages/components/common';
import { GlobalContext } from '@/pages/system';
import { getFunctionRelationKey } from '@/sagas/builder/utils';
import { FuncContentEntity, FuncEntity, FunctionVariableProps, StaticVariableProps } from '@/types/index';
import { nameErrorCheck, objectEmptyCheck } from '@/utils/index';

import FunctionSelect from './FunctionSelect';
import VariableType from './VariableType';

const { Option } = Select;

const VARIABLE_FUNCTION_TYPE = 'data.function.call';

const mapStateToProps = (store: RootState) => ({
  mode: store.applications.detail.file.variables.drawerType,
  open: store.applications.detail.file.variables.drawerVisible,
  editVariable: store.applications.detail.file.variables.editVariable,
  pageInfo: store.applications.detail.file.variables.pageInfo,
  mock: store.builder.main.mock,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.openEditDrawer,
  fetchList: ACTIONS.fetchList,
  saveVariable: ACTIONS.saveVariable,
  update: ACTIONS.updateEditVariableValue,
  updateContent: ACTIONS.updateVariableContentValue,
  updateRelation: ACTIONS.updateVariableContentRelation,
  updateVariableContentProps: ACTIONS.updateVariableContentProps,
  updateVariableRelations: ACTIONS.updateVariableRelations,
  openFuncDrawer: openEditDrawer,
  saveMock: saveMock,
  updateMock: updateMock,
};

interface IProps {
  applicationId: string;
  folderId?: string;
  pageContentId?: string;
  search?: string;
}

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

// todo: disable submit button if error occur
const EditDrawer: React.FC<Type> = (props) => {
  const {
    applicationId,
    folderId,
    pageContentId,
    mock,
    mode,
    open,
    editVariable,
    pageInfo,
    search,
    closeDrawer,
    fetchList,
    openFuncDrawer,
    saveVariable,
    update,
    updateContent,
    updateRelation,
    updateVariableContentProps,
    updateVariableRelations,
    updateMock,
    saveMock,
  } = props;
  const [funcDrawerVisible, setFuncDrawerVisible] = useState<boolean>(false);
  const [func, setFunc] = useState<FuncContentEntity | undefined>(undefined);
  const [isEditType, setIsEditType] = useState<boolean>(false);
  const [mockProps, setMockProps] = useState<any>({});

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, function: functionI18n, variable } = locale.business;

  useEffect(() => {
    setFunc(undefined);

    const relation = editVariable?.content?.relation;
    const relations = editVariable?.relations;

    if (relation) {
      for (const key in relation) {
        if (relation[key].type === FileType.function) {
          const funcContent: any = relations?.functions?.find((item) => item.id === relation[key].id);

          if (funcContent) {
            setFunc(funcContent);
          }
        }
      }
    }
  }, [editVariable]);

  useEffect(() => {
    const schemas = mock?.schemas;
    if (!objectEmptyCheck(schemas)) {
      const _props = schemas.find((schema) => schema.id === editVariable?.contentId)?.props || {};

      setMockProps(_props);
    }
  }, [editVariable?.id, mock]);

  const handleVariableFunctionChange = (selectedFunc?: FuncEntity) => {
    if (!selectedFunc) {
      return;
    }

    const props: FunctionVariableProps = editVariable.content.schemas[0].props as FunctionVariableProps;
    const relationKey = `${getFunctionRelationKey(selectedFunc.contentId)}`;

    updateRelation('relation', {
      [relationKey]: {
        id: selectedFunc.contentId,
        type: 'function',
      },
    });

    updateVariableRelations({ functions: [{ ...selectedFunc.content, id: selectedFunc.contentId }] });

    updateContent('props', {
      function: `{{${relationKey}}}`,
      args: props.args,
    });
  };

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
      render: (_text: string, record: FuncContentEntity) => record.schemas[0].name,
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (_text: string, record: FuncContentEntity) =>
        record.schemas[0].props.async ? 'async' : 'sync',
    },
  ];

  const mockModeEnable = useMemo(() => {
    return mode === 'mock';
  }, [mode]);

  const title = useMemo(() => {
    if (mode === 'mock') {
      return variable.mock;
    } else {
      if (editVariable?.id) {
        return variable.edit;
      } else {
        return variable.add;
      }
    }
  }, [editVariable, mode, variable]);

  const type = useMemo(() => {
    const schemas = editVariable?.content?.schemas || [];
    if (schemas.length > 0) {
      return schemas[0]?.type;
    }
    return '';
  }, [editVariable]);

  const handleUpdateName = (name: string) => {
    if (!!folderId) {
      if (name.startsWith('_')) {
        update('name', name);
      } else {
        update('name', '');
      }
    } else {
      if (!name.startsWith('_')) {
        update('name', name);
      } else {
        update('name', '');
      }
    }
  };

  const handleUpdateContent = (key, value) => {
    // generate new mock structure
    if (mockModeEnable) {
      setMockProps(value);
    } else {
      if (type === VARIABLE_FUNCTION_TYPE) {
        updateVariableContentProps(key, value);
      } else {
        updateContent(key, value);
      }
    }
  };

  const handleSave = () => {
    if (mockModeEnable) {
      if (applicationId && folderId) {
        const schemas: Array<any> =
          mock?.schemas.filter((schema) => schema.id !== editVariable.contentId) || [];
        schemas.push({
          id: editVariable.contentId,
          name: editVariable?.name || '',
          props: mockProps,
          type: 'variable',
        });
        const _mock = {
          ...mock,
          schemas,
        };

        // push to store
        updateMock(_mock);

        // save to server
        saveMock(
          {
            applicationId,
            folderId,
            name: `mock_${editVariable.contentId}`,
            content: _mock,
          },
          () => {
            handleClose();
          },
        );
      }
    } else {
      if (nameErrorCheck(editVariable?.name)) {
        return;
      }

      saveVariable(
        {
          applicationId,
          folderId,
          pageContentId,
        },
        () => {
          handleClose();

          let params: any = {
            applicationId,
            page: pageInfo.page,
            size: pageInfo.size,
            search: search || '',
          };
          if (!!folderId)
            params = {
              ...params,
              folderId,
            };
          fetchList(params);
        },
      );
    }
  };

  const handleClose = () => {
    setFuncDrawerVisible(false);
    setFunc(undefined);
    setIsEditType(false);

    closeDrawer(false);
  };

  return (
    <OperationDrawer
      destroyOnClose
      width={480}
      open={open}
      title={title}
      onClose={handleClose}
      actions={
        <Button type="primary" onClick={handleSave}>
          {global.apply}
        </Button>
      }>
      {editVariable ? (
        <Group>
          <Field>
            <Label>
              {editVariable && !editVariable.id && !!folderId
                ? global.nameLabelWithUnderline
                : global.nameLabel}
            </Label>
            <Input
              value={mockModeEnable ? '' : editVariable?.name}
              disabled={!!editVariable.id}
              placeholder={
                editVariable && !editVariable.id && !!folderId
                  ? global.nameLabelWithUnderline
                  : global.nameLabel
              }
              onChange={(e) => handleUpdateName(e.target.value)}
            />
          </Field>
          <Field>
            <Label>{global.type}</Label>
            {isEditType ? (
              <VariableType>
                <Input
                  disabled={!!editVariable.id}
                  placeholder={global.type}
                  value={mockModeEnable ? '' : type}
                  onChange={(e) => {
                    updateContent('type', e.target.value);
                  }}
                />
                <Button
                  disabled={!!editVariable.id}
                  type="default"
                  icon={<BarsOutlined />}
                  onClick={() => {
                    setIsEditType(false);
                  }}
                  style={{ marginLeft: 4 }}
                />
              </VariableType>
            ) : (
              <VariableType>
                <Select
                  disabled={!!editVariable.id}
                  value={type}
                  onChange={(value) => {
                    updateContent('type', value);
                  }}>
                  {VariableTypes.map((type: string) => (
                    <Option value={type} key={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
                <Button
                  disabled={!!editVariable.id}
                  style={{ marginLeft: 4 }}
                  type="default"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setIsEditType(true);
                  }}
                />
              </VariableType>
            )}
          </Field>
          {type === VariableTypes[1] ? (
            <React.Fragment>
              <Field>
                <Label>{functionI18n.name}</Label>
                <Table
                  bordered
                  columns={columns}
                  dataSource={!mockModeEnable && func ? [func] : []}
                  pagination={false}
                  rowKey="id"
                  size="small"
                />
                <Button
                  type="dashed"
                  size="small"
                  style={{ width: '100%', marginTop: 12 }}
                  onClick={() => {
                    setFuncDrawerVisible(true);
                  }}>
                  {variable.selectFunction}
                </Button>
              </Field>
              <Field>
                <Label>{variable.args}</Label>
                <JSONCodeEditor
                  onChange={(json) => handleUpdateContent('args', json)}
                  value={
                    mockModeEnable
                      ? []
                      : (editVariable.content.schemas[0].props as FunctionVariableProps).args || []
                  }
                />
              </Field>
            </React.Fragment>
          ) : (
            <Field>
              <Label>{variable.value}</Label>
              <JSONCodeEditor
                onChange={(json) => handleUpdateContent('props', json)}
                value={
                  mockModeEnable
                    ? mockProps
                    : (editVariable.content.schemas?.[0]?.props as StaticVariableProps) || {}
                }
              />
            </Field>
          )}
          <FunctionSelect
            applicationId={applicationId}
            funcId={func?.id}
            folderId={folderId}
            pageContentId={pageContentId}
            visible={funcDrawerVisible}
            onChange={(selectedFunc?: FuncEntity) => {
              handleVariableFunctionChange(selectedFunc);
            }}
            onClose={() => setFuncDrawerVisible(false)}
            onFuncOpen={openFuncDrawer}
          />
        </Group>
      ) : (
        <div />
      )}
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EditDrawer);
