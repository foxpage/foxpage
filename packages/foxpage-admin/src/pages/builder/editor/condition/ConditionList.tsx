import React, { useContext, useState } from 'react';
import { connect } from 'react-redux';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { updateComponentCondition } from '@/actions/builder/template';
import { ConditionItem } from '@/types/application/condition';

import BuilderContext from '../../BuilderContext';

import ConditionSelect from './select';

const Toolbar = styled.div`
  position: relative;
`;

interface IProps {
  conditions: ConditionItem[];
  timeConditions: ConditionItem[];
}

const mapStateToProps = (_store: RootState) => ({});

const mapDispatchToProps = {
  updateComponentCondition,
};

type ConditionEditorProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const ConditionList: React.FC<ConditionEditorProps> = props => {
  const { conditions, timeConditions, updateComponentCondition } = props;
  const { setCurMenu } = useContext(BuilderContext);
  const [selectDrawerShow, setSelectDrawerShow] = useState<boolean>(false);
  // const [group, setGroup] = useState<'project' | 'application'>('project');

  // const handleGroupChange = useCallback(e => {
  //   const _value = e.target.value;
  //   setGroup(_value);
  // }, []);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'id',
      render: (_text: string, record: ConditionItem) => record.content.schemas[0].name,
    },
    {
      title: 'Action',
      dataIndex: '',
      key: '',
      width: 60,
      render: (_text: string, record) => (
        <Popconfirm
          title="Are you sure to delete this condition?"
          okText="Yes"
          cancelText="No"
          onConfirm={() =>
            updateComponentCondition(
              conditions.filter(condition => condition.content.id !== record.content.id).concat(timeConditions),
            )
          }
        >
          <Button size="small" shape="circle" icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <React.Fragment>
      <Toolbar>
        <Button
          type="default"
          size="small"
          icon={<PlusOutlined />}
          style={{ position: 'absolute', right: 0, top: -30 }}
          onClick={() => {
            setSelectDrawerShow(true);
            setCurMenu(undefined);
          }}
        >
          Select
        </Button>
      </Toolbar>
      <Table
        columns={columns}
        bordered
        rowKey={record => record.id as string}
        pagination={false}
        dataSource={conditions}
        size="small"
      />
      <ConditionSelect
        onChange={(selectedConditions: ConditionItem[]) => {
          updateComponentCondition(selectedConditions.concat(timeConditions));
        }}
        visible={selectDrawerShow}
        conditions={conditions}
        onClose={() => setSelectDrawerShow(false)}
      />
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ConditionList);
