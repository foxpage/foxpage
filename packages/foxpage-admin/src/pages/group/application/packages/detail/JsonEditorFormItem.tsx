import React, { useCallback, useEffect, useRef, useState } from 'react';

import JSONEditor from '@/pages/components/business/JsonEditor';

interface JsonEditorFormItemProps {
  value?: string;
  disabled?: boolean;
  onChange?(value: string): void;
}

const JsonEditorFormItem: React.FC<JsonEditorFormItemProps> = ({ value = {}, disabled, onChange = () => {} }) => {
  const jsonStrRef = useRef<string>(value);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const onChangeJSON = useCallback(
    json => {
      jsonStrRef.current = json;
      onChange(jsonStrRef.current);
    },
    [onChange],
  );

  useEffect(() => {
    if (value !== jsonStrRef.current) {
      setRefreshFlag(true);
    }
  }, [value]);

  return (
    <JSONEditor jsonData={value} refreshFlag={refreshFlag} disabled={disabled} onChangeJSON={onChangeJSON}></JSONEditor>
  );
};

export default JsonEditorFormItem;
