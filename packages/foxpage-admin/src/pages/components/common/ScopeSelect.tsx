import React, { useCallback, useContext } from 'react';

import { Radio } from 'antd';

import { ScopeEnum } from '@/constants/scope';
import GlobalContext from '@/pages/GlobalContext';

interface Type {
  scope: ScopeEnum;
  onScopeChange: (scope: ScopeEnum) => void;
}

const ScopeSelect: React.FC<Type> = props => {
  const { scope, onScopeChange } = props;
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;
  const handleScopeChange = useCallback(e => {
    const value = e.target.value;
    onScopeChange(value);
  }, []);

  return (
    <Radio.Group
      size="small"
      options={[
        { label: global.project, value: 'project' },
        { label: global.application, value: 'application' },
      ]}
      optionType="button"
      value={scope}
      onChange={handleScopeChange}
    />
  );
};

export default ScopeSelect;
