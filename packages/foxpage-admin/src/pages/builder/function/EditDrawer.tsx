import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { connect } from 'react-redux';

import { Button, Input, Select } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import OperationDrawer from '@/components/business/OperationDrawer';
import { Field, Group, Label } from '@/components/widgets/group';
import * as ACTIONS from '@/store/actions/builder/function';
import { OptionsAction } from '@/types/common';

import './codemirror.css';

require('codemirror/mode/htmlmixed/htmlmixed');

const DRAWER_NAME = {
  new: 'Add',
  edit: 'Edit',
  view: 'View',
};

const FN_TYPE = ['sync'];

const { Option } = Select;

const CodeBox = styled.div`
  min-height: 300px;
  & > .CodeMirror {
    height: 300px;
  }
`;

const mapStateToProps = (state: RootState) => ({
  func: state.builder.fn.selectFunc,
  visible: state.builder.fn.drawerVisible,
  drawerType: state.builder.fn.drawerType,
  applicationId: state.builder.page.applicationId,
  folderId: state.builder.page.folderId,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.updateFunctionDrawerVisible,
  saveFunction: ACTIONS.saveFunction,
  updateFunction: ACTIONS.updateFunction,
};

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OptionsAction;

function EditDrawer(props: IProps) {
  const { visible, drawerType, func, applicationId, folderId, closeDrawer, saveFunction, updateFunction, onSuccess } =
    props;
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [fnType, setFnType] = useState(0);

  // init drawer type
  const [type, setType] = useState('');
  useEffect(() => {
    setType(drawerType);
  }, [drawerType]);

  useEffect(() => {
    if (visible) {
      // get name & set default when edit
      const funcName = func?.name || undefined;
      if (funcName) setName(funcName);

      // get async type & set default when edit
      const { content } = func || {};
      const { schemas } = content || {};
      const type = schemas ? schemas[0]?.props?.async : undefined;
      if (typeof type !== 'undefined') setFnType(type ? 1 : 0);

      // get code & set default when edit

      const funcCode = schemas ? schemas[0]?.props?.code : undefined;
      if (funcCode) setCode(funcCode);
    }
  }, [visible, func]);

  // close drawer
  const handleDrawerClose = useCallback(() => {
    setType('');
    setName('');
    setCode('');
    setFnType(0);

    setTimeout(() => closeDrawer(false), 50);
  }, [closeDrawer]);

  const handleSaveSuccess = () => {
    handleDrawerClose();
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  };

  // apply
  const handleApplyClick = useCallback(() => {
    const newSchemas = [
      {
        name,
        type: 'javascript.function',
        props: {
          async: !!fnType,
          code,
        },
      },
    ];

    if (type === 'new') {
      if (applicationId && folderId) {
        saveFunction(
          {
            applicationId,
            folderId,
            name,
            content: {
              schemas: newSchemas,
              relation: {},
            },
          },
          handleSaveSuccess,
        );
      }
    } else {
      const id = func?.id || '';
      const contentId = func?.contentId || '';

      if (applicationId && id && contentId)
        updateFunction(
          {
            applicationId,
            id,
            name,
            content: {
              id: contentId,
              schemas: newSchemas,
              relation: {},
            },
            type: 'function',
          },
          handleSaveSuccess,
        );
    }
  }, [applicationId, folderId, func, type, name, code, fnType, saveFunction, updateFunction, handleDrawerClose]);

  const codeMirrorOptions = { lineNumbers: true, mode: { name: 'javascript', json: true }, lineWrapping: true };

  return (
    <OperationDrawer
      open={visible}
      title={DRAWER_NAME[type] || 'view'}
      onClose={handleDrawerClose}
      width={550}
      destroyOnClose
      actions={
        type !== 'view' ? (
          <Button type="primary" onClick={handleApplyClick}>
            Apply
          </Button>
        ) : (
          <></>
        )
      }
    >
      <Group>
        <Field>
          <Label>Name</Label>
          <Input
            placeholder="name must contain at least 5 characters"
            disabled={func.id}
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
        </Field>
        <Field>
          <Label>Type</Label>
          <Select placeholder="type" disabled={func.id} value={fnType} onChange={setFnType} style={{ width: 160 }}>
            {FN_TYPE.map((item, idx) => (
              <Option key={item} value={idx}>
                {item}
              </Option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>Function</Label>
          <CodeBox>
            <CodeMirror
              key={func.id}
              options={codeMirrorOptions}
              value={code}
              onBeforeChange={(_editor, _data, value) => {
                setCode(value);
              }}
            />
          </CodeBox>
        </Field>
      </Group>
    </OperationDrawer>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(EditDrawer);
