import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import OperationDrawer from '@/components/business/OperationDrawer';
import { Field, Group, Label } from '@/components/widgets/group';
import * as ACTIONS from '@/store/actions/builder/condition';
import { OptionsAction } from '@/types/common';

import { ConditionFormula, ConditionType } from '../../common/constant/Condition';

const DRAWER_NAME = {
  new: 'Add',
  edit: 'Edit',
  view: 'View',
};

const { Option } = Select;

const Container = styled.div`
  display: flex;
  margin-bottom: 10px;
`;

const FormulaContainer = styled.div`
  display: flex;
  flex-grow: 1;
`;

const FormulaCTAContainer = styled.div`
  padding: 0 10px;
  flex: 0 0 70px;
  align-self: center;
`;

const mapStateToProps = (state: RootState) => ({
  condition: state.builder.condition.selectCondition,
  visible: state.builder.condition.drawerVisible,
  drawerType: state.builder.condition.drawerType,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.updateConditionDrawerVisible,
  saveCondition: ACTIONS.saveCondition,
  updateCondition: ACTIONS.updateCondition,
};

interface EditDrawerType extends OptionsAction {
  applicationId: string;
  folderId?: string;
}

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & EditDrawerType;

function EditDrawer(props: IProps) {
  const {
    visible,
    applicationId,
    folderId,
    drawerType,
    condition,
    closeDrawer,
    saveCondition,
    updateCondition,
    onSuccess,
  } = props;
  const [name, setName] = useState('');
  const [logicType, setLogicType] = useState(0);

  // init drawer type
  const [type, setType] = useState('');
  useEffect(() => {
    setType(drawerType);
  }, [drawerType]);

  // init opt data
  const defaultOptData = [
    {
      type: 'condition.expression',
      props: {
        key: '',
        operation: '',
        value: '',
      },
    },
  ];
  const [optData, setOptData] = useState(defaultOptData);

  useEffect(() => {
    if (visible) {
      // get name & set default when edit
      const conditionName = condition?.name || undefined;
      if (conditionName) setName(conditionName);

      // get type & set default when edit
      const { content } = condition || {};
      const { schemas } = content || {};
      const conditionType = schemas ? schemas[0]?.type : undefined;
      if (conditionType) setLogicType(conditionType - 1);

      // get optData & set default when edit
      const conditionOptData: any = schemas ? schemas[0]?.children : undefined;
      if (conditionOptData) setOptData(conditionOptData);
    }
  }, [visible, condition]);

  const handleSaveSuccess = () => {
    handleDrawerClose();
    if (typeof onSuccess === 'function') {
      onSuccess();
    }
  };

  // close drawer
  const handleDrawerClose = useCallback(() => {
    setType('');
    setName('');
    setLogicType(0);
    setOptData([
      {
        type: 'condition.expression',
        props: {
          key: '',
          operation: '',
          value: '',
        },
      },
    ]);

    setTimeout(() => closeDrawer(false), 50);
  }, [closeDrawer]);

  // apply
  const handleApplyClick = useCallback(() => {
    const newSchemas = [
      {
        name,
        type: logicType + 1,
        props: {},
        children: optData,
      },
    ];

    if (type === 'new') {
      if (applicationId && folderId) {
        saveCondition(
          {
            applicationId,
            folderId,
            name,
            content: {
              schemas: newSchemas,
            },
          },
          handleSaveSuccess,
        );
      }
    } else {
      const id = condition?.id || '';
      const contentId = condition?.contentId || '';

      if (applicationId && id && contentId && folderId)
        updateCondition(
          {
            applicationId,
            id,
            folderId,
            name,
            content: {
              id: contentId,
              schemas: newSchemas,
            },
            type: 'condition',
          },
          handleSaveSuccess,
        );
    }
  }, [
    applicationId,
    folderId,
    condition,
    type,
    name,
    logicType,
    optData,
    saveCondition,
    updateCondition,
    handleDrawerClose,
  ]);

  // expression change
  const handleOptDataChange = useCallback(
    (key: string, value: string, idx: number) => {
      const newData = _.cloneDeep(optData);
      Object.assign(newData[idx]['props'], { [key]: value });

      setOptData(newData);
    },
    [optData],
  );

  // button click
  const handleAddItem = useCallback(() => {
    const newData = [...optData];
    newData.push({
      type: 'condition.expression',
      props: {
        key: '',
        operation: '',
        value: '',
      },
    });

    setOptData(newData);
  }, [optData]);

  const handleRemoveItem = useCallback(
    idx => {
      const newData = [...optData];
      newData.splice(idx, 1);

      setOptData(newData);
    },
    [optData],
  );

  return (
    <OperationDrawer
      open={visible}
      title={DRAWER_NAME[type] || 'view'}
      onClose={handleDrawerClose}
      width={550}
      destroyOnClose
      actions={
        type !== 'view' ? (
          <Button type="primary" onClick={handleApplyClick}>
            Apply
          </Button>
        ) : (
          <></>
        )
      }
    >
      <Group>
        <Field>
          <Label>Name</Label>
          <Input
            placeholder="condition name"
            disabled={type === 'view'}
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
        </Field>
        <Field>
          <Label>Arithmetic logic</Label>
          <Select
            placeholder="logic"
            disabled={type !== 'new'}
            value={logicType}
            onChange={setLogicType}
            style={{ width: 160 }}
          >
            {ConditionType &&
              ConditionType.map((item: string, idx: number) => (
                <Option key={item} value={idx}>
                  {item}
                </Option>
              ))}
          </Select>
        </Field>
        <Field>
          <Label>Terms</Label>
          {optData.map((item, index) => (
            <Container key={index}>
              <FormulaContainer>
                <Input
                  placeholder="origin"
                  disabled={type === 'view'}
                  value={item.props.key}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleOptDataChange('key', e.target.value, index)}
                />
                <Select
                  placeholder="formula"
                  dropdownMatchSelectWidth={false}
                  disabled={type === 'view'}
                  value={item.props.operation}
                  onChange={(value: string) => handleOptDataChange('operation', value, index)}
                  style={{ flex: '0 0 120px', marginRight: 10, marginLeft: 10 }}
                >
                  {ConditionFormula &&
                    ConditionFormula.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.label}
                      </Option>
                    ))}
                </Select>
                <Input
                  placeholder="expected"
                  disabled={type === 'view'}
                  value={item.props.value}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleOptDataChange('value', e.target.value, index)}
                />
              </FormulaContainer>
              {type !== 'view' && (
                <FormulaCTAContainer>
                  {optData.length > 1 && (
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      type="text"
                      onClick={() => handleRemoveItem(index)}
                    />
                  )}
                  {index === optData.length - 1 && optData.length < 10 && (
                    <Button icon={<PlusOutlined />} size="small" type="text" onClick={handleAddItem} />
                  )}
                </FormulaCTAContainer>
              )}
            </Container>
          ))}
        </Field>
      </Group>
    </OperationDrawer>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(EditDrawer);
