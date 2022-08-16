import React, { Component } from 'react';

import { MinusOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Select } from 'antd';
import styled from 'styled-components';

import { EditContext } from '@foxpage/foxpage-component-editor-context';

import { ComponentCall } from './ComponentCall';

const Label = styled.div`
  font-weight: bold;
  font-size: 12px;
  margin-bottom: 5px;
`;

const RemoveBtn = styled.div`
  position: absolute;
  right: 10px;
  top: 5px;
  cursor: pointer;
  :hover {
    color: #1890ff;
  }
`;

const Root = styled.div`
  position: relative;
  margin-bottom: 16px;
  padding: 8px;
  background: #f0f0f0;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
`;

// @ts-ignore
export class Action extends Component<any, any> {
  static contextType = EditContext;

  constructor(props) {
    super(props);
  }

  changeTarget = (targetIdx, component) => {
    const { event, actionIdx, changeTarget } = this.props;
    if (changeTarget) {
      changeTarget(event, actionIdx, targetIdx, component);
    }
  };

  removeTarget = (targetIdx) => {
    const { event, actionIdx, removeTarget } = this.props;
    if (removeTarget) {
      removeTarget(event, actionIdx, targetIdx);
    }
  };

  applyTargetPropsChange = (targetIdx, props) => {
    const { event, actionIdx, applyTargetPropsChange } = this.props;
    if (applyTargetPropsChange) {
      applyTargetPropsChange(event, actionIdx, targetIdx, props);
    }
  };

  render() {
    const { actionIdx, removeAction, changeActionType, addActionComponentCall, action, event } = this.props;
    const { children: targets } = action || {};

    return (
      <Root>
        <div>
          <div>
            <Label>Action</Label>
            <Select
              onSelect={(value) => {
                if (changeActionType) {
                  changeActionType(event, actionIdx, value);
                }
              }}
              style={{ width: '100%' }}
              value={action.type}>
              <Select.Option value="action.component.call">action.component.call</Select.Option>
              {/* <Select.Option value="action.tracking">action.tracking</Select.Option> */}
            </Select>
          </div>
          <div style={{ paddingTop: 16 }}>
            <Label>Target</Label>
            {targets &&
              targets.map((target, targetIdx) => (
                <ComponentCall
                  targetIdx={targetIdx}
                  key={target.id}
                  target={target}
                  changeTarget={this.changeTarget}
                  removeTarget={this.removeTarget}
                  applyTargetPropsChange={this.applyTargetPropsChange}
                />
              ))}
            <div style={{ paddingTop: 8 }}>
              <Button
                size="small"
                onClick={() => {
                  if (addActionComponentCall) {
                    addActionComponentCall(event, actionIdx);
                  }
                }}>
                <PlusOutlined />
                Add Target
              </Button>
            </div>
          </div>
        </div>
        <RemoveBtn
          onClick={() => {
            removeAction(event, actionIdx);
          }}>
          <MinusOutlined />
        </RemoveBtn>
      </Root>
    );
  }
}
