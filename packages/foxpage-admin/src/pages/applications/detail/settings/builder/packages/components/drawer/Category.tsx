import React, { useContext, useEffect, useState } from 'react';

import { BarsOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Select, Tooltip } from 'antd';
import styled from 'styled-components';

import { GlobalContext } from '@/pages/system';
import { CategoryType } from '@/types/index';

const { Option } = Select;

const FlexRow = styled.div`
  display: flex;
  > div {
    flex: 1;
  }
`;

const Col = styled.div`
  display: flex;
  > div {
    flex-grow: 1;
  }
`;

interface IProps {
  categoryName: string;
  groupName: string;
  categories: CategoryType[];
  onChange: (key: string, value: string) => void;
}

function Category(props: IProps) {
  const [levelOneStatus, setLevelOneStatus] = useState(true);
  const [levelTwoStatus, setLevelTwoStatus] = useState(true);
  const [groups, setGroups] = useState<string[]>([]);
  const { locale } = useContext(GlobalContext);
  const { category: i18n } = locale.business;
  const { categoryName, groupName, categories = [], onChange } = props;

  useEffect(() => {
    const _category = categories.find((item) => item.categoryName === categoryName);
    if (categoryName && _category) {
      setGroups(_category.groupNames);
    } else {
      setGroups([]);
    }
  }, [categoryName, categories]);

  const handleChange = (key, value) => {
    if (value.indexOf('.') > -1) {
      return;
    }
    onChange(key, value);
  };

  return (
    <div>
      <FlexRow style={{ fontSize: '12px', color: '#828181' }}>
        <div style={{ marginRight: 16 }}>
          {i18n.levelOne} <span style={{ color: 'red' }}>*</span>
        </div>
        <div style={{ marginLeft: 16 }}>
          {i18n.levelTwo} <span style={{ color: 'red' }}>*</span>
        </div>
      </FlexRow>
      <FlexRow>
        <Col style={{ marginRight: 16 }}>
          {levelOneStatus ? (
            <Select
              style={{ width: '100%' }}
              value={categoryName}
              placeholder="Select category"
              onChange={(value) => handleChange('categoryName', value)}>
              {categories
                .filter((category) => !!category.categoryName)
                .map((item) => (
                  <Option key={item.categoryName}>{item.categoryName}</Option>
                ))}
            </Select>
          ) : (
            <Input
              value={categoryName}
              style={{ width: '100%' }}
              placeholder="Input category"
              onChange={(e) => handleChange('categoryName', e.target.value)}
            />
          )}
          <Tooltip title={`Change to ${levelOneStatus ? 'customize' : 'select'} mode`}>
            <Button
              style={{ marginLeft: 2, fontSize: '12px' }}
              onClick={() => setLevelOneStatus(!levelOneStatus)}>
              {levelOneStatus ? <EditOutlined /> : <BarsOutlined />}
            </Button>
          </Tooltip>
        </Col>
        <Col style={{ marginLeft: 16 }}>
          {levelTwoStatus ? (
            <Select
              style={{ width: '100%' }}
              value={groupName}
              placeholder="Select category"
              onChange={(value) => handleChange('groupName', value)}>
              {groups.map((item) => (
                <Option key={item}>{item}</Option>
              ))}
            </Select>
          ) : (
            <Input
              value={groupName}
              style={{ width: '100%' }}
              placeholder="Input category"
              onChange={(e) => handleChange('groupName', e.target.value)}
            />
          )}
          <Tooltip placement="topLeft" title={`Change to ${levelTwoStatus ? 'customize' : 'select'} mode`}>
            <Button
              style={{ marginLeft: 2, fontSize: '12px' }}
              onClick={() => setLevelTwoStatus(!levelTwoStatus)}>
              {levelTwoStatus ? <EditOutlined /> : <BarsOutlined />}
            </Button>
          </Tooltip>
        </Col>
      </FlexRow>
    </div>
  );
}

export default Category;
