import React, { useCallback, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Divider, Drawer, message, Popconfirm, Spin, Table } from 'antd';
import { DrawerProps } from 'antd/lib/drawer';

import * as ACTIONS from '@/actions/builder/condition';
import { Pagination } from '@/components/common/index';
import { ScopeEnum } from '@/constants/scope';
import RightCloseIcon from '@/pages/builder/component/close';
import ScopeSelect from '@/pages/components/common/ScopeSelect';
import GlobalContext from '@/pages/GlobalContext';
import { ConditionItem } from '@/types/application/condition';

import BuilderContext from '../../../BuilderContext';
import { DrawerHeader, Toolbar } from '../common/CommonStyles';

import EditDrawer from './EditDrawer';

const PAGE_SIZE = 10;

const TYPE = ['and', 'or'];

const mapStateToProps = (state: any) => ({
  applicationId: state.builder.page.applicationId,
  folderId: state.builder.page.folderId,
  pageNum: state.builder.condition.pageNum,
  total: state.builder.condition.total,
  fetching: state.builder.condition.fetching,
  list: state.builder.condition.list,
});

const mapDispatchToProps = {
  changeOffset: ACTIONS.changeOffset,
  openDrawer: ACTIONS.updateConditionDrawerVisible,
  fetchList: ACTIONS.fetchList,
  deleteCondition: ACTIONS.deleteCondition,
};

interface DProps extends Omit<DrawerProps, 'onClose'> {
  onClose?: () => void;
}

type IProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & DProps;

function Component(props: IProps) {
  const {
    applicationId,
    folderId,
    onClose,
    pageNum,
    total,
    fetching,
    list,
    changeOffset,
    openDrawer,
    fetchList,
    deleteCondition,
  } = props;
  const { container } = useContext(BuilderContext);
  const [group, setGroup] = useState<ScopeEnum>(ScopeEnum.project);
  const { locale } = useContext(GlobalContext);
  const { global, condition: conditionI18n } = locale.business;

  useEffect(() => {
    if (applicationId) {
      const params =
        group === ScopeEnum.project && !!folderId
          ? {
              applicationId,
              folderId,
              page: pageNum,
              size: PAGE_SIZE,
            }
          : {
              applicationId,
              type: 'live',
              page: pageNum,
              size: PAGE_SIZE,
            };

      fetchList(params);
    }
  }, [applicationId, folderId, group, pageNum, fetchList]);

  const handleConditionDelete = useCallback(
    (id) => {
      if (id && applicationId) {
        deleteCondition({
          applicationId,
          id,
          status: true,
        });
      } else {
        message.warning(conditionI18n.deleteFailMsg);
      }
    },
    [applicationId, folderId, deleteCondition],
  );

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
      render: (_text: string, record: ConditionItem) => {
        const type = record.content?.schemas[0]?.type || '';

        return <span>{type ? TYPE[type - 1] : ''}</span>;
      },
    },
    {
      title: global.actions,
      dataIndex: '',
      key: '',
      width: 100,
      render: (_text: string, record: ConditionItem) => (
        <>
          {group === ScopeEnum.project ? (
            <>
              <Button
                size="small"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => openDrawer(true, record, 'edit')}
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
          ) : (
            <Button
              size="small"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => openDrawer(true, record, 'view')}
            />
          )}
        </>
      ),
    },
  ];

  const handleGroupChange = useCallback((value) => {
    setGroup(value);
  }, []);

  return (
    <>
      <Drawer
        title={<DrawerHeader>{global.condition}</DrawerHeader>}
        placement="left"
        visible
        destroyOnClose
        mask={false}
        closable={false}
        extra={<RightCloseIcon onClose={onClose} />}
        width={410}
        getContainer={container}
        onClose={onClose}
        headerStyle={{ padding: 16 }}
        bodyStyle={{ padding: 16 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 50,
          boxShadow: 'rgba(0, 0, 0, 0.1) 4px 4px 4px 2px',
          overflowY: 'auto',
          transition: 'none',
        }}>
        <Toolbar>
          <ScopeSelect scope={group} onScopeChange={handleGroupChange} />
          {group === ScopeEnum.project && (
            <Button
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => openDrawer(true, undefined, 'new')}>
              {conditionI18n.add}
            </Button>
          )}
        </Toolbar>
        <Spin spinning={fetching}>
          <Table
            columns={columns}
            bordered={false}
            rowKey={(record: ConditionItem) => record.id.toString()}
            pagination={false}
            dataSource={list}
            size="small"
          />
          <Pagination
            size="small"
            pageSize={PAGE_SIZE}
            current={pageNum}
            total={total}
            onChange={changeOffset}
          />
        </Spin>
      </Drawer>
      <EditDrawer applicationId={applicationId} folderId={folderId} />
    </>
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Component);
