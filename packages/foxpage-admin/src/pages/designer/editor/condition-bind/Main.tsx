import React, { useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { Select, Switch } from 'antd';
import dayjs from 'dayjs';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/conditions';
import { conditionBind } from '@/actions/builder/events';
import * as PAGE_ACTIONS from '@/actions/builder/main';
import { Field, Group, Label, Title } from '@/components/index';
import {
  eqRelations,
  gtQqRelations,
  LOCAL_TIME_VARIABLE_KEY,
  LOCAL_TIME_VARIABLE_NAME,
  ltEqRelations,
} from '@/constants/index';
import { DatePicker } from '@/pages/components/common';
import { GlobalContext } from '@/pages/system';
import { getSystemVariableRelationKey, isTimeConditionRelation } from '@/sagas/builder/utils';
import {
  ConditionContentEntity,
  ConditionContentSchema,
  ConditionContentSchemaChildren,
  ConditionEntity,
  ConditionSaveParams,
} from '@/types/index';
import { objectEmptyCheck } from '@/utils/empty-check';
import shortId from '@/utils/short-id';

import { getAllTimeZone, getTimeByZone } from './utils/timezone';
import { ConditionList } from './components';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD hh:mm:ss';
const conditionExpression = 'condition.expression';
const timeConditionRelationKey = `${getSystemVariableRelationKey(
  `${LOCAL_TIME_VARIABLE_NAME}:${LOCAL_TIME_VARIABLE_KEY}`,
)}`;
const timeConditionsKey = `{{${timeConditionRelationKey}}}`;
const displayKey = '1';

const LOCAL_TIME_ZONE = '+08';
const TIME_ZONE_START_POS = 19;

const ConditionWrapper = styled.div`
  height: 100%;
  width: 100%;
  overflow: hidden;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.header.applicationId,
  folderId: store.builder.header.folderId,
  pageContentId: store.builder.header.contentId,
  locale: store.builder.header.locale,
  selectedComponent: store.builder.main.selectedNode,
  readOnly: store.builder.main.readOnly,
});

const mapDispatchToProps = {
  fetchDetail: ACTIONS.fetchConditionDetail,
  saveCondition: ACTIONS.saveCondition,
  saveConditionVersion: ACTIONS.saveConditionVersion,
  closeDrawer: PAGE_ACTIONS.updateToolbarEditorVisible,
  conditionBind,
};

type ConditionEditorProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<ConditionEditorProps> = (props) => {
  const {
    applicationId,
    folderId,
    pageContentId,
    locale,
    readOnly,
    fetchDetail,
    selectedComponent,
    saveCondition,
    saveConditionVersion,
    conditionBind,
  } = props;
  const [conditionsList, setConditions] = useState<ConditionEntity[]>([]);
  const [startTime, setShowStartTime] = useState<dayjs.Dayjs | undefined>(undefined);
  const [endTime, setShowEndTime] = useState<dayjs.Dayjs | undefined>(undefined);
  const [isDisplay, setDisplay] = useState<boolean>(true);

  // time zone
  const timezones = getAllTimeZone(locale);
  const [timezone, setDefaultTimezone] = useState<string>(timezones[0]?.value || '');

  // init condition content
  const timeConditionsContent = useRef<string | undefined>(undefined);

  // i18n
  const { locale: i18n } = useContext(GlobalContext);
  const { global, condition } = i18n.business;

  useEffect(() => {
    // check condition bind status & bind condition detail
    const component = selectedComponent;
    timeConditionsContent.current = undefined;

    if (component) {
      const conditionDirective: string[] = component?.directive?.if || [];
      if (conditionDirective.length === 0) {
        setConditions([]);
        setDefaultTimezone(timezones[0]?.value || '');
        setShowStartTime(undefined);
        setShowEndTime(undefined);
        setDisplay(true);
        return;
      }
      const newConditions: ConditionEntity[] = [];
      const conditionDirectiveIds = !objectEmptyCheck(conditionDirective)
        ? conditionDirective.map((item) => item.substring(item.indexOf(':') + 1, item.indexOf('}}')))
        : [];

      conditionDirectiveIds.forEach((id) => {
        if (id) {
          fetchDetail({ applicationId, id }, (condition) => {
            const schemaItems: ConditionContentSchema = condition?.content?.schemas?.[0];

            if (!schemaItems) {
              return;
            }

            if (isTimeConditionRelation(schemaItems)) {
              timeConditionsContent.current = condition.contentId;

              const childrenPropsItems = schemaItems?.children;

              childrenPropsItems.forEach((item) => {
                const props = item.props;
                if (props.key === timeConditionsKey && props.operation === gtQqRelations.value) {
                  setShowStartTime(getTimeByZone(LOCAL_TIME_ZONE, props.value));
                  setDefaultTimezone(props.value?.substr(TIME_ZONE_START_POS, 3));
                } else if (props.key === timeConditionsKey && props.operation === ltEqRelations.value) {
                  setShowEndTime(getTimeByZone(LOCAL_TIME_ZONE, props.value));
                } else if (props.key === displayKey && props.operation === eqRelations.value) {
                  setDisplay(props.value === displayKey);
                }
              });
            }

            const alreadyExist = newConditions.find((item) => item.id === condition.id);

            if (!alreadyExist) {
              newConditions.push(condition);
              setTimeout(() => {
                setConditions(newConditions);
              }, 0);
            }

            return;
          });
        }
      });
    }
  }, [selectedComponent]);

  const handleSelectTimezone = (value: string) => {
    setDefaultTimezone(value);

    handleApply({ timezoneParam: value, clearFlagParam: false });
  };

  const handleChangeTime = (value) => {
    const [startTime, endTime] = value || [];
    const newShowStartTime = startTime ? startTime.format() : '';
    const newShowEndTime = endTime ? endTime.format() : '';
    setShowStartTime(newShowStartTime);
    setShowEndTime(newShowEndTime);
    handleApply({ timePeriodParam: [newShowStartTime, newShowEndTime], clearFlagParam: false });
  };

  const handleChangeDisplay = (value) => {
    setDisplay(value);

    handleApply({ displayParam: value, clearFlagParam: false });
  };

  const handleUpdateComponentCondition = (ids) => {
    const componentId = selectedComponent?.id || '';
    if (componentId) {
      conditionBind(ids);
    }
  };

  const handleUpdateComponentConditionList = (_conditions) => {
    // handle time condition delete

    let clearFlag = false;
    let _timezone = timezone;
    let _startTime = startTime;
    let _endTime = endTime;
    let _display = isDisplay;
    const timeCondition = _conditions.find((condition) =>
      condition?.content?.schemas?.[0]?.name.startsWith('__renderConditionTimeAndDisplay'),
    );
    if (!timeCondition && !objectEmptyCheck(conditionsList)) {
      _timezone = timezones?.[0]?.value || '';
      _startTime = undefined;
      _endTime = undefined;
      _display = true;
    }

    if (objectEmptyCheck(_conditions)) {
      timeConditionsContent.current = undefined;
      clearFlag = true;
    }
    setConditions(_conditions);
    setDefaultTimezone(_timezone);
    setShowStartTime(_startTime);
    setShowEndTime(_endTime);
    setDisplay(_display);

    handleApply({
      conditionsListParams: _conditions,
      clearFlagParam: clearFlag,
      timezoneParam: _timezone,
      timePeriodParam: [_startTime, _endTime],
      displayParam: _display,
    });
  };

  const handleApply = ({
    clearFlagParam,
    timezoneParam,
    displayParam,
    timePeriodParam,
    conditionsListParams,
  }: {
    clearFlagParam?: boolean;
    displayParam?: any;
    timezoneParam?: string;
    conditionsParams?: any;
    timePeriodParam?: any[];
    conditionsListParams?: any;
  }) => {
    const [showStartTime = startTime, showEndTime = endTime] = timePeriodParam || [];
    const display = displayParam !== undefined ? displayParam : isDisplay;
    const defaultTimezone = timezoneParam || timezone;
    const conditions = conditionsListParams || conditionsList;

    if ((!showStartTime || !showEndTime) && display) {
      if (conditions.length > 0) {
        const conditionContents = conditions.map((condition) => condition.content);
        const timeCondition = conditionContents.find((content) =>
          isTimeConditionRelation(content?.schemas?.[0]),
        );
        if (!timeCondition) {
          const conditionContentIds = conditions.map((condition) => condition.contentId);
          handleUpdateComponentCondition(conditionContentIds);
          return;
        } else {
          const timeConditionContentEntity = {
            ...timeCondition,
            schemas: [
              {
                name: timeCondition.schemas[0].name,
                props: {},
                type: 1,
                children: [
                  {
                    type: conditionExpression,
                    props: {
                      key: displayKey,
                      operation: eqRelations.value,
                      value: display ? displayKey : '0',
                    },
                  },
                ],
              },
            ],
          };

          // update condition
          saveConditionVersion(
            {
              applicationId,
              folderId,
              pageContentId,
              name: timeCondition.schemas[0].name,
              type: 'condition',
              content: timeConditionContentEntity,
            },
            () => {
              const conditionContentIds = conditions.map((condition) => condition.contentId);
              handleUpdateComponentCondition(
                Array.from(new Set(conditionContentIds.concat([timeConditionContentEntity.id]))),
              );
            },
          );
          return;
        }
      }
    }

    let items: ConditionContentSchemaChildren[] = [];
    if (showStartTime && showEndTime) {
      items = [
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
      ];
    }

    if (clearFlagParam) {
      // clear all condition bind
      handleUpdateComponentCondition([]);
    } else {
      items.push({
        type: conditionExpression,
        props: {
          key: displayKey,
          operation: eqRelations.value,
          value: display ? displayKey : '0',
        },
      });

      const timeConditionsName = !!timeConditionsContent.current
        ? conditions.find((condition) => condition.contentId === timeConditionsContent.current)?.content
            ?.schemas?.[0]?.name || `__renderConditionTimeAndDisplay_${shortId(10)}`
        : `__renderConditionTimeAndDisplay_${shortId(10)}`;
      const timeConditionContentEntity: ConditionContentEntity = {
        id: timeConditionsContent.current || '',
        schemas: [{ type: 1, props: {}, name: timeConditionsName, children: items }],
        relation: {
          [timeConditionRelationKey]: {
            type: 'sys_variable',
            id: '',
            // content: localTimeVariable.current.content,
          },
        },
      };

      // generate request
      const params: ConditionSaveParams = {
        applicationId,
        folderId,
        pageContentId,
        name: timeConditionsName,
        type: 'condition',
        subType: 'timeDisplay',
        content: timeConditionContentEntity,
      };
      const cb = (id?: string) => {
        timeConditionContentEntity.id = id || timeConditionsContent.current || '';

        const conditionContentIds = conditions.map((condition) => condition.contentId);
        handleUpdateComponentCondition(
          Array.from(new Set(conditionContentIds.concat([timeConditionContentEntity.id]))),
        );
      };

      // save or update version
      timeConditionsContent.current ? saveConditionVersion(params, cb) : saveCondition(params, cb);
    }
  };

  return (
    <ConditionWrapper>
      <Group>
        <Title>{condition.general}</Title>

        <Field>
          <Label>{condition.time}</Label>
          <Select
            showSearch
            optionLabelProp="label"
            placeholder={condition.timezoneSelect}
            disabled={readOnly}
            value={timezone}
            onChange={handleSelectTimezone}
            style={{ marginBottom: 8 }}>
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
          <RangePicker
            showTime
            style={{ marginBottom: 8 }}
            value={
              startTime && endTime ? [dayjs(startTime, dateFormat), dayjs(endTime, dateFormat)] : undefined
            }
            disabled={readOnly}
            onChange={handleChangeTime}
          />
        </Field>

        <Field>
          <Label>Display</Label>
          <Switch
            checkedChildren={condition.show}
            unCheckedChildren={condition.hide}
            checked={isDisplay}
            onChange={handleChangeDisplay}
            disabled={readOnly}
          />
        </Field>
      </Group>

      <Group>
        <Title>{condition.advanced}</Title>
        <Field>
          <Label>{global.terms} </Label>
          <ConditionList
            conditions={conditionsList}
            updateComponentCondition={handleUpdateComponentConditionList}
            disable={readOnly}
          />
        </Field>
      </Group>
    </ConditionWrapper>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
