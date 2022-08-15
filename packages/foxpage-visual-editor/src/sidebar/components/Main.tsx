import React, { useContext, useEffect, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Empty, Input } from 'antd';
import styled from 'styled-components';

import { Scrollbar } from '@/components/index';
import { FoxContext } from '@/context/index';

import ComponentCategory, { Category } from './CategoryList';

const Container = styled.div`
  height: 100%;
`;

const SearchBox = styled.div`
  padding: 2px 12px;
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid #f2f2f2;
`;

const ListPanel = styled(Scrollbar)`
  height: calc(100% - 35px);
  padding: 4px 0 50px 0;
`;

const Link = styled.a`
  text-align: center;
  display: inherit;
  color: #656565;
  font-size: 12px;
`;

const ComponentList = () => {
  const [category, setCategory] = useState<Category | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const { foxI18n, components, config, events } = useContext(FoxContext);
  const { onLinkChange } = events;

  const showList = components
    .filter((item) => !!item.category?.categoryName)
    .sort((a, b) => (a.category?.sort || 0) - (b.category?.sort || 0));

  useEffect(() => {
    if (components) {
      const _list = searchText
        ? showList.filter(
            (item) => item.name?.indexOf(searchText) > -1 || item.label?.indexOf(searchText) > -1,
          )
        : showList;

      const _category: Category = {};
      if (_list.length > 0) {
        _list.forEach((item) => {
          const { categoryName: name, groupName } = item.category || {};
          if (name && groupName) {
            if (!_category[name]) {
              _category[name] = {};
            }
            if (!_category[name][groupName]) {
              _category[name][groupName] = [];
            }
            _category[name][groupName].push(item);
          }
        });
        setCategory(_category);
      } else {
        setCategory(null);
      }
    } else {
      setCategory(null);
    }
  }, [components, searchText]);

  const handleLink = () => {
    if (typeof onLinkChange === 'function') {
      onLinkChange(`/applications/${config?.app?.appId}/packages/list`);
    }
  };

  return (
    <Container>
      <SearchBox>
        <SearchOutlined style={{ lineHeight: '30px', color: '#bfbfbf' }} />
        <Input
          size="middle"
          bordered={false}
          placeholder={foxI18n.componentSearch}
          style={{ fontSize: '12px' }}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
      </SearchBox>

      <ListPanel>
        {category ? (
          <ComponentCategory category={category} />
        ) : (
          <>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
            {!!config.app?.appId && <Link onClick={handleLink}>{foxI18n.componentAddLink}</Link>}
          </>
        )}
      </ListPanel>
    </Container>
  );
};

export default ComponentList;
