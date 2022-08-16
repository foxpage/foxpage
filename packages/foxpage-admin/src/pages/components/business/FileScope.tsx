import React, { useContext, useEffect, useState } from 'react';

import { Radio, RadioChangeEvent } from 'antd';

import { GlobalContext } from '@/pages/system';
import { FileScope } from '@/types/index';

const options = [
  { label: 'application', value: 'application', disabled: false },
  { label: 'project', value: 'project', disabled: false },
];

interface IProps {
  scope?: FileScope;
  onChange?: (scope: FileScope) => void;
  disabled?: string[];
}

const FileScopeSelector = (props: IProps) => {
  const [scope, setScope] = useState<FileScope>(props.scope || 'application');
  const { locale } = useContext(GlobalContext);
  const { global = {} } = locale.business;
  const { disabled = [], onChange } = props;

  useEffect(() => {
    setScope(props.scope || 'application');
  }, [props.scope]);

  const handleChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    setScope(value);
    if (typeof onChange === 'function') {
      onChange(value);
    }
  };

  const showOptions: { label: string; value: string; disabled: boolean }[] = [];
  options.forEach((item) => {
    showOptions.push({
      label: global[item.label],
      value: item.value,
      disabled: disabled.findIndex((ditem) => ditem === item.label) > -1,
    });
  });

  return <Radio.Group options={showOptions} onChange={handleChange} value={scope} optionType="button" />;
};

export default FileScopeSelector;
