import React, { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import { connect } from 'react-redux';

import { Button, Input, Select } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/functions';
import { Field, Group, Label, OperationDrawer } from '@/components/index';
import { GlobalContext } from '@/pages/system';

import './style.css';

require('codemirror/mode/htmlmixed/htmlmixed');

const FN_TYPE = ['sync'];

const { Option } = Select;

const CodeBox = styled.div`
  min-height: 300px;
  & > .CodeMirror {
    height: 300px;
  }
`;

const mapStateToProps = (store: RootState) => ({
  pageInfo: store.applications.detail.file.functions.pageInfo,
  type: store.applications.detail.file.functions.drawerType,
  visible: store.applications.detail.file.functions.drawerVisible,
  func: store.applications.detail.file.functions.editFunc,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.openEditDrawer,
  fetchList: ACTIONS.fetchList,
  saveFunction: ACTIONS.saveFunction,
};

type FunctionEditDrawerType = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    applicationId: string;
    folderId?: string;
  };

function EditDrawer(props: FunctionEditDrawerType) {
  const {
    applicationId,
    folderId,
    pageInfo,
    type,
    visible,
    func,
    closeDrawer,
    fetchList,
    saveFunction,
  } = props;
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [fnType, setFnType] = useState(0);

  const viewMode = !!type && type === 'view';

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, function: functionI18n } = locale.business;

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

  const handleClose = useCallback(() => {
    setName('');
    setCode('');
    setFnType(0);

    setTimeout(() => closeDrawer(false), 50);
  }, [closeDrawer]);

  const handleApply = useCallback(() => {
    const id = func?.id || '';
    const contentId = func?.contentId || '';
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

    if (applicationId) {
      saveFunction(
        {
          applicationId,
          folderId,
          id,
          name,
          content: {
            id: contentId,
            schemas: newSchemas,
            relation: {},
          },
          type: 'function',
        },
        () => {
          handleClose();

          fetchList({ applicationId, folderId, page: pageInfo.page, size: pageInfo.size });
        },
      );
    }
  }, [applicationId, name, code, fnType, saveFunction, handleClose]);

  const codeMirrorOptions = {
    lineNumbers: true,
    mode: { name: 'javascript', json: true },
    lineWrapping: true,
    readOnly: viewMode,
  };

  return (
    <OperationDrawer
      destroyOnClose
      width={550}
      open={visible}
      title={func?.id ? global.edit : global.add}
      actions={
        <Button type="primary" disabled={viewMode} onClick={handleApply}>
          {global.apply}
        </Button>
      }
      onClose={handleClose}>
      <Group>
        <Field>
          <Label>{global.nameLabel}</Label>
          <Input
            disabled={func.id || viewMode}
            placeholder="name must contain at least 5 characters"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
        </Field>
        <Field>
          <Label>{global.type}</Label>
          <Select
            disabled={func.id || viewMode}
            placeholder="type"
            value={fnType}
            onChange={setFnType}
            style={{ width: 160 }}>
            {FN_TYPE.map((item, idx) => (
              <Option key={item} value={idx}>
                {item}
              </Option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>{functionI18n.name}</Label>
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
