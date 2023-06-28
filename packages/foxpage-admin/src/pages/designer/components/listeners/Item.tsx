import React, { Component } from 'react';

import { MinusOutlined } from '@ant-design/icons';
import { Drawer, Select } from 'antd';
import styled from 'styled-components';

import { EditContext } from '@foxpage/foxpage-component-editor-context';

import { Label } from '../group';

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
  margin-bottom: 10px;
  padding: 20px;
  background: #f0f0f0;
  border-bottom: 1px solid rgb(229, 229, 229);
`;

// TODO 类型调整
// @ts-ignore
export class Item extends Component<any, any> {
  static contextType = EditContext;
  // re-declare this in your class to be the React.ContextType of your static contextType
  context!: React.ContextType<typeof EditContext> & { components: any; editor: any };
  onEventSelect: ((value: any, option) => void) | undefined;

  constructor(props) {
    super(props);
    const { item } = props;
    this.state = {
      open: false,
      props: item.props,
    };
  }

  getComponentNameAndTypeById = (id) => {
    const { components } = this.context;
    for (let i = 0; i < components.length; i++) {
      if (id === components[i].id) {
        return {
          name: components[i].name,
          type: components[i].type,
        };
      }
    }
    return {};
  };

  getComponentEditorById = (id) => {
    const { components } = this.context;
    for (let i = 0; i < components.length; i++) {
      if (id === components[i].id) {
        return components[i].editor;
      }
    }
    return undefined;
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  onTargetChange = (id) => {
    const { name, type } = this.getComponentNameAndTypeById(id);
    this.setState({
      props: {
        id,
        name,
        type,
        props: {},
      },
    });
  };

  remove = () => {
    const { idx, itemRemove, name } = this.props;
    itemRemove(name, idx);
  };

  handlePropChange = (keys, value) => {
    const { props: componentProps = {} } = this.state.props || {};
    const keypath = keys.split('.');
    const key = keypath.pop();

    const props = keypath.reduce((a, c) => {
      // object exist check
      if (typeof a[c] !== 'undefined') return a[c];
      a[c] = {};
      return a[c];
    }, componentProps);

    // delete undefined props
    if (value === undefined) {
      delete props[key];
    } else {
      props[key] = value;
    }

    // submit entire edit props object
    this.setState({
      props,
    });
  };

  render() {
    const { item } = this.props;
    const { open, props } = this.state;
    const { components, editor: widget } = this.context;

    const editor = this.getComponentEditorById(props.id);
    const editorParams: any = {
      componentProps: props.props,
      propsChange: () => {},
      propChange: this.handlePropChange,
      editor: widget,
      nested: true,
    };

    return (
      <Root>
        <div style={{ display: 'flex' }}>
          <div style={{ flexGrow: 1, paddingRight: 10 }}>
            <Label>Event</Label>
            <Select onSelect={this.onEventSelect} style={{ width: '100%' }} value={item.type}>
              <Select.Option value="action.component.call">action.component.call</Select.Option>
              <Select.Option value="ubt">ubt</Select.Option>
            </Select>
          </div>
          <div style={{ flexGrow: 2 }}>
            <Label> </Label>
            <button
              onClick={() => {
                this.setState({ open: true });
              }}>
              Config
            </button>
          </div>
        </div>
        <RemoveBtn onClick={this.remove}>
          <MinusOutlined />
        </RemoveBtn>
        <Drawer title="Two-level Drawer" width={640} closable onClose={this.handleClose} open={open}>
          <div>
            <Select onSelect={this.onTargetChange} style={{ width: '100%' }} value={props.id}>
              {components &&
                components.map((component) => (
                  <Select.Option key={component.id} value={component.id}>
                    {component.name}
                  </Select.Option>
                ))}
            </Select>
            {editor && (
              <EditContext.Provider value={editorParams}>
                {
                  // @ts-ignore
                  <>{React.createElement(editor, editorParams)}</>
                }
              </EditContext.Provider>
            )}
          </div>
        </Drawer>
      </Root>
    );
  }
}
