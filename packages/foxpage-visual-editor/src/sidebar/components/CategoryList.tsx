import React from 'react';

import { Collapse } from 'antd';
import styled from 'styled-components';

import { Component } from '@/types/index';

import HoverPanel from './HoverPanel';

import './popupStyles.css';
import './collapse.css';

const { Panel } = Collapse;

const Container = styled.div``;

const CategoryContainer = styled.div``;

const CategoryTitle = styled.p`
  margin: 0;
`;

const GroupContainer = styled.ul`
  margin: 0px;
  padding: 0px;
  list-style: none;
`;

const GroupName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  font-size: 12px;
`;

const CusCollapse = styled(Collapse)`
  padding: 0;
  .ant-collapse-header {
    padding: 6px 12px !important;
  }
  .ant-collapse-header-text {
    line-height: 20px;
  }
  .ant-collapse-content-box {
    padding: 0 12px !important;
  }
  .ant-collapse-arrow {
    transform: scale(0.8);
    line-height: 18px;
    position: relative;
    top: -1px;
    margin-right: 4px !important;
  }
`;

export type Category = Record<string, Record<string, Component[]>>;

interface IProps {
  category?: Category;
}

const ComponentCategoryList = (props: IProps) => {
  const { category = {} } = props;

  const categories = Object.keys(category);

  return (
    <Container>
      <CusCollapse defaultActiveKey={categories} ghost className="foxpage-component-collapse">
        {categories.map((categoryKey) => {
          const group = category[categoryKey];
          const groups = Object.keys(group);
          return (
            <Panel header={<CategoryTitle>{categoryKey}</CategoryTitle>} key={categoryKey}>
              <CategoryContainer key={categoryKey}>
                <GroupContainer>
                  <CusCollapse defaultActiveKey={groups} ghost className="foxpage-component-collapse">
                    {groups.map((groupName) => {
                      const components = group[groupName];
                      return (
                        <Panel header={<GroupName>{groupName}</GroupName>} key={groupName}>
                          <HoverPanel components={components} />
                        </Panel>
                      );
                    })}
                  </CusCollapse>
                </GroupContainer>
              </CategoryContainer>
            </Panel>
          );
        })}
      </CusCollapse>
    </Container>
  );
};

export default ComponentCategoryList;
