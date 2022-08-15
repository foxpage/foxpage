import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Button, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/conditions';
import { Group, OperationDrawer, ScopeSelector } from '@/components/index';
import { ConditionTypeEnum, ScopeEnum } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ConditionEntity,ConditionFetchParams } from '@/types/index';

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const mapStateToProps = (state: RootState) => ({
  applicationId: state.builder.header.applicationId,
  folderId: state.builder.header.folderId,
  pageInfo: state.applications.detail.file.conditions.pageInfo,
  list: state.applications.detail.file.conditions.list,
  loading: state.applications.detail.file.conditions.loading,
});

const mapDispatchToProps = {
  fetchList: ACTIONS.fetchList,
};

interface IProps {
  visible: boolean;
  conditions: ConditionEntity[];
  onClose: () => void;
  onChange: (selectedConditions: ConditionEntity[]) => void;
}

type ConditionSelectType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const Main: React.FC<ConditionSelectType> = (props) => {
  const {
    loading,
    visible,
    conditions,
    applicationId,
    folderId,
    list,
    pageInfo,
    fetchList,
    onClose,
    onChange,
  } = props;
  const [group, setGroup] = useState<ScopeEnum>(ScopeEnum.project);
  const [selectedRows, setSelectedRows] = useState<ConditionEntity[]>([]);

  // i18n
  const { locale: i18n } = useContext(GlobalContext);
  const { global, condition } = i18n.business;

  useEffect(() => {
    if (visible && applicationId) {
      const params: ConditionFetchParams = {
        applicationId,
        page: pageInfo.page,
        size: pageInfo.size,
      };

      if (group === ScopeEnum.project) {
        params.folderId = folderId;
      }

      fetchList(params);
    }
  }, [visible, applicationId, folderId, group]);

  useEffect(() => {
    setSelectedRows(conditions);
  }, [conditions]);

  const handleGroupChange = useCallback((group) => {
    setGroup(group);
  }, []);

  const handleClose = () => {
    onClose();
  };

  const columns: ColumnsType<ConditionEntity> = [
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
      render: (_text: string, record: ConditionEntity) => {
        const type = record?.content.schemas[0]?.type || '';
        return <span>{type ? ConditionTypeEnum[type] : ''}</span>;
      },
    },
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
          }}>
          {global.apply}
        </Button>
      }>
      <Group>
        <Toolbar>
          <ScopeSelector scope={group} onScopeChange={handleGroupChange} />
        </Toolbar>
        <Table
          size="small"
          bordered={false}
          loading={loading}
          columns={columns}
          rowKey={(record: ConditionEntity) => record.contentId as string}
          dataSource={list}
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedRows.map((condition) => condition.content.id as string) || [],
            onChange: (_selectedRowKeys: React.Key[], selectedRows: ConditionEntity[]) => {
              setSelectedRows(selectedRows);
            },
          }}
          pagination={
            pageInfo.total > pageInfo.size
              ? {
                  position: ['bottomCenter'],
                  current: pageInfo.page,
                  pageSize: pageInfo.size,
                  total: pageInfo.total,
                }
              : false
          }
          onChange={(pagination) => {
            fetchList({
              applicationId,
              page: pagination.current || 1,
              size: pagination.pageSize || 10,
            });
          }}
        />
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
