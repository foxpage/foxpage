import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
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

const Container = styled.div`
  padding: 24px 24px 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Table = styled(AntTable)`
  .ant-table-pagination.ant-pagination {
    margin: 12px 0 0;
  }
`;

interface Type {
  type: string;
  applicationId: string;
  folderId: string;
  button: string;
  paginationInfo: Record<string, PaginationInfo>;
  dataSource: any;
  onDelete: (id: string, params: any) => void;
  onEdit: (type: string, entity?: any) => void;
  onFetch: (params: any) => void;
}

const Main: React.FC<Type> = (props) => {
  const {
    type,
    applicationId,
    folderId,
    button,
    paginationInfo,
    dataSource,
    onDelete,
    onEdit,
    onFetch,
  } = props;
  const [tab, setTab] = useState(TabEnum.project);
  const [search, setSearch] = useState<string>('');

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

  const pageInfo = useMemo(() => paginationInfo[type || 'condition'], [type, paginationInfo]);

  const params = useMemo(() => {
    let params: any = {
      applicationId,
      page: pageInfo?.page,
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
  }, [applicationId, folderId, pageInfo, tab, search]);

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

  const handleDelete = (id) => {
    if (id && typeof onDelete === 'function') onDelete(id, params);
  };

  const columns: any = [
    {
      title: global.nameLabel,
      dataIndex: 'name',
      key: 'name',
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
      width: 100,
      render: (_text: string, record: ConditionEntity | FuncEntity | VariableEntity) => (
        <>
          {tab === TabEnum.project ? (
            <>
              <Button
                size="small"
                shape="circle"
                icon={<EditOutlined />}
                onClick={() => onEdit('edit', record)}
                style={{ marginRight: 8 }}
              />
              <Popconfirm
                title={`${global.deleteMsg}${record.name}?`}
                okText={global.yes}
                cancelText={global.no}
                onConfirm={() => handleDelete(record.id)}>
                <Button size="small" shape="circle" icon={<DeleteOutlined />} />
              </Popconfirm>
            </>
          ) : (
            <Button
              size="small"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => onEdit('view', record)}
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
          <Input
            allowClear
            size="small"
            placeholder={global.inputSearchText}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 200, marginRight: 8 }}
          />
          {tab === TabEnum.project && (
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => onEdit('new')}>
              {button}
            </Button>
          )}
        </div>
      </Header>
      {dataSource && (
        <Table
          bordered={false}
          rowKey={(record: any) => record.contentId}
          columns={columns}
          dataSource={dataSource}
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
            handleFetchList(pagination.current, pagination.pageSize);
          }}
        />
      )}
    </Container>
  );
};
export default Main;
