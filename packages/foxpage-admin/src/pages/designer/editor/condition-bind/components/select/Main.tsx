import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Button, Table, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/conditions';
import { Group, OperationDrawer, ScopeSelector } from '@/components/index';
import { ConditionTypeEnum, ScopeEnum } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ConditionEntity, ConditionFetchParams } from '@/types/index';

const PAGE_NUM = 1;

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const Name = styled.div`
  display: inline-block;
  max-width: 170px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  const [pageNum, setPageNum] = useState<number>(pageInfo.page);
  const [selectedRows, setSelectedRows] = useState<ConditionEntity[]>([]);

  // i18n
  const { locale: i18n } = useContext(GlobalContext);
  const { global, condition } = i18n.business;

  useEffect(() => {
    if (visible && applicationId) {
      const params: ConditionFetchParams = {
        applicationId,
        page: pageNum,
        size: pageInfo.size,
      };

      if (group === ScopeEnum.project) {
        params.folderId = folderId;
      }

      fetchList(params);
    } else {
      setGroup(ScopeEnum.project);
      setPageNum(PAGE_NUM);
      setSelectedRows([]);
    }
  }, [visible, applicationId, folderId, group, pageNum]);

  useEffect(() => {
    if (visible) setSelectedRows(conditions);
  }, [visible, conditions]);

  const handleGroupChange = useCallback((group) => {
    setPageNum(PAGE_NUM);

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
      render: (name: string) => (
        <Tooltip title={name}>
          <Name>{name}</Name>
        </Tooltip>
      ),
    },
    {
      title: global.idLabel,
      dataIndex: 'contentId',
      key: 'contentId',
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
      width={500}
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
            selectedRowKeys: selectedRows.map((condition) => condition.contentId) || [],
            onChange: (_selectedRowKeys: React.Key[], selectedRows: ConditionEntity[]) => {
              setSelectedRows(selectedRows);
            },
          }}
          pagination={
            pageInfo?.total && pageInfo.total > pageInfo.size
              ? {
                  position: ['bottomCenter'],
                  current: pageInfo.page,
                  pageSize: pageInfo.size,
                  total: pageInfo.total,
                  showSizeChanger: false,
                }
              : false
          }
          onChange={(pagination) => setPageNum(pagination?.current || PAGE_NUM)}
        />
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
