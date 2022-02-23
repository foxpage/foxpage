import React, { useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { Button, DatePicker, Select, Switch } from 'antd';
import moment from 'moment';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/condition';
import { updateComponentCondition } from '@/actions/builder/template';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Field, Group, Label, Title } from '@/components/widgets/group';
import { eqRelations, gtQqRelations, ltEqRelations } from '@/configs/condition';
import { FileTypeEnum } from '@/constants/global';
import { LOCAL_TIME_VARIABLE_KEY, LOCAL_TIME_VARIABLE_NAME } from '@/constants/variable';
import GlobalContext from '@/pages/GlobalContext';
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
  open: store.builder.condition.conditionBindDrawerOpen,
});

const mapDispatchToProps = {
  saveCondition: ACTIONS.saveCondition,
  updateConditionVersion: ACTIONS.updateConditionVersion,
  updateComponentCondition,
  closeDrawer: () => ACTIONS.updateConditionBindDrawerVisible(false),
};

type ConditionEditorProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Condition: React.FC<ConditionEditorProps> = props => {
  const {
    open,
    applicationId,
    folderId,
    locale,
    version,
    selectedComponent,
    selectedWrapperComponent,
    saveCondition,
    updateConditionVersion,
    updateComponentCondition,
    closeDrawer,
  } = props;
  const timezones = getAllTimeZone(locale);
  const [conditions, setConditions] = useState<ConditionItem[]>([]);
  const [defaultTimezone, setDefaultTimezone] = useState<string>(timezones[0]?.value || '');
  const [showStartTime, setShowStartTime] = useState<moment.Moment | undefined>(undefined);
  const [showEndTime, setShowEndTime] = useState<moment.Moment | undefined>(undefined);
  const [display, setDisplay] = useState<boolean>(true);
  const timeConditionsContent = useRef<string | undefined>(undefined);

  const { locale: i18n } = useContext(GlobalContext);
  const { global, condition } = i18n.business;

  useEffect(() => {
    if (open) {
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
    }
  }, [open, selectedComponent, selectedWrapperComponent, version]);

  const handleSelectTimezone = (value: string) => {
    setDefaultTimezone(value);
  };

  const handleChangeTime = value => {
    const [startTime, endTime] = value;
    const newShowStartTime = startTime ? startTime.format() : '';
    const newShowEndTime = endTime ? endTime.format() : '';
    setShowStartTime(newShowStartTime);
    setShowEndTime(newShowEndTime);
  };

  const handleSaveCondition = () => {
    if (!showStartTime || !showEndTime) {
      conditions.length > 0 && updateComponentCondition(conditions);
      return;
    }
    const items: ConditionContentSchemaChildrenItem[] = [
      {
        type: conditionExpression,
        props: {
          key: timeConditionsKey,
          operation: gtQqRelations.value,
          value: getTimeByZone(defaultTimezone, showStartTime),
        },
      },
      {
        type: conditionExpression,
        props: {
          key: timeConditionsKey,
          operation: ltEqRelations.value,
          value: getTimeByZone(defaultTimezone, showEndTime),
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
    const timeConditionContentItem: ConditionContentItem = {
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
    const timeCondition: ConditionNewParams = {
      applicationId,
      folderId,
      name: timeConditionsName,
      type: 'condition',
      content: timeConditionContentItem,
    };
    const cb = (contentId?: string) => {
      timeConditionContentItem.id = contentId || timeConditionsContent.current;
      updateComponentCondition(
        conditions.concat([
          {
            type: FileTypeEnum.condition,
            content: timeConditionContentItem,
            name: '',
            id: '',
            contentId: timeConditionContentItem.id || '',
            tags: [],
          },
        ]),
      );
    };
    timeConditionsContent.current ? updateConditionVersion(timeCondition, cb) : saveCondition(timeCondition, cb, false);
  };

  return (
    <OperationDrawer
      open={open}
      title={global.condition}
      onClose={closeDrawer}
      width={480}
      destroyOnClose
      actions={
        <Button type="primary" onClick={handleSaveCondition}>
          {global.apply}
        </Button>
      }
    >
      <>
        <Group>
          <Title>{condition.general}</Title>
          <Field>
            <Label>{condition.time}</Label>
            <Select
              showSearch
              value={defaultTimezone}
              style={{ width: 200, marginRight: 10, marginBottom: 8 }}
              placeholder={condition.timezoneSelect}
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
              checkedChildren={condition.show}
              unCheckedChildren={condition.hide}
              checked={display}
              onChange={value => setDisplay(value)}
            />
          </Field>
        </Group>
        <Group>
          <Title>{condition.advanced}</Title>
          <Field>
            <Label>{global.terms} </Label>
            <ConditionList
              conditions={conditions}
              updateComponentCondition={conditions => {
                setConditions(conditions);
              }}
            />
          </Field>
        </Group>
      </>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Condition);
