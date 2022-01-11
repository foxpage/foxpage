import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';

// import { EyeOutlined } from '@ant-design/icons';
import { Button, Radio, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/condition';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Group } from '@/components/widgets';
import { ConditionEnum } from '@/pages/common/constant/Condition';
import { ConditionFetchParams, ConditionItem } from '@/types/application/condition';

const PAGE_SIZE = 10;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

interface IProps {
  visible: boolean;
  conditions: ConditionItem[];
  onClose: () => void;
  onChange: (selectedConditions: ConditionItem[]) => void;
}

const mapStateToProps = (state: RootState) => ({
  applicationId: state.builder.page.applicationId,
  folderId: state.builder.page.folderId,
  pageNum: state.builder.condition.pageNum,
  list: state.builder.condition.list,
  total: state.builder.condition.total,
  fetching: state.builder.condition.fetching,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
  // openDrawer: ACTIONS.updateConditionDrawerVisible,
  changeOffset: ACTIONS.changeOffset,
};

type ConditionSelectType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const ConditionSelect: React.FC<ConditionSelectType> = props => {
  const {
    fetching,
    visible,
    conditions,
    applicationId,
    folderId,
    pageNum,
    list,
    total,
    fetchList,
    changeOffset,
    onClose,
    onChange,
  } = props;
  const [group, setGroup] = useState<'project' | 'application'>('project');
  const [selectedRows, setSelectedRows] = useState<ConditionItem[]>([]);

  useEffect(() => {
    if (applicationId && visible) {
      const params: ConditionFetchParams = {
        applicationId,
        page: pageNum,
        size: PAGE_SIZE,
      };
      if (group === 'project') {
        params.folderId = folderId;
      }
      fetchList(params);
    }
  }, [applicationId, folderId, group, pageNum, visible]);

  useEffect(() => {
    setSelectedRows(conditions);
  }, [conditions]);

  const handleGroupChange = useCallback(e => {
    const _value = e.target.value;
    setGroup(_value);
  }, []);

  const handleClose = () => {
    changeOffset(1);
    onClose();
  };

  const columns: ColumnsType<ConditionItem> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (_text: string, record: ConditionItem) => {
        const type = record?.content.schemas[0]?.type || '';
        return <span>{type ? ConditionEnum[type] : ''}</span>;
      },
    },
    // {
    //   title: 'Action',
    //   dataIndex: '',
    //   key: '',
    //   width: 100,
    //   render: (_text: string, record: ConditionContentItem) => (
    //     <>
    //       <Button size="small" shape="circle" icon={<EyeOutlined />} onClick={() => openDrawer(true, record, 'view')} />
    //     </>
    //   ),
    // },
  ];

  return (
    <OperationDrawer
      open={visible}
      onClose={handleClose}
      title="Select Condition"
      width={480}
      actions={
        <Button
          type="primary"
          onClick={() => {
            onChange(selectedRows);
            handleClose();
          }}
        >
          Apply
        </Button>
      }
    >
      <Group>
        <Toolbar>
          <Radio.Group
            size="small"
            options={[
              { label: 'Project', value: 'project' },
              { label: 'Application', value: 'application' },
            ]}
            optionType="button"
            value={group}
            onChange={handleGroupChange}
          />
        </Toolbar>
        <Table
          columns={columns}
          bordered={false}
          loading={fetching}
          rowKey={(record: ConditionItem) => record.contentId as string}
          dataSource={list}
          pagination={
            total > PAGE_SIZE
              ? { current: pageNum, pageSize: PAGE_SIZE, total: total, position: ['bottomCenter'] }
              : false
          }
          size="small"
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedRows.map(condition => condition.content.id as string) || [],
            onChange: (_selectedRowKeys: React.Key[], selectedRows: ConditionItem[]) => {
              setSelectedRows(selectedRows);
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
