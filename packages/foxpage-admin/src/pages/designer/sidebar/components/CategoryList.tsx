import React from 'react';

import { Collapse } from 'antd';

import { Component } from '@/types/index';

import HoverPanel from './HoverPanel';

const { Panel } = Collapse;

export type Category = Record<string, Record<string, Component[]>>;

interface IProps {
  category?: Category;
}

const ComponentCategoryList = (props: IProps) => {
  const { category = {} } = props;

  const categories = Object.keys(category);

  return (
    <>
      <Collapse defaultActiveKey={categories} ghost className="foxpage-component-collapse p-0">
        {categories.map((categoryKey) => {
          const group = category[categoryKey];
          const groups = Object.keys(group);
          return (
            <Panel header={<p className="m-0 text-sm font-medium">{categoryKey}</p>} key={categoryKey}>
              <ul className="m-0 p-0 list-none">
                <Collapse defaultActiveKey={groups} ghost className="foxpage-component-collapse p-0">
                  {groups.map((groupName) => {
                    const components = group[groupName];
                    return (
                      <Panel
                        className="py-0"
                        header={
                          <div className="overflow-hidden text-ellipsis whitespace-nowrap relative text-sm">
                            {groupName}
                          </div>
                        }
                        key={groupName}>
                        <HoverPanel components={components} />
                      </Panel>
                    );
                  })}
                </Collapse>
              </ul>
            </Panel>
          );
        })}
      </Collapse>
    </>
  );
};

export default ComponentCategoryList;
