import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { Button, Table } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/file/functions';
import { Group, OperationDrawer, ScopeSelector } from '@/components/index';
import { ScopeEnum } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { FuncEntity,FuncFetchParams } from '@/types/index';

const Toolbar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const mapStateToProps = (state: RootState) => ({
  list: state.applications.detail.file.functions.list,
  loading: state.applications.detail.file.functions.loading,
  pageInfo: state.applications.detail.file.functions.pageInfo,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchList,
};

interface IProps {
  visible: boolean;
  funcId?: string;
  applicationId: string;
  folderId?: string;
  onChange: (selectedFunction: FuncEntity | undefined) => void;
  onClose: () => void;
}

type FunctionSelectType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;

const ConditionSelect: React.FC<FunctionSelectType> = (props) => {
  const {
    visible,
    funcId,
    applicationId,
    folderId,
    list,
    loading,
    pageInfo,
    fetchList,
    onChange,
    onClose,
    clearAll,
  } = props;
  const [group, setGroup] = useState<ScopeEnum>(!!folderId ? ScopeEnum.project : ScopeEnum.application);
  const [selectedRow, setSelectedRow] = useState<FuncEntity | undefined>(undefined);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, variable } = locale.business;

  useEffect(() => {
    if (applicationId && visible) {
      const params: FuncFetchParams = {
        applicationId,
        page: pageInfo.page,
        size: pageInfo.size,
      };

      if (!!folderId && group === ScopeEnum.application) {
        params.type = 'live';
      }

      if (group === ScopeEnum.project) {
        params.folderId = folderId;
      }

      fetchList(params);
    } else {
      clearAll();
    }
  }, [applicationId, folderId, group, visible]);

  useEffect(() => {
    if (funcId && visible) {
      setSelectedRow(list.find((item) => item.contentId === funcId));
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
      render: (_text: string, record: FuncEntity) => {
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
          }}>
          {global.apply}
        </Button>
      }>
      <Group>
        <Toolbar>
          <ScopeSelector
            scope={group}
            type={!folderId ? 'application' : 'project'}
            onScopeChange={(group) => {
              setGroup(group);
            }}
          />
        </Toolbar>
        <Table
          bordered
          size="small"
          loading={loading}
          rowKey={(record: FuncEntity) => record.contentId as string}
          columns={columns}
          dataSource={list}
          onChange={(pagination) => {
            fetchList({
              applicationId,
              folderId: group === ScopeEnum.project ? folderId : undefined,
              page: pagination.current || 1,
              size: pagination.pageSize || 10,
            });
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
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedRow ? [selectedRow.contentId] : [],
            onChange: (_selectedRowKeys: React.Key[], selectedRows: FuncEntity[]) => {
              setSelectedRow(selectedRows.length > 0 ? selectedRows[0] : undefined);
            },
          }}
        />
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ConditionSelect);
