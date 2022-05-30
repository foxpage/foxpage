import React, { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react';
import { Editor as DraftEditor } from 'react-draft-wysiwyg';

import { ContentState, convertToRaw, EditorState, Modifier } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

import { VariableBindRefType } from '@/types/builder';

import BindContext from './BindContext';

const JsonBind: React.ForwardRefRenderFunction<VariableBindRefType> = (_props, forwardedRef) => {
  const { value, setValue } = useContext(BindContext);
  const editorRef = useRef<any>(null);
  const contentBlock = htmlToDraft(value || '');
  const initContentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
  const [editorState, setEditorState] = useState(EditorState.createWithContent(initContentState));

  const replaceProps = (str: string) => {
    const contentState = editorState.getCurrentContent();
    const targetRange = editorState.getSelection();
    const newContentState = Modifier.insertText(contentState, targetRange, str);
    const newEditorState = EditorState.push(editorState, newContentState, 'insert-characters');
    setEditorState(newEditorState);
    saveValue(newEditorState);
    setTimeout(() => {
      editorRef.current?.editor.focus();
    });
  };

  useImperativeHandle(forwardedRef, () => ({
    replaceProps,
  }));

  const handleStateChange = editorState => {
    setEditorState(editorState);
    saveValue(editorState);
  };

  const saveValue = editorState => {
    setValue(draftToHtml(convertToRaw(editorState.getCurrentContent())));
  };

  return (
    <div style={{ height: '70%' }}>
      <DraftEditor
        ref={editorRef}
        placeholder="Enter some text..."
        toolbar={{
          ...toolbar,
          inline: { inDropdown: true },
          list: { inDropdown: true },
          textAlign: { inDropdown: true },
          link: { inDropdown: true },
          history: { inDropdown: true },
        }}
        editorState={editorState}
        onEditorStateChange={handleStateChange}
      />
    </div>
  );
};

export default forwardRef(JsonBind);
