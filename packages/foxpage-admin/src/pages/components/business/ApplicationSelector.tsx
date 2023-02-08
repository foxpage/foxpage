import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Select } from 'antd';

import { GlobalContext } from '@/pages/system';
import { Application } from '@/types/index';

const PAGE = 1;
const SIZE = 9999;

interface IProps {
  defaultApp?: string;
  list: Application[];
  onFetch?: (params) => void;
  onSelect: (applicationId) => void;
}

function ApplicationSelector(props: IProps) {
  const { defaultApp, list, onFetch, onSelect } = props;
  const [currApp, setCurrApp] = useState<string | undefined>(defaultApp || undefined);

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
  const { application } = locale.business;

  useEffect(() => {
    if (typeof onFetch === 'function' && organizationId) {
      onFetch({
        organizationId,
        page: PAGE,
        size: SIZE,
      });
    }
  }, [onFetch, organizationId]);

  const options = useMemo(
    () =>
      list.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    [list],
  );

  const handleChange = useCallback(
    (value) => {
      setCurrApp(value);

      if (typeof onSelect === 'function') onSelect(value);
    },
    [list, onSelect],
  );

  return (
    <Select
      allowClear
      showSearch
      optionFilterProp="label"
      dropdownMatchSelectWidth={false}
      options={options}
      placeholder={application.selectApplication}
      value={currApp}
      onChange={handleChange}
      style={{ width: 200 }}
    />
  );
}

export default ApplicationSelector;
