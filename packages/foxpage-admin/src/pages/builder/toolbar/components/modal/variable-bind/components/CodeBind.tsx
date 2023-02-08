import React, { forwardRef, useContext, useImperativeHandle, useRef } from 'react';

import stringify from 'json-stable-stringify';

import { CodeEditor } from '@/pages/components';

import BindContext from './BindContext';

interface CodeBindProps {
  language?: 'javascript' | 'html' | 'css' | 'json';
}

const CodeBind: React.ForwardRefRenderFunction<{}, CodeBindProps> = (_props, forwardedRef) => {
  const { language = 'html' } = _props;

  const { value, setValue } = useContext(BindContext);
  const editorRef = useRef<any>();
  const onMount = (editor) => {
    editorRef.current = editor;
  };

  const replaceProps = (insertText: string) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      editorRef.current.executeEdits('insert-code', [
        {
          range: {
            startLineNumber: selection.startLineNumber,
            startColumn: selection.startColumn,
            endLineNumber: selection.endLineNumber,
            endColumn: selection.endColumn,
          },
          text: insertText,
        },
      ]);
      editorRef.current.setPosition({
        lineNumber: selection.startLineNumber,
        column: selection.startColumn + insertText.length,
      });
      editorRef.current.focus();
    }
  };

  const formatEditorValue = (val) => {
    if (language === 'json') {
      return String(val).trim() === '' ? '{}' : stringify(val);
    }
    return val;
  };

  const parseValue = (val) => {
    if (language === 'json') {
      return String(val).trim() === '' ? {} : JSON.parse(val);
    }
    return val;
  };

  const handleEditorChange = (val) => {
    try {
      const parsed = parseValue(val);
      setValue(parsed);
    } catch {
      // catch content error
    }
  };

  const checker = () => {
    try {
      const content = editorRef.current.getValue();
      parseValue(content);
      return [null];
    } catch (err) {
      return [err];
    }
  };

  useImperativeHandle(forwardedRef, () => ({
    replaceProps,
    checker,
  }));

  return (
    <CodeEditor
      onMount={onMount}
      onChange={handleEditorChange}
      language={language}
      height="100%"
      // @ts-ignore
      value={formatEditorValue(value)}
    />
  );
};

export default forwardRef(CodeBind);
