import React, { Children } from 'react';

type ContentProps = {
  children?: any;
  contentDidMount: any;
  contentDidUpdate: any;
};

class Content extends React.Component<ContentProps> {
  componentDidMount() {
    this.props.contentDidMount();
  }

  componentDidUpdate() {
    this.props.contentDidUpdate();
  }

  render() {
    return Children.only(this.props.children);
  }
}

export default Content;
