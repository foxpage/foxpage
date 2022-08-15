import React, { useCallback, useContext, useMemo } from 'react';

import { Radio } from 'antd';

import { ScopeEnum } from '@/constants/scope';
import { GlobalContext } from '@/pages/system';

interface Type {
  scope: ScopeEnum;
  type?: string;
  onScopeChange: (scope: ScopeEnum) => void;
}

const ScopeSelect: React.FC<Type> = (props) => {
  const { scope, type, onScopeChange } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  const options = useMemo(() => {
    const options = {
      application: [{ label: global.application, value: 'application' }],
      project: [
        { label: global.project, value: 'project' },
        { label: global.application, value: 'application' },
      ],
    };

    return options[type || 'project'];
  }, [type]);

  const handleScopeChange = useCallback((e) => {
    const value = e.target.value;
    onScopeChange(value);
  }, []);

  return (
    <Radio.Group
      size="small"
      options={options}
      optionType="button"
      value={scope}
      onChange={handleScopeChange}
    />
  );
};

export default ScopeSelect;
