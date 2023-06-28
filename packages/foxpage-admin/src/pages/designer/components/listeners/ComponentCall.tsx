import React, { Component } from 'react';

import { EditOutlined, LeftOutlined, MinusOutlined } from '@ant-design/icons';
import { Button, Drawer as AntDrawer, Select, Tooltip } from 'antd';
import cloneDeep from 'lodash/cloneDeep';
import styled from 'styled-components';

import { EditContext } from '@foxpage/foxpage-component-editor-context';

const Drawer = styled(AntDrawer)`
  & .ant-drawer-body {
    padding: 0;
  }
`;

const TitBar = styled.div`
  box-sizing: border-box;
  background: #fff;
  text-align: center;
  line-height: 48px;
  height: 48px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  position: relative;
`;

const BackBtn = styled.div`
  padding-left: 8px;
  float: left;
`;

const Content = styled.div`
  overflow-y: auto;
  height: 100%;
`;

const ActionBtn = styled.div`
  float: right;
  line-height: 1;
  padding: 8px;
`;

// @ts-ignore
export class ComponentCall extends Component<any, any> {
  static contextType = EditContext;
  // re-declare this in your class to be the React.ContextType of your static contextType
  context!: React.ContextType<typeof EditContext> & { components: any; editor: any };

  constructor(props) {
    super(props);
    this.state = {
      open: false,
      props: {},
    };
  }

  componentDidMount() {
    const { target } = this.props;
    if (target) {
      this.setState({ props: target.props });
    }
  }

  getComponentById = (id) => {
    const { components } = this.context;
    if (components && components.length) {
      for (let i = 0; i < components.length; i++) {
        if (id === components[i].id) {
          return components[i];
        }
      }
    }
    return undefined;
  };

  handleChangeTarget = (id) => {
    const { changeTarget, targetIdx } = this.props;
    const component = this.getComponentById(id);
    this.setState({
      props: {},
    });
    if (changeTarget) {
      changeTarget(targetIdx, {
        id: component.id,
        name: component.name,
        props: {},
      });
    }
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handlePropChange = (keys, value) => {
    const { props: componentProps = {} } = this.state;
    const newComponentProps = cloneDeep(componentProps);
    const keypath = keys.split('.');
    const key = keypath.pop();

    const props = keypath.reduce((a, c) => {
      // object exist check
      if (typeof a[c] !== 'undefined') return a[c];
      a[c] = {};
      return a[c];
    }, newComponentProps);

    // delete undefined props
    if (value === undefined) {
      delete props[key];
    } else {
      props[key] = value;
    }

    // submit entire edit props object
    this.setState({
      props: newComponentProps,
    });
  };

  handleApplyPropsChange = () => {
    const { targetIdx, applyTargetPropsChange } = this.props;
    const { props } = this.state;
    if (applyTargetPropsChange) {
      applyTargetPropsChange(targetIdx, props);
      this.setState({
        open: false,
      });
    }
  };

  render() {
    const { target, targetIdx, removeTarget } = this.props;
    const { open, props } = this.state;
    const { components, editor: widgets } = this.context;
    const component = this.getComponentById(target.id);
    const value = component ? target.id : '';

    const editor = component && component.editor;
    const editorParams = {
      componentProps: props || {},
      propsChange: () => {},
      propChange: this.handlePropChange,
      editor: widgets,
      widgets,
      noListener: true,
      applyState: () => {},
      onBindVariable: () => {},
    };

    return (
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: 'flex' }}>
          <Select onSelect={this.handleChangeTarget} style={{ width: '167px', marginRight: 4 }} value={value}>
            {components &&
              components.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  <Tooltip placement="top" title={item.label}>
                    {item.label}
                  </Tooltip>
                </Select.Option>
              ))}
          </Select>
          <Button
            style={{ marginRight: 4, padding: '4px 8px' }}
            onClick={() => {
              this.setState({ open: true });
            }}>
            <EditOutlined />
          </Button>
          <Button
            style={{ padding: '4px 8px' }}
            onClick={() => {
              removeTarget(targetIdx);
            }}>
            <MinusOutlined />
          </Button>
        </div>
        <Drawer width={640} closable={false} onClose={this.handleClose} open={open}>
          <TitBar>
            <BackBtn>
              <Button onClick={this.handleClose}>
                <LeftOutlined />
              </Button>
            </BackBtn>
            Edit Target Props
            <ActionBtn>
              <Button
                type="primary"
                onClick={() => {
                  this.handleApplyPropsChange();
                }}>
                Apply
              </Button>
            </ActionBtn>
          </TitBar>
          <Content>
            {editor ? (
              <div>
                <EditContext.Provider value={editorParams}>
                  {React.createElement(editor, editorParams)}
                </EditContext.Provider>
              </div>
            ) : (
              <div style={{ padding: 24, textAlign: 'center' }}>No Editor found</div>
            )}
          </Content>
        </Drawer>
      </div>
    );
  }
}
