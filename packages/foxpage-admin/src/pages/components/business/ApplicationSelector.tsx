import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Select } from 'antd';

import { GlobalContext } from '@/pages/system';
import { Application } from '@/types/index';

const PAGE = 1;
const SIZE = 9999;

interface IProps {
  organizationId?: string;
  list: Application[];
  onFetch?: (params) => void;
  onSelect: (applicationId) => void;
}

function ApplicationSelector(props: IProps) {
  const { list, organizationId, onFetch, onSelect } = props;
  const [currApp, setCurrApp] = useState<string | undefined>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { application } = locale.business;

  useEffect(() => {
    if (typeof onFetch === 'function' && organizationId)
      onFetch({
        organizationId,
        page: PAGE,
        size: SIZE,
      });
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
