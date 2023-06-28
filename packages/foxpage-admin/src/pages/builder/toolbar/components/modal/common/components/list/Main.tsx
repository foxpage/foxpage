import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  BugFilled,
  BugOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Input, Popconfirm, Radio, Table as AntTable } from 'antd';
import styled from 'styled-components';

import { ConditionTypeEnum } from '@/constants/condition';
import { GlobalContext } from '@/pages/system';
import { ConditionEntity, FuncEntity, PaginationInfo, VariableEntity } from '@/types/index';

import { ModalTypeEnum } from '../../Main';

enum TabEnum {
  project,
  application,
}

const { Search } = Input;

const PAGE_NUM = 1;

const Container = styled.div`
  padding: 16px 24px 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 16px 0 0;
  }
`;

export type RecordEntity = ConditionEntity | FuncEntity | VariableEntity;

interface Type {
  applicationId: string;
  button: string;
  dataSource: any;
  folderId: string;
  loadingInfo: Record<string, boolean>;
  mock: any;
  paginationInfo: Record<string, PaginationInfo>;
  type: string;
  onDelete: (id: string, params: any) => void;
  onEdit: (type: string, entity?: any) => void;
  onFetch: (params: any) => void;
}

const Main: React.FC<Type> = (props) => {
  const {
    applicationId,
    button,
    dataSource,
    folderId,
    loadingInfo,
    mock,
    paginationInfo,
    type,
    onDelete,
    onEdit,
    onFetch,
  } = props;
  const [tab, setTab] = useState(TabEnum.project);
  const [pageNum, setPageNum] = useState<number>(paginationInfo[type || 'condition'].page);
  const [search, setSearch] = useState('');

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  // radio options
  const radioOptions = [
    {
      label: global.project,
      value: 0,
    },
    {
      label: global.application,
      value: 1,
    },
  ];

  const loading = useMemo(() => loadingInfo[type || 'condition'], [type, loadingInfo]);

  const pageInfo = useMemo(() => paginationInfo[type || 'condition'], [type, paginationInfo]);

  const params = useMemo(() => {
    let params: any = {
      applicationId,
      page: pageNum,
      size: pageInfo?.size,
      search,
    };

    if (tab === TabEnum.project) {
      params = {
        ...params,
        folderId,
      };
    } else {
      params = {
        ...params,
        type: 'live',
      };
    }

    return params;
  }, [applicationId, folderId, pageInfo.size, pageNum, search, tab]);

  const handleFetchList = useCallback(
    (page?: number, size?: number) => {
      const _params = {
        ...params,
        page: page || params.page,
        size: size || params.size,
        search,
      };

      if (typeof onFetch === 'function') onFetch(_params);
    },
    [params],
  );

  useEffect(() => {
    handleFetchList();
  }, [tab, search]);

  const handleSearch = (search) => {
    setPageNum(PAGE_NUM);

    setSearch(search);
  };

  const handleGenerateType = useCallback(
    (entity) => {
      let entityType = '';

      if (type === ModalTypeEnum.condition) {
        entityType = ConditionTypeEnum[entity.content?.schemas?.[0]?.type || 0];
      }

      if (type === ModalTypeEnum.function) {
        entityType = entity.content?.schemas?.[0]?.props?.async ? 'async' : 'sync';
      }

      if (type === ModalTypeEnum.variable) {
        entityType = entity.content?.schemas?.[0]?.type || '--';
      }

      return entityType;
    },
    [type],
  );

  const handleDelete = (record: RecordEntity) => {
    if (record.id && typeof onDelete === 'function') onDelete(record.id, { ...params, entity: record });
  };

  const columns: any = [
    {
      title: global.idLabel,
      dataIndex: 'contentId',
      key: 'contentId',
      width: 160,
    },
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ConditionEntity | FuncEntity | VariableEntity) => (
        <>
          {name}
          {!!mock?.enable && !!mock?.schemas?.find((schema) => schema.id === record.contentId) && (
            <BugFilled style={{ color: '#FF5918', fontSize: 12, marginLeft: 4 }} />
          )}
        </>
      ),
    },
    {
      title: global.type,
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (_, record) => handleGenerateType(record),
    },
    {
      title: global.actions,
      dataIndex: '',
      key: '',
      width: 130,
      render: (_text: string, record: ConditionEntity | FuncEntity | VariableEntity) => (
        <>
          {tab === TabEnum.project ? (
            <>
              <Button
                size="small"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => onEdit('edit', record)}
              />
              <Popconfirm
                title={`${global.deleteMsg}${record.name}?`}
                okText={global.yes}
                cancelText={global.no}
                onConfirm={() => handleDelete(record)}>
                <Button size="small" shape="circle" icon={<DeleteOutlined />} style={{ margin: '0 8px' }} />
              </Popconfirm>
            </>
          ) : (
            <Button
              size="small"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => onEdit('view', record)}
              style={{ marginRight: 8 }}
            />
          )}
          {mock?.enable && type === ModalTypeEnum.variable && (
            <Button
              size="small"
              shape="circle"
              icon={<BugOutlined />}
              onClick={() => onEdit('mock', record)}
            />
          )}
        </>
      ),
    },
  ];

  return (
    <Container>
      <Header>
        <Radio.Group
          size="small"
          optionType="button"
          options={radioOptions}
          value={tab}
          onChange={(e) => setTab(e.target.value)}
        />
        <div>
          <Search
            size="small"
            placeholder={global.inputSearchText}
            defaultValue={search}
            onSearch={handleSearch}
            style={{ width: 200 }}
          />
          {tab === TabEnum.project && (
            <Button
              type="link"
              size="small"
              ghost
              icon={<PlusOutlined />}
              onClick={() => onEdit('new')}
              style={{ marginLeft: 8 }}>
              {button}
            </Button>
          )}
        </div>
      </Header>
      {dataSource && (
        <Table
          bordered={false}
          loading={loading}
          rowKey={(record: any) => record.contentId}
          columns={columns}
          dataSource={dataSource}
          pagination={
            pageInfo?.total && pageInfo.total > pageInfo.size
              ? {
                  position: ['bottomCenter'],
                  current: pageInfo.page,
                  pageSize: pageInfo.size,
                  total: pageInfo.total,
                  size: 'small',
                }
              : false
          }
          onChange={(pagination) => {
            handleFetchList(pagination.current, pagination.pageSize);
          }}
        />
      )}
    </Container>
  );
};
export default Main;
