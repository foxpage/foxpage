import React, { ReactNode, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

interface IProps extends React.IframeHTMLAttributes<any> {
  head?: ReactNode;
  body?: ReactNode;
  mountTarget?: string;
  zoom?: number;
  transformOrigin?: string;
  onLoaded?: () => void;
}

export const Iframe = (props: IProps) => {
  const [mounted, setMounted] = useState(false);
  const { head, body, mountTarget, zoom = 1, transformOrigin, onLoaded, ...rest } = props;
  let frame = useRef();
  // disable a link jump timeinterval
  let disableALinkInterval: any = null;

  useEffect(() => {
    return function() {
      clearInterval(disableALinkInterval);
    };
  }, []);

  const getDoc = () => {
    // @ts-ignore
    return frame?.current?.contentDocument as Document;
  };

  const getMountTarget = () => {
    const doc = getDoc();
    if (mountTarget) {
      return doc.querySelector(mountTarget);
    }
    return doc.body.children[0];
  };

  const handleFrameLoad = () => {
    setMounted(true);
    if (typeof onLoaded === 'function') {
      onLoaded();
    }
  };

  const renderFrameContents = () => {
    if (!mounted) {
      return null;
    }

    const doc = getDoc();
    // @ts-ignore
    const win = doc.defaultView || doc.parentView;

    if (!disableALinkInterval) {
      disableALinkInterval = setInterval(() => {
        const aList = [...Array.from(doc?.getElementsByTagName('a'))];
        aList.forEach((item) => {
          item.onclick = function stop() {
            return false;
          };
        });
      }, 1000);
    }

    const frameContentStyle = {
      transformOrigin,
      height: '100%',
      transform: '',
    };
    if (zoom !== 1) {
      frameContentStyle.transform = `scale(${zoom})`;
    }
    const contents = (
      <div className="frame-content" style={frameContentStyle}>
        {body}
      </div>
    );

    const mountTarget = getMountTarget();
    if (mountTarget) {
      return [ReactDOM.createPortal(head, doc.head), ReactDOM.createPortal(contents, mountTarget)];
    }

    return '';
  };

  return (
    <iframe
      id="component-viewer"
      name="component-viewer"
      title="Components viewer frame"
      {...rest}
      // @ts-ignore
      ref={frame}
      onLoad={handleFrameLoad}>
      {renderFrameContents()}
    </iframe>
  );
};
