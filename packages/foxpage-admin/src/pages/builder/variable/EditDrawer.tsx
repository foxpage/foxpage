import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { BarsOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Select, Table } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/variable';
import JsonEditor from '@/components/business/JsonEditor';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Field, Group, Label } from '@/components/widgets/group';
import { FileTypeEnum } from '@/constants/index';
import { FuncContentItem, FuncItem } from '@/types/application/function';
import { FunctionVariableProps, StaticVariableProps } from '@/types/application/variable.d';
import { getFunctionRelationKey } from '@/utils/relation';

import { VariableTypes } from '../../common/constant/VariableFile';

import FunctionSelect from './FunctionSelect';

const { Option } = Select;

interface IProps {
  applicationId: string;
  folderId?: string;
  onSave: () => void;
}

const mapStateToProps = (store: RootState) => ({
  editorDrawerOpen: store.builder.variable.editorDrawerOpen,
  editVariable: store.builder.variable.editVariable,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.updateVariableEditDrawerOpen,
  update: ACTIONS.updateEditVariableValue,
  updateContent: ACTIONS.updateVariableContentValue,
  updateRelation: ACTIONS.updateVariableContentRelation,
  updateVariableContentProps: ACTIONS.updateVariableContentProps,
  updateVariableRelations: ACTIONS.updateVariableRelations,
};

type Type = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;
const EditDrawer: React.FC<Type> = props => {
  const {
    folderId,
    applicationId,
    editorDrawerOpen,
    editVariable,
    closeDrawer,
    update,
    updateContent,
    updateRelation,
    updateVariableContentProps,
    updateVariableRelations,
    onSave,
  } = props;

  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [func, setFunc] = useState<FuncContentItem | undefined>(undefined);
  const [isEditType, setIsEditType] = useState<boolean>(false);

  useEffect(() => {
    setFunc(undefined);
    const relation = editVariable?.content?.relation;
    const relations = editVariable?.relations;
    if (relation) {
      for (const key in relation) {
        if (relation[key].type === FileTypeEnum.function) {
          const funcContent = relations?.functions?.find(item => item.id === relation[key].id);
          if (funcContent) {
            setFunc(funcContent as FuncContentItem);
          }
        }
      }
    }
  }, [editVariable]);

  const handleVariableFunctionChange = (selectedFunc?: FuncItem) => {
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
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (_text: string, record: FuncContentItem) => record.schemas[0].name,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (_text: string, record: FuncContentItem) => (record.schemas[0].props.async ? 'async' : 'sync'),
    },
  ];

  const type = useMemo(() => {
    const schemas = editVariable?.content?.schemas || [];
    if (schemas.length > 0) {
      return schemas[0]?.type;
    }
    return '';
  }, [editVariable]);

  return (
    <OperationDrawer
      open={editorDrawerOpen}
      title={editVariable && editVariable.id ? 'Edit' : 'Add'}
      onClose={() => {
        closeDrawer();
      }}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            onSave();
          }}
        >
          Apply
        </Button>
      }
    >
      {editVariable ? (
        <Group>
          <Field>
            <Label>Name</Label>
            <Input
              value={editVariable.name}
              disabled={!!editVariable.id}
              placeholder="variable name"
              onChange={e => update('name', e.target.value)}
            />
          </Field>
          <Field>
            <Label>Type</Label>
            {isEditType ? (
              <>
                <Input
                  disabled={!!editVariable.id}
                  style={{ width: 200 }}
                  placeholder="input type"
                  value={type}
                  onChange={e => {
                    updateContent('type', e.target.value);
                  }}
                />
                <Button
                  disabled={!!editVariable.id}
                  style={{ marginLeft: 4 }}
                  type="default"
                  icon={<BarsOutlined />}
                  onClick={() => {
                    setIsEditType(false);
                  }}
                />
              </>
            ) : (
              <>
                <Select
                  disabled={!!editVariable.id}
                  style={{ width: 200 }}
                  value={type}
                  onChange={value => {
                    updateContent('type', value);
                  }}
                >
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
                <Label>Function</Label>
                <Table columns={columns} bordered dataSource={func ? [func] : []} pagination={false} size="small" />
                <Button
                  type="dashed"
                  size="small"
                  style={{ width: '100%', marginTop: 12 }}
                  onClick={() => {
                    setDrawerVisible(true);
                  }}
                >
                  Select Function
                </Button>
              </Field>
              <Field>
                <Label>Args</Label>
                <JsonEditor
                  jsonData={(editVariable.content.schemas[0].props as FunctionVariableProps).args || []}
                  onChangeJSON={json => {
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
              <Label>Value</Label>
              <JsonEditor
                refreshFlag={editVariable.id}
                jsonData={(editVariable.content.schemas[0].props as StaticVariableProps)?.value || {}}
                onChangeJSON={json => {
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
            visible={drawerVisible}
            funcId={func?.id}
            folderId={folderId}
            applicationId={applicationId}
            onClose={() => setDrawerVisible(false)}
            onChange={(selectedFunc?: FuncItem) => {
              handleVariableFunctionChange(selectedFunc);
            }}
          />
        </Group>
      ) : (
        <div></div>
      )}
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EditDrawer);
