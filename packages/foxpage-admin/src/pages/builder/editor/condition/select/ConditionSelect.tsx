import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

// import { EyeOutlined } from '@ant-design/icons';
import { Button, Radio, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/condition';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Group } from '@/components/widgets';
import { ScopeEnum } from '@/constants/index';
import { ConditionEnum } from '@/pages/common/constant/Condition';
import ScopeSelect from '@/pages/components/common/ScopeSelect';
import GlobalContext from '@/pages/GlobalContext';
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
  const [group, setGroup] = useState<ScopeEnum>(ScopeEnum.project);
  const [selectedRows, setSelectedRows] = useState<ConditionItem[]>([]);

  const { locale: i18n } = useContext(GlobalContext);
  const { global, condition } = i18n.business;

  useEffect(() => {
    if (applicationId && visible) {
      const params: ConditionFetchParams = {
        applicationId,
        page: pageNum,
        size: PAGE_SIZE,
      };
      if (group === ScopeEnum.project) {
        params.folderId = folderId;
      }
      fetchList(params);
    }
  }, [applicationId, folderId, group, pageNum, visible]);

  useEffect(() => {
    setSelectedRows(conditions);
  }, [conditions]);

  const handleGroupChange = useCallback(group => {
    setGroup(group);
  }, []);

  const handleClose = () => {
    changeOffset(1);
    onClose();
  };

  const columns: ColumnsType<ConditionItem> = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: global.type,
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
      title={condition.selectCondition}
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
          <ScopeSelect scope={group} onScopeChange={handleGroupChange} />
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
