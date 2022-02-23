import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Divider, Popconfirm, Table, Tag } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/condition';
import EditDrawer from '@/pages/builder/condition/EditDrawer';
import { FoxpageBreadcrumb } from '@/pages/common';
import { ConditionEnum } from '@/pages/common/constant/Condition';
import { suffixTagColor } from '@/pages/common/constant/FileType';
import GlobalContext from '@/pages/GlobalContext';
import { ConditionItem } from '@/types/application/condition';
import periodFormat from '@/utils/period-format';

const PAGE_SIZE = 10;

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
  const { applicationId, organizationId } = useParams<{ applicationId: string; organizationId: string }>();
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
    id => {
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
            {record.tags?.find(item => item.copyFrom) && (
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
            onConfirm={() => handleConditionDelete(record.id)}
          >
            <Button size="small" shape="circle" icon={<DeleteOutlined />} />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <>
      <FoxpageBreadcrumb
        breadCrumb={[
          { name: application.applicationList, link: `/#/organization/${organizationId}/application/list` },
          { name: condition.name },
        ]}
      />
      <div style={{ marginTop: 12 }}>
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
          onChange={pagination => {
            changeOffset(pagination.current || 1);
          }}
        />
      </div>

      <EditDrawer applicationId={applicationId} folderId={folderId} onSuccess={fetchList} />
    </>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
