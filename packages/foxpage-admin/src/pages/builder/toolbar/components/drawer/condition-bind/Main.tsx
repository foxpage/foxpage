import React, { useContext, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';

import { Button, DatePicker, Select, Switch } from 'antd';
import moment from 'moment';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/conditions';
import { conditionBind } from '@/actions/builder/events';
import * as PAGE_ACTIONS from '@/actions/builder/main';
import { Field, Group, Label, OperationDrawer, Title } from '@/components/index';
import {
  eqRelations,
  gtQqRelations,
  LOCAL_TIME_VARIABLE_KEY,
  LOCAL_TIME_VARIABLE_NAME,
  ltEqRelations,
} from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { getSystemVariableRelationKey, isTimeConditionRelation } from '@/sagas/builder/utils';
import {
  ConditionContentEntity,
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

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.header.applicationId,
  folderId: store.builder.header.folderId,
  locale: store.builder.header.locale,
  selectedComponent: store.builder.main.selectedNode,
  editorData: store.builder.main.toolbarEditorData,
  open: store.builder.main.toolbarEditorVisible,
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
    open,
    applicationId,
    folderId,
    locale,
    editorData,
    fetchDetail,
    selectedComponent,
    saveCondition,
    saveConditionVersion,
    closeDrawer,
    conditionBind,
  } = props;
  const [conditions, setConditions] = useState<ConditionEntity[]>([]);
  const [showStartTime, setShowStartTime] = useState<moment.Moment | undefined>(undefined);
  const [showEndTime, setShowEndTime] = useState<moment.Moment | undefined>(undefined);
  const [display, setDisplay] = useState<boolean>(true);

  // time zone
  const timezones = getAllTimeZone(locale);
  const [defaultTimezone, setDefaultTimezone] = useState<string>(timezones[0]?.value || '');

  // init condition content
  const timeConditionsContent = useRef<string | undefined>(undefined);

  // i18n
  const { locale: i18n } = useContext(GlobalContext);
  const { global, condition } = i18n.business;

  useEffect(() => {
    if (open) {
      setDefaultTimezone(timezones[0]?.value || '');
      setShowStartTime(undefined);
      setShowEndTime(undefined);
      setDisplay(true);

      const component = selectedComponent;

      if (component) {
        const newConditions: ConditionEntity[] = [];
        const conditionDirective: string[] = component?.directive?.if || [];
        const conditionDirectiveIds = !objectEmptyCheck(conditionDirective)
          ? conditionDirective.map((item) => item.substring(item.indexOf(':') + 1, item.indexOf('}}')))
          : [];

        conditionDirectiveIds.forEach((id) => {
          if (id) {
            fetchDetail({ applicationId, id }, (condition) => {
              const schemaItems: any = condition?.content?.schemas?.[0];

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
              } else {
                newConditions.push(condition);
                return;
              }
            });
          }
        });

        setConditions(newConditions);
      }
    }
  }, [open]);

  const handleSelectTimezone = (value: string) => {
    setDefaultTimezone(value);
  };

  const handleChangeTime = (value) => {
    const [startTime, endTime] = value || [];
    const newShowStartTime = startTime ? startTime.format() : '';
    const newShowEndTime = endTime ? endTime.format() : '';
    setShowStartTime(newShowStartTime);
    setShowEndTime(newShowEndTime);
  };

  const handleUpdateComponentCondition = (ids) => {
    const componentId = editorData?.component?.id || '';
    if (componentId) {
      conditionBind(ids);
      closeDrawer(false);
    }
  };

  const handleApply = () => {
    if (!showStartTime || !showEndTime) {
      if (conditions.length > 0) {
        const conditionContentIds = conditions.map((condition) => condition.contentId);
        handleUpdateComponentCondition(conditionContentIds);
        return;
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

    items.push({
      type: conditionExpression,
      props: {
        key: displayKey,
        operation: eqRelations.value,
        value: display ? displayKey : '0',
      },
    });

    const timeConditionsName = `__condition_${shortId(10)}`;
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
      name: timeConditionsName,
      type: 'condition',
      content: timeConditionContentEntity,
    };
    const cb = (id?: string) => {
      timeConditionContentEntity.id = id || timeConditionsContent.current || '';

      const conditionContentIds = conditions.map((condition) => condition.contentId);
      handleUpdateComponentCondition(conditionContentIds.concat([timeConditionContentEntity.id]));
    };

    // save or update version
    timeConditionsContent.current ? saveConditionVersion(params, cb) : saveCondition(params, cb);
  };

  return (
    <OperationDrawer
      destroyOnClose
      open={open}
      width={480}
      title={global.condition}
      onClose={() => closeDrawer(false)}
      actions={
        <Button type="primary" onClick={handleApply}>
          {global.apply}
        </Button>
      }>
      <Group>
        <Title>{condition.general}</Title>

        <Field>
          <Label>{condition.time}</Label>
          <Select
            showSearch
            optionLabelProp="label"
            placeholder={condition.timezoneSelect}
            value={defaultTimezone}
            onChange={handleSelectTimezone}
            style={{ width: 200, marginRight: 10, marginBottom: 8 }}>
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
            onChange={(value) => setDisplay(value)}
          />
        </Field>
      </Group>

      <Group>
        <Title>{condition.advanced}</Title>
        <Field>
          <Label>{global.terms} </Label>
          <ConditionList
            conditions={conditions}
            updateComponentCondition={(conditions) => {
              setConditions(conditions);
            }}
          />
        </Field>
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
