import React, { useContext, useState } from 'react';

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Popconfirm, Table } from 'antd';
import styled from 'styled-components';

import GlobalContext from '@/pages/GlobalContext';
import { ConditionItem } from '@/types/application/condition';

import BuilderContext from '../../BuilderContext';

import ConditionSelect from './select';

const Toolbar = styled.div`
  position: relative;
`;

interface ConditionEditorProps {
  conditions: ConditionItem[];
  updateComponentCondition: (conditions: ConditionItem[]) => void;
}

const ConditionList: React.FC<ConditionEditorProps> = props => {
  const { conditions, updateComponentCondition } = props;
  const { setCurMenu } = useContext(BuilderContext);
  const [selectDrawerShow, setSelectDrawerShow] = useState<boolean>(false);
  const { locale: i18n } = useContext(GlobalContext);
  const { global } = i18n.business;

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'id',
      render: (_text: string, record: ConditionItem) => record.content.schemas[0].name,
    },
    {
      title: global.actions,
      dataIndex: '',
      key: '',
      width: 60,
      render: (_text: string, record) => (
        <Popconfirm
          title={`${global.deleteMsg}${record.name}`}
          okText={global.yes}
          cancelText={global.no}
          onConfirm={() =>
            updateComponentCondition(conditions.filter(condition => condition.content.id !== record.content.id))
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
          {global.select}
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
          updateComponentCondition(selectedConditions);
        }}
        visible={selectDrawerShow}
        conditions={conditions}
        onClose={() => setSelectDrawerShow(false)}
      />
    </React.Fragment>
  );
};

export default ConditionList;
