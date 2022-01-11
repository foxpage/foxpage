import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { DatePicker, Select, Switch } from 'antd';
import moment from 'moment';
import { RootState } from 'typesafe-actions';

import { saveCondition, searchLocalTimeVariable, updateConditionVersion } from '@/actions/builder/condition';
import { updateComponentCondition } from '@/actions/builder/template';
import { Field, Group, Label, Title } from '@/components/widgets/group';
import { eqRelations, gtQqRelations, ltEqRelations } from '@/configs/condition';
import { FileTypeEnum } from '@/constants/global';
import { LOCAL_TIME_VARIABLE_KEY, LOCAL_TIME_VARIABLE_NAME } from '@/constants/variable';
import {
  ConditionContentItem,
  ConditionContentSchemaChildrenItem,
  ConditionItem,
  ConditionNewParams,
} from '@/types/application/condition';
import { getSystemVariableRelationKey, isTimeConditionRelation } from '@/utils/relation';
import shortId from '@/utils/short-id';

import { getAllTimeZone, getTimeByZone } from './utils/timezone';
import ConditionList from './ConditionList';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD hh:mm:ss';
const conditionExpression = 'condition.expression';
const timeConditionRelationKey = `${getSystemVariableRelationKey(
  `${LOCAL_TIME_VARIABLE_NAME}:${LOCAL_TIME_VARIABLE_KEY}`,
)}`;
const timeConditionsKey = `{{${timeConditionRelationKey}}}`;
const LOCAL_TIME_ZONE = '+08';
const TIME_ZONE_START_POS = 19;
const displayKey = '1';

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.page.applicationId,
  folderId: store.builder.page.folderId,
  locale: store.builder.page.locale,
  version: store.builder.template.version,
  selectedComponent: store.builder.template.selectedComponent,
  selectedWrapperComponent: store.builder.template.selectedWrapperComponent,
});

const mapDispatchToProps = {
  saveCondition,
  updateConditionVersion,
  updateComponentCondition,
  searchLocalTimeVariable,
};

type ConditionEditorProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Condition: React.FC<ConditionEditorProps> = props => {
  const {
    applicationId,
    folderId,
    locale,
    version,
    selectedComponent,
    selectedWrapperComponent,
    saveCondition,
    updateConditionVersion,
    updateComponentCondition,
  } = props;
  const timezones = getAllTimeZone(locale);
  const [timeConditions, setTimeConditions] = useState<ConditionItem[]>([]);
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [defaultTimezone, setDefaultTimezone] = useState<string>(timezones[0]?.value || '');
  const [showStartTime, setShowStartTime] = useState<moment.Moment | undefined>(undefined);
  const [showEndTime, setShowEndTime] = useState<moment.Moment | undefined>(undefined);
  const [display, setDisplay] = useState<boolean>(true);
  const timeConditionsContent = useRef<string | undefined>(undefined);

  useEffect(() => {
    const component = selectedComponent.wrapper ? selectedWrapperComponent : selectedComponent;
    setDefaultTimezone(timezones[0]?.value || '');
    setShowStartTime(undefined);
    setShowEndTime(undefined);
    setDisplay(true);
    if (component) {
      const newConditions: ConditionItem[] = [];
      const conditionRelations = version?.relations?.conditions || [];
      const conditionDirective = component.directive?.if || [];
      conditionRelations.forEach(conditionRelation => {
        if (conditionDirective.find((item: string) => conditionRelation.id && item.includes(conditionRelation.id))) {
          const relationContent = conditionRelation as ConditionContentItem;
          const schemaItems = relationContent?.schemas[0];
          if (!schemaItems) {
            return;
          }
          const conditionItem = {
            type: FileTypeEnum.condition,
            content: relationContent,
            name: '',
            id: '',
            contentId: relationContent.id || '',
          };
          if (!schemaItems.name.startsWith('__')) {
            newConditions.push(conditionItem);
            return;
          }
          const childrenPropsItems = schemaItems?.children;
          if (isTimeConditionRelation(schemaItems)) {
            setTimeConditions([conditionItem]);
            timeConditionsContent.current = relationContent.id;
            childrenPropsItems.forEach(item => {
              const props = item.props;
              if (props.key === timeConditionsKey && props.operation === gtQqRelations.value) {
                setShowStartTime(getTimeByZone(LOCAL_TIME_ZONE, props.value));
                setDefaultTimezone(props.value.substr(TIME_ZONE_START_POS, 3));
              } else if (props.key === timeConditionsKey && props.operation === ltEqRelations.value) {
                setShowEndTime(getTimeByZone(LOCAL_TIME_ZONE, props.value));
              } else if (props.key === displayKey && props.operation === ltEqRelations.value) {
                setDisplay(props.value === displayKey);
              }
            });
          }
        }
      });
      setConditions(newConditions);
    }
  }, [selectedComponent, selectedWrapperComponent, version]);

  const handleSelectTimezone = (value: string) => {
    setDefaultTimezone(value);
    handleSaveCondition(value, showStartTime, showEndTime);
  };

  const handleChangeTime = value => {
    const [startTime, endTime] = value;
    const newShowStartTime = startTime ? startTime.format() : '';
    const newShowEndTime = endTime ? endTime.format() : '';
    setShowStartTime(newShowStartTime);
    setShowEndTime(newShowEndTime);
    handleSaveCondition(defaultTimezone, newShowStartTime, newShowEndTime);
  };

  const handleSaveCondition = (timeZone: string, startTime?: moment.Moment, endTime?: moment.Moment) => {
    if (!startTime || !endTime) {
      return;
    }
    // if (!localTimeVariable.current || !localTimeVariable.current.id) {
    //   message.warning(`Please Create Variable(${LOCAL_TIME_VARIABLE_NAME})`);
    //   return;
    // }
    const items: ConditionContentSchemaChildrenItem[] = [
      {
        type: conditionExpression,
        props: {
          key: timeConditionsKey,
          operation: gtQqRelations.value,
          value: getTimeByZone(timeZone, startTime),
        },
      },
      {
        type: conditionExpression,
        props: {
          key: timeConditionsKey,
          operation: ltEqRelations.value,
          value: getTimeByZone(timeZone, endTime),
        },
      },
      {
        type: conditionExpression,
        props: {
          key: displayKey,
          operation: eqRelations.value,
          value: display ? displayKey : '0',
        },
      },
    ];
    const timeConditionsName = `__condition_${shortId(10)}`;
    const conditionContentItem: ConditionContentItem = {
      id: timeConditionsContent.current,
      schemas: [{ type: 1, props: {}, name: timeConditionsName, children: items }],
      relation: {
        [timeConditionRelationKey]: {
          type: 'sys_variable',
          id: '',
          // content: localTimeVariable.current.content,
        },
      },
    };
    const condition: ConditionNewParams = {
      applicationId,
      folderId,
      name: timeConditionsName,
      type: 'condition',
      content: conditionContentItem,
    };
    const cb = (contentId?: string) => {
      conditionContentItem.id = contentId || timeConditionsContent.current;
      updateComponentCondition(
        conditions.concat([
          {
            type: FileTypeEnum.condition,
            content: conditionContentItem,
            name: '',
            id: '',
            contentId: conditionContentItem.id || '',
          },
        ]),
      );
    };
    timeConditionsContent.current ? updateConditionVersion(condition, cb) : saveCondition(condition, cb, false);
  };

  return (
    <React.Fragment>
      <Group>
        <Title>General</Title>
        <Field>
          <Label>Time</Label>
          <Select
            showSearch
            value={defaultTimezone}
            style={{ width: 200, marginRight: 10, marginBottom: 8 }}
            placeholder="Select a time zone"
            onChange={handleSelectTimezone}
            optionLabelProp="label"
          >
            {timezones.map(item => (
              <Select.Option
                key={item.key}
                value={item.value}
                label={item.desc}
                title={`${item.desc}(${item.country})`}
              >
                {item.desc}({item.country})
              </Select.Option>
            ))}
          </Select>
          <RangePicker
            showTime
            style={{ marginBottom: 8 }}
            value={
              showStartTime && showEndTime
                ? [moment(showStartTime, dateFormat), moment(showEndTime, dateFormat)]
                : undefined
            }
            onChange={handleChangeTime}
          />
        </Field>
        <Field>
          <Label>Display</Label>
          <Switch
            checkedChildren="show"
            unCheckedChildren="hide"
            checked={display}
            onChange={value => setDisplay(value)}
          />
        </Field>
      </Group>
      <Group>
        <Title>Advanced</Title>
        <Field>
          <Label>Terms </Label>
          <ConditionList conditions={conditions} timeConditions={timeConditions} />
        </Field>
      </Group>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Condition);
