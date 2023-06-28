import React, { Component } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Collapse } from 'antd';

import { Action } from './Action';

export class Listener extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      event,
      actions,
      removeAction,
      changeActionType,
      addActionComponentCall,
      removeTarget,
      changeTarget,
      applyTargetPropsChange,
      addAction,
    } = this.props;
    const { fold } = this.props;

    return (
      <Collapse defaultActiveKey={fold ? [] : event}>
        <Collapse.Panel header={event} key={event}>
          {actions &&
            actions.map((action, actionIdx) => (
              <Action
                removeAction={removeAction}
                changeActionType={changeActionType}
                addActionComponentCall={addActionComponentCall}
                changeTarget={changeTarget}
                removeTarget={removeTarget}
                applyTargetPropsChange={applyTargetPropsChange}
                actionIdx={actionIdx}
                event={event}
                action={action}
                key={action.id}
              />
            ))}
          <Button
            size="small"
            onClick={() => {
              if (addAction) {
                addAction(event);
              }
            }}
          >
            <PlusOutlined />
            Add Action
          </Button>
        </Collapse.Panel>
      </Collapse>
    );
  }
}
