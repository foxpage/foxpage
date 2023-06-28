import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Select, SelectProps, Spin, Tag } from 'antd';
import debounce from 'lodash/debounce';

import { getComponentSearchs } from '@/apis/application';
import { suffixTagColor } from '@/constants/file';
import { AppComponentFetchParams, AppPackageSearchItem } from '@/types/index';
import { getAbsoluteTypes } from '@/utils/parse-helper';

const { Option } = Select;

interface ValueType {
  label: string;
  value: string;
}

interface ComponentProps {
  applicationId: string;
  packageType: string;
  mode?: SelectProps<any>['mode'];
  disabled?: boolean;
  ignoreContentIds?: string[];
  placeholder?: string;
  value?: ValueType[] | ValueType;
  onChange?(value: { value: string; label: string }): void;
}

const PackageSelect: React.FC<ComponentProps> = ({
  applicationId,
  packageType,
  mode,
  disabled,
  ignoreContentIds,
  placeholder,
  value,
  onChange = () => {},
}) => {
  const [selectVal, setSelectVal] = useState<ValueType[] | ValueType | undefined>(value);
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<AppPackageSearchItem[]>([]);

  const fetchRef = useRef(0);

  useEffect(() => {
    if (value === selectVal) return;
    const valueType = getAbsoluteTypes(value);
    const selectValType = getAbsoluteTypes(selectVal);
    if (valueType === selectValType) {
      if (valueType === 'array') {
        if (
          (value as ValueType[])?.map?.((item) => item.value).join(',') ===
          (selectVal as ValueType[])?.map?.((item) => item.value).join(',')
        ) {
          return;
        }
      } else if (valueType === 'object') {
        if ((value as ValueType).value === (selectVal as ValueType).value) {
          return;
        }
      }
    }
    setSelectVal(value);
  }, [value]);

  const handleChange = useCallback(
    (val) => {
      setSelectVal(val);
      onChange(val);
    },
    [onChange],
  );

  const fetchOptions = useCallback(
    (search: string) => {
      return getComponentSearchs({
        applicationId,
        type: packageType as AppComponentFetchParams['type'],
        search,
      }).then((res) => {
        if (res.code !== 200) {
          return [];
        }
        return res.data || [];
      });
    },
    [applicationId, packageType],
  );

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((data) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        let newOptions: any = data;

        if (ignoreContentIds && ignoreContentIds.length > 0) {
          newOptions = data.filter(({ contentId }) => {
            return !ignoreContentIds.includes(contentId);
          });
        }

        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, 200);
  }, [fetchOptions]);

  return (
    <Select
      labelInValue
      showSearch
      allowClear
      mode={mode}
      disabled={disabled}
      style={{ width: '100%' }}
      optionLabelProp="label"
      filterOption={false}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      value={selectVal}
      dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
      placeholder={placeholder || 'Please select package'}
      onChange={handleChange}
      onSearch={debounceFetcher}>
      {options &&
        options.map((option) => (
          <Option value={option.contentId} label={option.name} key={option.contentId}>
            <Tag color={suffixTagColor[option.type]}>{option.type}</Tag> {option.name}
          </Option>
        ))}
    </Select>
  );
};

export default PackageSelect;
