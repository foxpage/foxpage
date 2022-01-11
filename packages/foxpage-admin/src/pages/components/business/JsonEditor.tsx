import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import JSONEditor, { EditableNode, JSONEditorOptions } from 'jsoneditor';
import _ from 'lodash';
import styled from 'styled-components';

import 'jsoneditor/dist/jsoneditor.min.css';

const Root = styled.div`
  height: 100%;
  width: 100%;
  .jsoneditor {
    border: none;
    &.jsoneditor-mode-preview {
      border: 1px solid #d9d9d9;
      border-radius: 6px;
      padding: 4px;
      background: #f5f5f5;
      .jsoneditor-preview {
        color: rgba(0, 0, 0, 0.25);
      }
    }
    .jsoneditor-tree {
      overflow: hidden;
    }
    .jsoneditor-menu {
      background-color: #ebebeb;
      border-bottom: #c9c9c9;
      .jsoneditor-poweredBy {
        display: none;
      }
    }
  }
`;

interface JsonEditorProps {
  readOnly?: boolean;
  options?: JSONEditorOptions;
  jsonData: any;
  refreshFlag?: any;
  disabled?: boolean;
  onChangeJSON?: (data: any) => void;
  onError?: () => void;
}

export type JsonEditorRefType = {
  getText: () => string;
};

const JsonEditor: React.ForwardRefRenderFunction<JsonEditorRefType, JsonEditorProps> = (props, forwardedRef) => {
  const {
    options,
    jsonData,
    refreshFlag,
    disabled,
    readOnly,
    onChangeJSON = (_data: any) => {},
    onError = () => {},
  } = props;
  const container = useRef<HTMLDivElement>(null);
  const jsoneditor = useRef<any>(null);
  const defaultOptions: JSONEditorOptions = {
    mode: disabled ? 'preview' : 'code',
    // modes: ['text', 'code', 'view', 'tree', 'form', 'preview'],
    mainMenuBar: false,
    statusBar: false,
    history: false,
    sortObjectKeys: true,
    navigationBar: false,
    onChange: () => {
      if (jsoneditor.current) {
        try {
          onChangeJSON(jsoneditor.current.get());
        } catch (e) {
          onError();
        }
      }
    },
  };
  useEffect(() => {
    if (container.current) {
      const newOptions: JSONEditorOptions = _.assign({}, defaultOptions, options);
      if (readOnly) {
        newOptions.onEditable = node => !!(node as EditableNode).path;
      }
      jsoneditor.current = new JSONEditor(container.current, newOptions);
      jsoneditor.current.set(jsonData);
      if (newOptions.mode && ['tree', 'view', 'form'].indexOf(newOptions.mode) > -1) {
        jsoneditor.current.expandAll();
      }
    }
    return () => {
      jsoneditor.current.destroy();
    };
  }, [refreshFlag, disabled]);

  useImperativeHandle(forwardedRef, () => ({
    getText: jsoneditor.current?.getText,
  }));

  return <Root ref={container} />;
};

export default forwardRef(JsonEditor);
