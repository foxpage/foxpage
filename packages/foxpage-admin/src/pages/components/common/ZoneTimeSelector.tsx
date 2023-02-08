import React, { useState } from 'react';

import { Select } from 'antd';
import _ from 'lodash';

import { getAllTimeZone } from '@/utils/timezone';

import { DatePicker } from './DatePicker';

const TIME_ZONE_START_POS = 19;

function getTimeByZone(timezone, time) {
  let startTimeStr = time;
  startTimeStr =
    startTimeStr.substr(0, TIME_ZONE_START_POS) +
    timezone +
    startTimeStr.substr(TIME_ZONE_START_POS + 3, startTimeStr.length);
  return startTimeStr;
}

type IProps = {
  locale: string;
  onChange: (ISOString: string) => void;
};

export const ZoneTimeSelector = (props: IProps) => {
  const timezones = getAllTimeZone(props.locale);
  const [time, setTime] = useState(undefined);
  const [defaultTimezone, setDefaultTimezone] = useState(timezones[0] ? timezones[0].value : '');
  const { onChange } = props;

  const handleTimeChange = (value) => {
    const timeStr = value ? value.format() : '';
    setTime(timeStr);
    if (timeStr) {
      onChange(getTimeByZone(defaultTimezone, timeStr));
    } else {
      onChange('');
    }
  };

  const handleSelectTimezone = (value) => {
    setDefaultTimezone(value);
    onChange(time ? getTimeByZone(value, time) : null);
  };

  return (
    <div style={{ display: 'flex', padding: '6px 10px 0' }}>
      <Select
        showSearch
        value={defaultTimezone}
        style={{ width: 140, marginRight: 10, marginBottom: 8 }}
        onChange={handleSelectTimezone}
        optionLabelProp="label">
        {timezones.map((item) => (
          <Select.Option
            key={item.key}
            value={item.value}
            label={item.desc}
            title={`${item.desc}(${item.country})`}>
            {item.desc}({item.country})
          </Select.Option>
        ))}
      </Select>
      <DatePicker
        showTime
        format="YYYY-MM-DD hh:mm:ss"
        style={{ marginBottom: 8, flexGrow: 1 }}
        onChange={handleTimeChange}
      />
    </div>
  );
};

export default ZoneTimeSelector;
