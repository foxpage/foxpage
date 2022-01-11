import React, { useCallback } from 'react';

import { Radio } from 'antd';

import { ScopeEnum } from '@/constants/scope';

interface Type {
  scope: ScopeEnum;
  onScopeChange: (scope: ScopeEnum) => void;
}

const ScopeSelect: React.FC<Type> = props => {
  const { scope, onScopeChange } = props;

  const handleScopeChange = useCallback(e => {
    const value = e.target.value;
    onScopeChange(value);
  }, []);

  return (
    <Radio.Group
      size="small"
      options={[
        { label: 'Project', value: 'project' },
        { label: 'Application', value: 'application' },
      ]}
      optionType="button"
      value={scope}
      onChange={handleScopeChange}
    />
  );
};

export default ScopeSelect;
