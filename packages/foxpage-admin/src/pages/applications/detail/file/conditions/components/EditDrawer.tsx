import React, { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/conditions';
import { Field, Group, Label, OperationDrawer } from '@/components/index';
import { ConditionFormula, ConditionType } from '@/constants/index';
import { GlobalContext } from '@/pages/system';

import Expressions from './Expressions';

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
  padding-left: 10px;
  align-self: center;
`;

const mapStateToProps = (store: RootState) => ({
  pageInfo: store.applications.detail.file.conditions.pageInfo,
  condition: store.applications.detail.file.conditions.editCondition,
  type: store.applications.detail.file.conditions.drawerType,
  visible: store.applications.detail.file.conditions.drawerVisible,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.openEditDrawer,
  saveCondition: ACTIONS.saveCondition,
  fetchList: ACTIONS.fetchList,
};

type ConditionEditDrawer = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    applicationId: string;
    folderId?: string;
    pageContentId?: string;
    search?: string;
  };

function EditDrawer(props: ConditionEditDrawer) {
  const {
    applicationId,
    folderId,
    pageContentId,
    type,
    pageInfo,
    search,
    visible,
    condition,
    closeDrawer,
    saveCondition,
    fetchList,
  } = props;
  const [name, setName] = useState('');
  const [logicType, setLogicType] = useState(0);

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

  const viewMode = !!type && type === 'view';

  // i18n
  const { locale } = useContext(GlobalContext);
  const { condition: conditionI18n, global } = locale.business;

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

  const handleUpdateName = (name: string) => {
    const newName = !folderId ? name : name.startsWith('_') ? name : '';

    setName(newName);
  };

  const handleClose = useCallback(() => {
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

  const handleApply = useCallback(() => {
    const id = condition?.id || '';
    const contentId = condition?.contentId || '';
    const newSchemas = [
      {
        name,
        type: logicType + 1,
        props: {},
        children: optData,
      },
    ];

    saveCondition(
      {
        applicationId,
        folderId,
        pageContentId,
        id,
        name,
        content: {
          id: contentId,
          schemas: newSchemas,
        },
        type: 'condition',
      },
      () => {
        handleClose();

        let params: any = {
          applicationId,
          page: pageInfo.page,
          size: pageInfo.size,
          search: search || '',
        };
        if (!!folderId)
          params = {
            ...params,
            folderId,
          };
        fetchList(params);
      },
    );
  }, [applicationId, condition, name, logicType, search, optData, saveCondition, handleClose]);

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
    (idx) => {
      const newData = [...optData];
      newData.splice(idx, 1);

      setOptData(newData);
    },
    [optData],
  );

  return (
    <OperationDrawer
      destroyOnClose
      width={480}
      open={visible}
      title={viewMode ? global.view : condition?.id ? global.edit : global.add}
      actions={
        <Button type="primary" disabled={!name || viewMode} onClick={handleApply}>
          {global.apply}
        </Button>
      }
      onClose={handleClose}>
      <Group>
        <Field>
          <Label>{folderId ? global.nameLabelWithUnderline : global.nameLabel}</Label>
          <Input
            disabled={viewMode}
            placeholder={conditionI18n.nameLabel}
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => handleUpdateName(e.target.value)}
          />
        </Field>
        <Field>
          <Label>{conditionI18n.arithmeticLogic}</Label>
          <Select
            placeholder="logic"
            disabled={!!condition?.id || viewMode}
            value={logicType}
            onChange={setLogicType}>
            {ConditionType &&
              ConditionType.map((item: string, idx: number) => (
                <Option key={item} value={idx}>
                  {item}
                </Option>
              ))}
          </Select>
        </Field>
        <Field>
          <Label>{global.expression}</Label>
          <Expressions>
            {optData.map((item, index) => (
              <Container key={index}>
                <FormulaContainer>
                  <Input
                    disabled={viewMode}
                    placeholder="origin"
                    value={item.props.key}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleOptDataChange('key', e.target.value, index)
                    }
                  />
                  <Select
                    disabled={viewMode}
                    dropdownMatchSelectWidth={false}
                    placeholder="formula"
                    value={item.props.operation}
                    onChange={(value: string) => handleOptDataChange('operation', value, index)}
                    style={{ flex: '0 0 120px', marginRight: 10, marginLeft: 10 }}>
                    {ConditionFormula &&
                      ConditionFormula.map((item) => (
                        <Option key={item.value} value={item.value}>
                          {item.label}
                        </Option>
                      ))}
                  </Select>
                  <Input
                    disabled={viewMode}
                    placeholder="expected"
                    value={item.props.value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleOptDataChange('value', e.target.value, index)
                    }
                  />
                </FormulaContainer>
                <FormulaCTAContainer>
                  {optData.length > 1 && (
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      type="text"
                      onClick={() => handleRemoveItem(index)}
                    />
                  )}
                </FormulaCTAContainer>
              </Container>
            ))}
            {optData.length < 10 && (
              <Button icon={<PlusOutlined />} block type="dashed" size="small" onClick={handleAddItem} />
            )}
          </Expressions>
        </Field>
      </Group>
    </OperationDrawer>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(EditDrawer);
