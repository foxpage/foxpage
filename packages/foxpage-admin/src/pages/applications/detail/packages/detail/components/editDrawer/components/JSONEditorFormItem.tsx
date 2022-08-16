import React, { useCallback, useEffect, useRef, useState } from 'react';

import { JSONEditor } from '@/components/index';

interface JsonEditorFormItemProps {
  value?: string;
  disabled?: boolean;
  onChange?(value: string): void;
}

const JsonEditorFormItem: React.FC<JsonEditorFormItemProps> = ({
  value = {},
  disabled,
  onChange = () => {},
}) => {
  const [refreshFlag, setRefreshFlag] = useState(false);
  const jsonStrRef = useRef<string>(value as string);

  const onChangeJSON = useCallback(
    (json) => {
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
    <JSONEditor jsonData={value} refreshFlag={refreshFlag} disabled={disabled} onChangeJSON={onChangeJSON} />
  );
};

export default JsonEditorFormItem;
