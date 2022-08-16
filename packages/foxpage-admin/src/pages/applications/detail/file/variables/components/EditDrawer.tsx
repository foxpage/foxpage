import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { BarsOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Select, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/variables';
import { Field, Group, JSONEditor, Label, OperationDrawer } from '@/components/index';
import { FileType, VariableTypes } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { getFunctionRelationKey } from '@/sagas/builder/utils';
import { FuncContentEntity, FuncEntity, FunctionVariableProps, StaticVariableProps } from '@/types/index';
import { nameErrorCheck } from '@/utils/name-check';

import FunctionSelect from './FunctionSelect';

const { Option } = Select;

const mapStateToProps = (store: RootState) => ({
  editorDrawerOpen: store.applications.detail.file.variables.drawerVisible,
  editVariable: store.applications.detail.file.variables.editVariable,
  pageInfo: store.applications.detail.file.variables.pageInfo,
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
};

interface IProps {
  applicationId: string;
  folderId?: string;
}

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const EditDrawer: React.FC<Type> = (props) => {
  const {
    applicationId,
    folderId,
    editorDrawerOpen,
    editVariable,
    pageInfo,
    closeDrawer,
    fetchList,
    saveVariable,
    update,
    updateContent,
    updateRelation,
    updateVariableContentProps,
    updateVariableRelations,
  } = props;
  const [funcDrawerVisible, setFuncDrawerVisible] = useState<boolean>(false);
  const [func, setFunc] = useState<FuncContentEntity | undefined>(undefined);
  const [isEditType, setIsEditType] = useState<boolean>(false);

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

    updateVariableRelations({ functions: [selectedFunc.content] });

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

  const handleSave = () => {
    if (nameErrorCheck(editVariable?.name)) {
      return;
    }

    saveVariable(
      {
        applicationId,
        folderId,
      },
      () => {
        handleClose();

        fetchList({
          applicationId,
          folderId,
          page: pageInfo.page,
          size: pageInfo.size,
        });
      },
    );
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
      open={editorDrawerOpen}
      title={editVariable && editVariable.id ? variable.edit : variable.add}
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
              value={editVariable?.name}
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
              <>
                <Input
                  disabled={!!editVariable.id}
                  placeholder={global.type}
                  value={type}
                  onChange={(e) => {
                    updateContent('type', e.target.value);
                  }}
                  style={{ width: 200 }}
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
              </>
            ) : (
              <>
                <Select
                  disabled={!!editVariable.id}
                  style={{ width: 200 }}
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
              </>
            )}
          </Field>
          {type === VariableTypes[1] ? (
            <React.Fragment>
              <Field>
                <Label>{functionI18n.name}</Label>
                <Table
                  columns={columns}
                  bordered
                  dataSource={func ? [func] : []}
                  pagination={false}
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
                <JSONEditor
                  jsonData={(editVariable.content.schemas[0].props as FunctionVariableProps).args || []}
                  onChangeJSON={(json) => {
                    updateVariableContentProps('args', json);
                  }}
                  onError={() => {
                    updateVariableContentProps('args', []);
                  }}
                />
              </Field>
            </React.Fragment>
          ) : (
            <Field>
              <Label>{variable.value}</Label>
              <JSONEditor
                refreshFlag={editVariable.id}
                jsonData={(editVariable.content.schemas?.[0]?.props as StaticVariableProps)?.value || {}}
                onChangeJSON={(json) => {
                  updateContent('props', {
                    value: json,
                    type: 'json',
                  });
                }}
                onError={() => {
                  updateContent('props', {
                    value: {},
                    type: 'json',
                  });
                }}
              />
            </Field>
          )}
          <FunctionSelect
            applicationId={applicationId}
            funcId={func?.id}
            folderId={folderId}
            visible={funcDrawerVisible}
            onChange={(selectedFunc?: FuncEntity) => {
              handleVariableFunctionChange(selectedFunc);
            }}
            onClose={() => setFuncDrawerVisible(false)}
          />
        </Group>
      ) : (
        <div />
      )}
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EditDrawer);
