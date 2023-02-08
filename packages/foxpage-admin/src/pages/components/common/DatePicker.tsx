// have to import this useless antd datepicker in order to add css file
import { DatePicker as AntDP } from 'antd';
import generatePicker from 'antd/es/date-picker/generatePicker';
import { Dayjs } from 'dayjs';
import dayjsGenerateConfig from 'rc-picker/es/generate/dayjs';

export const DatePicker = generatePicker<Dayjs>(dayjsGenerateConfig);
export const AntDatePicker = AntDP;
