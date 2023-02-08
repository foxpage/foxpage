import React from 'react';

import { JSONCodeEditor } from '@/pages/components/common';

interface JsonEditorFormItemProps {
  value?: Record<string, any>;
  disabled?: boolean;
  onChange?(value: Record<string, any>): void;
}

// actually it is a fake form item, do not use it as item in ant design form

const JsonEditorFormItem: React.FC<JsonEditorFormItemProps> = ({
  value = {},
  disabled,
  onChange = () => {},
}) => {
  return <JSONCodeEditor value={value} readOnly={disabled} onChange={onChange} height={150} />;
};

export default JsonEditorFormItem;
