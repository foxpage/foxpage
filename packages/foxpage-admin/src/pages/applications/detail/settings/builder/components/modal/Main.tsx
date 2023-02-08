import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { ArrowUpOutlined } from '@ant-design/icons';
import { Input, Modal, Table as AntTable, Tabs as AntTabs, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import { GlobalContext } from '@/pages/system';
import { ComponentCategory, ComponentEntity, PaginationInfo } from '@/types/index';
import { objectEmptyCheck } from '@/utils/empty-check';

const { Search } = Input;
const { TabPane } = AntTabs;

const PAGE = 1;
const SIZE = 10;
const SEARCH_SIZE = 9999;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  align-items: center;
`;

const Tabs = styled(AntTabs)`
  height: 40px;
  & > .ant-tabs-nav::before {
    border: none;
  }
`;

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 16px 0 0;
  }
`;

interface IProps {
  type: string;
  list: any[];
  loading: boolean;
  pageInfo: PaginationInfo;
  visible: boolean;
  onClose: () => void;
  onFetch: (params: any) => void;
  onSave: (params: any) => void;
}

const Main = (props: IProps) => {
  const { list, loading, pageInfo, type, visible, onClose, onFetch, onSave } = props;
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeTab, setActiveTab] = useState<string>(type);

  const { applicationId } = useParams<{ applicationId: string }>();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { category, global, package: packageI18n, setting: settingI18n } = locale.business;

  useEffect(() => {
    if (visible && applicationId && typeof onFetch === 'function') {
      onFetch({
        applicationId,
        page: !!search ? PAGE : pageInfo.page,
        size: !!search ? SEARCH_SIZE : SIZE,
        search,
      });
    } else {
      setSearch('');
      setSelectedRowKeys([]);
    }
  }, [applicationId, search, visible]);

  const columns: any = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
    },
  ];

  if (type) {
    const newColumn =
      type !== 'component'
        ? {
            title: global.idLabel,
            dataIndex: 'id',
            width: 200,
          }
        : {
            title: global.liveVersion,
            dataIndex: 'release',
            key: 'release',
            width: 120,
            render: (release: string, record: ComponentEntity) => {
              return (
                <>
                  {release ? <Tag color="orange">{release}</Tag> : <Tag>0.0.0</Tag>}
                  {record.base && (
                    <Tooltip title={global.newVersion}>
                      <ArrowUpOutlined style={{ color: '#8adf5e' }} />
                    </Tooltip>
                  )}
                </>
              );
            },
          };

    columns.push(newColumn);
  }

  const handleSearch = (search) => {
    // clear select row key when page change
    setSelectedRowKeys([]);

    setSearch(search);
  };

  const handlePageChange = (pagination) => {
    // clear select row key when page change
    setSelectedRowKeys([]);

    if (typeof onFetch === 'function')
      onFetch({
        applicationId,
        page: pagination.current || 1,
        size: pagination.pageSize || 10,
        search,
      });
  };

  const handleCancel = () => {
    if (onClose && typeof onClose === 'function') onClose();
  };

  const handleConfirm = () => {
    if (!objectEmptyCheck(selectedRowKeys)) {
      const setting = selectedRowKeys.map((id) => ({
        category: {} as ComponentCategory,
        id,
        name: list.find((item) => item.id === id)?.name || '',
        status: false,
      }));

      onSave({
        applicationId,
        type: activeTab,
        setting,
      });
    }

    setTimeout(() => handleCancel(), 250);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    onFetch &&
      onFetch({
        applicationId,
        page: PAGE,
        size: SIZE,
        search: '',
        type: tab,
      });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const title = useMemo(() => {
    const typeTitleMap = {
      component: category.addComponent,
      template: category.addTemplate,
      page: category.addPage,
    };

    return typeTitleMap[type];
  }, [type, category]);

  return (
    <Modal
      bodyStyle={{
        height: 740,
      }}
      centered
      destroyOnClose
      maskClosable={false}
      title={title}
      open={visible}
      width="60%"
      okButtonProps={{
        disabled: objectEmptyCheck(selectedRowKeys),
      }}
      onCancel={handleCancel}
      onOk={handleConfirm}>
      <Header>
        <Tabs onChange={switchTab} style={{ visibility: type === 'component' ? 'visible' : 'hidden' }}>
          <TabPane key="component" tab={settingI18n.componentTab} />
          <TabPane key="block" tab={settingI18n.blockTab} />
        </Tabs>
        <Search
          allowClear
          placeholder={packageI18n.inputNameTips}
          onSearch={handleSearch}
          style={{ width: 250 }}
        />
      </Header>
      <Table
        columns={columns}
        dataSource={list}
        loading={loading}
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
          onChange: onSelectChange,
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
        onChange={handlePageChange}
      />
    </Modal>
  );
};

export default Main;
