import React, { Component } from 'react';

import shortid from 'shortid';

import { EditContext } from '@foxpage/foxpage-component-editor-context';

import { Listener } from './Listener';

// @ts-ignore
export class Listeners extends Component<any, any> {
  static contextType = EditContext;
  // re-declare this in your class to be the React.ContextType of your static contextType
  context!: React.ContextType<typeof EditContext> & {
    components: any;
    editor: any;
    noListener: boolean;
  };

  componentDidMount() {
    const { noListener } = this.context;
    if (!noListener) {
      const { propKey } = this.props;
      const { componentProps, propChange } = this.context;

      let listensers = {};
      if (componentProps['__listeners']) {
        listensers = componentProps['__listeners'];
      } else if (Array.isArray(propKey)) {
        for (let i = 0; i < propKey.length; i++) {
          listensers[propKey[i]] = [];
        }
      }

      propChange('__listeners', listensers);
    }
  }

  handleAddAction = (event) => {
    const { componentProps, propChange } = this.context;
    const listensers = componentProps['__listeners'] || {};
    const listenser = listensers[event] || [];
    listenser.push({
      id: shortid.generate(),
      type: 'action.component.call',
      children: [],
    });
    propChange(`__listeners.${event}`, listenser);
  };

  handleChangeActionType = (event, idx, value) => {
    const { componentProps, propChange } = this.context;
    const listensers = componentProps['__listeners'] || {};
    const listenser = listensers[event] || [];
    listenser[idx].type = value;
    propChange(`__listeners.${event}`, listenser);
  };

  handleRemoveAction = (event, idx) => {
    const { componentProps, propChange } = this.context;
    const listensers = componentProps['__listeners'] || {};
    const listenser = listensers[event] || [];
    listenser.splice(idx, 1);
    propChange(`__listeners.${event}`, listenser);
  };

  handleAddActionComponentCall = (event, actionIdx) => {
    const { componentProps, propChange } = this.context;
    const listensers = componentProps['__listeners'] || {};
    const listenser = listensers[event] || [];
    listenser[actionIdx].children.push({
      id: shortid.generate(),
      type: undefined,
      props: {},
    });
    propChange(`__listeners.${event}`, listenser);
  };

  handleChangeTarget = (event, actionIdx, targetIdx, component) => {
    const { componentProps, propChange } = this.context;
    const listensers = componentProps['__listeners'] || {};
    const listenser = listensers[event] || [];
    listenser[actionIdx].children[targetIdx] = component;
    propChange(`__listeners.${event}`, listenser);
  };

  handleRemoveTarget = (event, actionIdx, targetIdx) => {
    const { componentProps, propChange } = this.context;
    const listensers = componentProps['__listeners'] || {};
    const listenser = listensers[event] || [];
    listenser[actionIdx].children.splice(targetIdx, 1);
    propChange(`__listeners.${event}`, listenser);
  };

  handleTargetApplyPropsChange = (event, actionIdx, targetIdx, props) => {
    const { componentProps, propChange } = this.context;
    const listensers = componentProps['__listeners'] || {};
    const listenser = listensers[event] || [];
    listenser[actionIdx].children[targetIdx].props = props;
    propChange(`__listeners.${event}`, listenser);
  };

  render() {
    const { propKey } = this.props;
    const { componentProps, noListener } = this.context;

    let listensers = {};
    if (componentProps['__listeners']) {
      listensers = componentProps['__listeners'];
    } else if (Array.isArray(propKey)) {
      for (let i = 0; i < propKey.length; i++) {
        listensers[propKey[i]] = [];
      }
    }

    if (noListener) {
      return null;
    }

    return (
      <>
        {Object.keys(listensers).map((event, idx) => (
          <Listener
            event={event}
            idx={idx}
            actions={listensers[event]}
            key={event}
            changeActionType={this.handleChangeActionType}
            addAction={this.handleAddAction}
            removeAction={this.handleRemoveAction}
            addActionComponentCall={this.handleAddActionComponentCall}
            changeTarget={this.handleChangeTarget}
            removeTarget={this.handleRemoveTarget}
            applyTargetPropsChange={this.handleTargetApplyPropsChange}
          />
        ))}
      </>
    );
  }
}
