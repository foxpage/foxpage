import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Divider, message, Popconfirm, Table, Tag } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';
import { RootState } from 'typesafe-actions';

import { FunctionTypeEnum } from '@/constants/function';
import EditDrawer from '@/pages/builder/function/EditDrawer';
import { FoxpageBreadcrumb } from '@/pages/common';
import { suffixTagColor } from '@/pages/common/constant/FileType';
import * as ACTIONS from '@/store/actions/builder/function';
import { ApplicationUrlParams } from '@/types/application';
import { FuncItem } from '@/types/application/function';
import periodFormat from '@/utils/period-format';

const PAGE_SIZE = 10;

const mapStateToProps = (state: RootState) => ({
  pageNum: state.builder.fn.pageNum,
  total: state.builder.fn.total,
  fetching: state.builder.fn.fetching,
  list: state.builder.fn.list,
});

const mapDispatchToProps = {
  changeOffset: ACTIONS.changeOffset,
  openDrawer: ACTIONS.updateFunctionDrawerVisible,
  fetchFunctions: ACTIONS.fetchApplicationFunctions,
  deleteCondition: ACTIONS.deleteFunction,
  clearAll: ACTIONS.clearAll,
};

interface DProps extends Omit<DrawerProps, 'onClose'> {
  onClose?: () => void;
}

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & DProps;

function Component(props: IProps) {
  const { pageNum, total, fetching, list, clearAll, changeOffset, openDrawer, fetchFunctions, deleteCondition } = props;

  const { applicationId, organizationId } = useParams<ApplicationUrlParams>();

  useEffect(() => {
    return () => {
      clearAll();
    };
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

    fetchFunctions(params);
  };

  const handleConditionDelete = useCallback(
    id => {
      if (id && applicationId) {
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
      } else {
        message.warning('Delete function failed, please retry later');
      }
    },
    [applicationId, deleteCondition],
  );

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: FuncItem) => {
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
      title: 'Folder',
      dataIndex: 'folderName',
      key: 'folderName',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (_text: string, record: FuncItem) => {
        const schemas = record.content?.schemas;
        return (
          <React.Fragment>
            {schemas?.length > 0 && schemas[0]?.props?.async ? FunctionTypeEnum.async : FunctionTypeEnum.sync}
          </React.Fragment>
        );
      },
    },
    {
      title: 'Creator',
      dataIndex: 'creator',
      key: 'creator',
      render: (_text: string, record: FuncItem) => {
        return record.creator.account;
      },
    },
    {
      title: 'CreateTime',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => {
        return periodFormat(text, 'unknown');
      },
    },
    {
      title: 'Actions',
      dataIndex: '',
      key: '',
      width: 100,
      render: (_text: string, record: FuncItem) => (
        <>
          <Button
            shape="circle"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openDrawer(true, record, 'edit')}
          />
          <Divider type="vertical" />
          <Popconfirm
            title="Are you sure to delete this function?"
            okText="Yes"
            cancelText="No"
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
          { name: 'Application List', link: `/#/organization/${organizationId}/application/list` },
          { name: 'Functions' },
        ]}
      />
      <div style={{ marginTop: 12 }}>
        <Table
          loading={fetching}
          columns={columns}
          bordered={false}
          rowKey={(record: FuncItem) => record.id.toString()}
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
      <EditDrawer onSuccess={fetchList} />
    </>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
