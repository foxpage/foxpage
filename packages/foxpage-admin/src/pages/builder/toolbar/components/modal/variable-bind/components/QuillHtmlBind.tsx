import React, { createRef, forwardRef, useContext, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';

import styled from 'styled-components';

import BindContext from './BindContext';

import 'react-quill/dist/quill.snow.css';

const EditorWrapper = styled.div`
  height: 100%;
  .quill {
    height: calc(100% - 80px);
  }
`;

const Editor: React.ForwardRefRenderFunction<{}> = (_props, forwardedRef) => {
  const { value, setValue } = useContext(BindContext);

  const modules = {
    toolbar: [
      [{ font: [] }, { size: [] }],
      [{ align: [] }, 'direction'],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'super' }, { script: 'sub' }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  const editorRef = createRef<ReactQuill>();

  const replaceProps = (str: string) => {
    if (editorRef.current) {
      const editor = editorRef.current.getEditor();
      const savedRange = (editor as any).selection.savedRange;
      editor.insertText(savedRange.index, str, 'api');
      setTimeout(() => {
        editor.setSelection(savedRange.index + str.length, 0, 'api');
        editor.focus();
      });
    }
  };

  useImperativeHandle(forwardedRef, () => ({
    replaceProps,
  }));

  const handleChange = (text: string) => {
    setValue(text);
  };

  return (
    <EditorWrapper>
      <ReactQuill
        ref={editorRef}
        theme="snow"
        value={value as any}
        onChange={handleChange}
        modules={modules}
      />
    </EditorWrapper>
  );
};

export default forwardRef(Editor);
