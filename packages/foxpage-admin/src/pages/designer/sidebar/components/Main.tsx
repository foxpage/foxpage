import React, { useEffect, useState } from 'react';

import { SearchOutlined } from '@ant-design/icons';
import { Button, Empty, Input } from 'antd';

import { useFoxpageContext } from '../../context';

import ComponentCategory, { Category } from './CategoryList';

const ComponentList = () => {
  const [category, setCategory] = useState<Category | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const { foxI18n, components, config, events } = useFoxpageContext();
  const { onLinkChange } = events;

  const showList = components
    .filter((item) => item.status && !!item.category?.categoryName)
    .sort((a, b) => (b.category?.sort || 0) - (a.category?.sort || 0));

  useEffect(() => {
    if (components) {
      const _list = searchText
        ? showList.filter((item) => {
            const value = searchText.toLowerCase();
            return (
              item.name?.toLowerCase().indexOf(value) > -1 ||
              item.label?.toLowerCase().indexOf(value) > -1 ||
              item.category?.name?.toLowerCase().includes(value)
            );
          })
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
    <>
      <div className="px-3 py-1 flex border-b border-b-colid border-b-gray-100 items-center">
        <SearchOutlined className="text-gray-200" />
        <Input
          size="middle"
          bordered={false}
          placeholder={foxI18n.componentSearch}
          style={{ fontSize: '12px' }}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
      </div>

      <div className="component-list flex flex-col overflow-auto flex-1 min-h-0">
        {category ? (
          <ComponentCategory category={category} />
        ) : (
          <>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="h-full flex flex-col items-center justify-center">
              {!!config.app?.appId && (
                <Button type="primary" onClick={handleLink}>
                  {foxI18n.componentAddLink}
                </Button>
              )}
            </Empty>
          </>
        )}
      </div>
    </>
  );
};

export default ComponentList;
