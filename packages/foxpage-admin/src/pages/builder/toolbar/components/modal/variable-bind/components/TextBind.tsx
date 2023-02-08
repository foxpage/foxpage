import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';

import BindContext from './BindContext';

const TextBind: React.ForwardRefRenderFunction<any> = (_props, forwardedRef) => {
  const [selection, setSelection] = useState<any>({
    selectionStart: 0,
    selectionEnd: 0,
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { value, setValue } = useContext(BindContext);

  const textValue = String(value) || '';

  const replaceProps = (str: string) => {
    const { selectionStart, selectionEnd } = selection;

    setValue(textValue.substr(0, selectionStart) + str + textValue.substr(selectionEnd, textValue.length));

    textAreaRef.current?.focus();

    setTimeout(() => {
      const position = selectionStart + str.length - 2; // {{variableA:label}} cursor position = between "label" and "}}"
      textAreaRef.current?.setSelectionRange(position, position);
    });
  };

  useImperativeHandle(forwardedRef, () => ({
    replaceProps,
  }));

  return (
    <textarea
      value={textValue}
      ref={textAreaRef}
      autoFocus
      style={{
        resize: 'none',
        height: '100%',
        width: '100%',
        outline: 'none',
        border: '1px solid #1f38584d',
      }}
      onChange={(e) => {
        setValue(e.target.value);
      }}
      onBlur={() => {
        if (textAreaRef.current) {
          const { selectionStart, selectionEnd } = textAreaRef.current;
          setSelection({ selectionStart, selectionEnd });
        }
      }}
    />
  );
};

export default forwardRef(TextBind);
