import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Popconfirm, Table, Tag } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/condition';
import EditDrawer from '@/pages/builder/toolbar/tools/condition/EditDrawer';
import { FoxpageBreadcrumb, FoxpageDetailContent } from '@/pages/common';
import { ConditionEnum } from '@/pages/common/constant/Condition';
import { suffixTagColor } from '@/pages/common/constant/FileType';
import GlobalContext from '@/pages/GlobalContext';
import { ConditionItem } from '@/types/application/condition';
import periodFormat from '@/utils/period-format';

const PAGE_SIZE = 10;

const OptionsBox = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
`;

const mapStateToProps = (state: RootState) => ({
  pageNum: state.builder.condition.pageNum,
  total: state.builder.condition.total,
  fetching: state.builder.condition.fetching,
  list: state.builder.condition.list,
});

const mapDispatchToProps = {
  changeOffset: ACTIONS.changeOffset,
  openDrawer: ACTIONS.updateConditionDrawerVisible,
  fetchApplicationConditions: ACTIONS.fetchApplicationConditions,
  deleteCondition: ACTIONS.deleteCondition,
  clearAll: ACTIONS.clearAll,
};

interface DProps extends Omit<DrawerProps, 'onClose'> {
  onClose?: () => void;
}

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & DProps;

function Component(props: IProps) {
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const { applicationId } = useParams<{ applicationId: string }>();
  const {
    pageNum,
    total,
    fetching,
    list,
    changeOffset,
    openDrawer,
    fetchApplicationConditions,
    deleteCondition,
    clearAll,
  } = props;

  const { locale } = useContext(GlobalContext);
  const { global, folder, condition, application } = locale.business;

  useEffect(() => {
    clearAll();
  }, []);

  useEffect(() => {
    if (applicationId) {
      fetchList();
    }
  }, [pageNum]);

  const fetchList = () => {
    const params = {
      applicationId,
      page: pageNum,
      size: PAGE_SIZE,
    };

    fetchApplicationConditions(params);
  };

  const handleConditionDelete = useCallback(
    (id) => {
      deleteCondition(
        {
          applicationId,
          id,
          status: true,
        },
        () => {
          list.length === 1 && pageNum > 1 ? changeOffset(pageNum - 1) : fetchList();
        },
        false,
      );
    },
    [applicationId, deleteCondition],
  );

  const columns = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ConditionItem) => {
        return (
          <>
            {text}
            {record.tags?.find((item) => item.copyFrom) && (
              <Tag color={suffixTagColor.refer} style={{ marginLeft: 4 }}>
                refer
              </Tag>
            )}
          </>
        );
      },
    },
    {
      title: folder.name,
      dataIndex: 'folderName',
      key: 'folderName',
      render: (folderName) =>
        folderName === '_variable' ? <Tag color="blue">Application</Tag> : <span>{folderName}</span>,
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
      render: (_text: string, record: ConditionItem) => {
        const schemas = record.content?.schemas;
        if (schemas?.length > 0) {
          const type = schemas[0].type;
          if (type) {
            return ConditionEnum[type] || '';
          }
        }
        return '';
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: ConditionItem) => {
        return record?.creator?.account || '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => {
        return periodFormat(text, 'unknown');
      },
    },
    {
      title: global.actions,
      dataIndex: '',
      key: '',
      width: 100,
      render: (_text: string, record: ConditionItem) => (
        <>
          <Button
            size="small"
            shape="circle"
            icon={<EditOutlined />}
            onClick={() => {
              setFolderId(record.folderId);
              openDrawer(true, record, 'edit');
            }}
          />
          <Divider type="vertical" />
          <Popconfirm
            title={`${global.deleteMsg}${record.name}?`}
            okText={global.yes}
            cancelText={global.no}
            onConfirm={() => handleConditionDelete(record.id)}>
            <Button size="small" shape="circle" icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <FoxpageDetailContent
        breadcrumb={
          <FoxpageBreadcrumb
            breadCrumb={[
              { name: application.applicationList, link: '/#/workspace/application' },
              { name: condition.name },
            ]}
          />
        }>
        <>
          <OptionsBox>
            <Button type="primary" onClick={() => openDrawer(true, undefined, 'new')}>
              <PlusOutlined /> {condition.add}
            </Button>
          </OptionsBox>
          <Table
            columns={columns}
            loading={fetching}
            bordered={false}
            rowKey={(record: ConditionItem) => record.id.toString()}
            dataSource={list}
            pagination={
              total > PAGE_SIZE
                ? { position: ['bottomCenter'], current: pageNum, pageSize: PAGE_SIZE, total: total }
                : false
            }
            onChange={(pagination) => {
              changeOffset(pagination.current || 1);
            }}
          />
        </>
      </FoxpageDetailContent>

      <EditDrawer applicationId={applicationId} folderId={folderId} onSuccess={fetchList} />
    </>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
