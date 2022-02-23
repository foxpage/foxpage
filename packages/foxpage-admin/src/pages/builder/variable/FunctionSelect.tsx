import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

// import { EyeOutlined } from '@ant-design/icons';
import { Button, Table } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/function';
import OperationDrawer from '@/components/business/OperationDrawer';
import ScopeSelect from '@/components/common/ScopeSelect';
import { Group } from '@/components/widgets';
import { ScopeEnum } from '@/constants/index';
import GlobalContext from '@/pages/GlobalContext';
import { FuncFetchParams, FuncItem } from '@/types/application/function';

const PAGE_SIZE = 10;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

interface IProps {
  visible: boolean;
  funcId?: string;
  applicationId: string;
  folderId?: string;
  onClose: () => void;
  onChange: (selectedFunction: FuncItem | undefined) => void;
}

const mapStateToProps = (state: RootState) => ({
  pageNum: state.builder.fn.pageNum,
  total: state.builder.fn.total,
  fetching: state.builder.fn.fetching,
  list: state.builder.fn.list,
});

const mapDispatchToProps = {
  changeOffset: ACTIONS.changeOffset,
  fetchList: ACTIONS.fetchList,
  clearAll: ACTIONS.clearAll,
};

type FunctionSelectType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const ConditionSelect: React.FC<FunctionSelectType> = props => {
  const {
    fetching,
    visible,
    funcId,
    applicationId,
    folderId,
    pageNum,
    list,
    total,
    fetchList,
    changeOffset,
    onClose,
    onChange,
    clearAll,
  } = props;
  const [group, setGroup] = useState<ScopeEnum>(ScopeEnum.project);
  const [selectedRow, setSelectedRow] = useState<FuncItem | undefined>(undefined);
  const { locale } = useContext(GlobalContext);
  const { global, variable } = locale.business;
  useEffect(() => {
    if (applicationId && visible) {
      const params: FuncFetchParams = {
        applicationId,
        page: pageNum,
        size: PAGE_SIZE,
      };
      if (group === ScopeEnum.project) {
        params.folderId = folderId;
      }
      fetchList(params);
    } else {
      clearAll();
    }
  }, [applicationId, folderId, group, pageNum, visible]);

  useEffect(() => {
    if (funcId && visible) {
      setSelectedRow(list.find(item => item.contentId === funcId));
    }
  }, [funcId, visible, list]);

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
      render: (_text: string, record: FuncItem) => {
        const type = record.content?.schemas[0]?.props?.async || '';

        return <span>{type ? 'async' : 'sync'}</span>;
      },
    },
  ];

  return (
    <OperationDrawer
      open={visible}
      onClose={onClose}
      title={variable.selectFunction}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            onChange(selectedRow);
            onClose();
          }}
        >
          {global.apply}
        </Button>
      }
    >
      <Group>
        <Toolbar>
          <ScopeSelect
            scope={group}
            onScopeChange={group => {
              setGroup(group);
            }}
          />
        </Toolbar>
        <Table
          columns={columns}
          bordered
          loading={fetching}
          rowKey={(record: FuncItem) => record.contentId as string}
          dataSource={list}
          pagination={
            total > PAGE_SIZE
              ? { current: pageNum, pageSize: PAGE_SIZE, total: total, position: ['bottomCenter'] }
              : false
          }
          size="small"
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedRow ? [selectedRow.contentId] : [],
            onChange: (_selectedRowKeys: React.Key[], selectedRows: FuncItem[]) => {
              setSelectedRow(selectedRows.length > 0 ? selectedRows[0] : undefined);
            },
          }}
          onChange={pagination => {
            changeOffset(pagination.current || 1);
          }}
        />
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ConditionSelect);
