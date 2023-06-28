import React from 'react';

import { DiffEditor, DiffEditorProps } from '@monaco-editor/react';

const InnerDiffEditor: React.FC<DiffEditorProps> = (props) => {
  return <DiffEditor {...props} />;
};

export default InnerDiffEditor;
