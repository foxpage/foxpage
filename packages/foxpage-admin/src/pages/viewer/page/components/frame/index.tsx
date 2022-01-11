import React, { Component, CSSProperties } from 'react';
import ReactDOM from 'react-dom';

import PropTypes from 'prop-types';

import Content from './Content';

export default class Frame extends Component<any> {
  static propTypes = {
    zoom: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    style: PropTypes.object,
    mountTarget: PropTypes.string,
    transformOrigin: PropTypes.string,
    frameLoaded: PropTypes.func,
    frameMounted: PropTypes.func,
    contentDidMount: PropTypes.func,
    contentDidUpdate: PropTypes.func,
    childrens: PropTypes.arrayOf(PropTypes.element),
  };

  static defaultProps = {
    style: {},
    childrens: [],
    mountTarget: undefined,
    zoom: 1,
    transformOrigin: 'center',
    contentDidMount: () => { },
    contentDidUpdate: () => { },
    frameLoaded: (_win: Window) => { },
    frameMounted: () => { },
  };
  _isMounted: boolean;
  disableALinkInterval: any;
  node: any;

  constructor(props: any) {
    super(props);
    this._isMounted = false;
    this.disableALinkInterval = null; // disable a link jump timeinterval
  }

  componentDidMount() {
    this._isMounted = true;

    const doc = this.getDoc();
    const win = doc.defaultView || doc.parentView;

    this.props.frameMounted(win);
    if (doc && doc.readyState === 'complete') {
      this.forceUpdate();
    } else {
      this.node.addEventListener('load', this.handleLoad);
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    this.node.removeEventListener('load', this.handleLoad);
    clearInterval(this.disableALinkInterval);
  }

  getDoc() {
    return this.node.contentDocument;
  }

  getMountTarget() {
    const doc = this.getDoc();
    if (this.props.mountTarget) {
      return doc.querySelector(this.props.mountTarget);
    }
    return doc.body.children[0];
  }

  handleLoad = () => {
    this.forceUpdate();
  };

  renderFrameContents() {
    if (!this._isMounted) {
      return null;
    }

    const doc = this.getDoc();

    const { contentDidMount, contentDidUpdate } = this.props;
    const win = doc.defaultView || doc.parentView;
    win.onload = () => {
      this.props.frameLoaded(win);
      this.forceUpdate();
    };

    if (!this.disableALinkInterval) {
      this.disableALinkInterval = setInterval(() => {
        const aList = [...this.getDoc().getElementsByTagName('a')];
        aList.forEach(item => {
          item.onclick = function stop() {
            return false;
          };
        });
      }, 1000);
    }

    const heads = this.props.childrens[0];

    const frameContentStyle: CSSProperties = {
      height: '100%',
    };

    const { zoom } = this.props;
    if (zoom !== 1) {
      frameContentStyle.transform = `scale(${zoom})`;
      frameContentStyle.transformOrigin = zoom > 1 ? '0 0' : '50% 50%';
    }

    const contents = (
      <Content contentDidMount={contentDidMount} contentDidUpdate={contentDidUpdate}>
        <div className="frame-content" style={{ ...frameContentStyle }}>
          {this.props.childrens[1]}
        </div>
      </Content>
    );

    const mountTarget = this.getMountTarget();

    if (mountTarget) {
      return [ReactDOM.createPortal(heads, this.getDoc().head), ReactDOM.createPortal(contents, mountTarget)];
    }

    return 'loading...';
  }

  render() {
    const props: any = {
      ...this.props,
      childrens: undefined,
    };
    delete props.mountTarget;
    delete props.contentDidMount;
    delete props.contentDidUpdate;
    delete props.frameLoaded;
    delete props.frameMounted;
    delete props.zoom;
    delete props.transformOrigin;
    return (
      <iframe
        id="main-view"
        name="main-view"
        title="Components viewer frame"
        {...props}
        ref={node => (this.node = node)}
      >
        {this.renderFrameContents()}
      </iframe>
    );
  }
}
