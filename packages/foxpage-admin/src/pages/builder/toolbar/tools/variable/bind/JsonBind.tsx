import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';

import JSONEditor, { JsonEditorRefType } from '@/components/business/JsonEditor';
import { VariableBindRefType } from '@/types/builder';

import BindContext from './BindContext';

const JsonBind: React.ForwardRefRenderFunction<VariableBindRefType> = (_props, forwardedRef) => {
  const editorRef = useRef<JsonEditorRefType>(null);

  const { value, setValue } = useContext(BindContext);

  const replaceProps = (_str: string) => {};

  useImperativeHandle(forwardedRef, () => ({
    replaceProps,
  }));

  return (
    <div style={{ height: '50%' }}>
      <JSONEditor
        ref={editorRef}
        jsonData={value || {}}
        onChangeJSON={data => {
          setValue(data);
        }}
      ></JSONEditor>
    </div>
  );
};

export default forwardRef(JsonBind);
