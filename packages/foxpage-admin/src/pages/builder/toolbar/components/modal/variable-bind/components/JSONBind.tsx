import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';

import { JSONEditor } from '@/components/index';

import BindContext from './BindContext';

const JsonBind: React.ForwardRefRenderFunction<any> = (_props, forwardedRef) => {
  const editorRef = useRef<any>(null);

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
        onChangeJSON={(data) => {
          setValue(data);
        }}
      />
    </div>
  );
};

export default forwardRef(JsonBind);
