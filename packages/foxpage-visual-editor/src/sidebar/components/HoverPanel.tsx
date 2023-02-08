import React, { useContext, useMemo, useRef } from 'react';

import { EyeOutlined } from '@ant-design/icons';
import { Popover } from 'antd';

import { FoxContext } from '@/context/index';
import { DragContent } from '@/dnd/index';
import { Component } from '@/types/index';

import ImageCard from './ImageCard';

const DragForbidden = ({ children }) => <div className="cursor-not-allowed user-select-none">{children}</div>;
const DragContainer = ({ disabled, component, children, ...restProps }) =>
  disabled ? (
    <DragForbidden>{children}</DragForbidden>
  ) : (
    <DragContent component={component} {...restProps}>
      {children}
    </DragContent>
  );
interface IProps {
  components: Component[];
}

const HoverPanel = (props: IProps) => {
  const { config } = useContext(FoxContext);
  const componentsRef = useRef(null);
  const components = useMemo(() => {
    return props.components.sort((a, b) => {
      if (((a.category || { sort: 0 }).sort || 0) > ((b.category || { sort: 0 }).sort || 0)) {
        return 1;
      } else {
        return -1;
      }
    });
  }, [props.components]);
  return (
    <div className="components" ref={componentsRef}>
      {components.map((item) => {
        const { id, name, category } = item;
        const { screenshot, name: label } = category || {};
        const mark = `component_view_${id}`;
        const disabled = item?.__extentions?.disabled;

        return (
          <div
            className={`relative w-6/12 inline-block p-1.5 align-top transition-all duration-300${
              !disabled ? ' hover:cursor-move hover:scale-110' : ''
            }`}
            key={id}
            id={mark}>
            {!disabled && (
              <Popover
                key={name}
                placement="right"
                trigger="click"
                getPopupContainer={() => componentsRef.current || document.body}
                content={
                  <div className="w-80">
                    <ImageCard isDetail={true} screenshot={screenshot} title={label || name} />

                    {/* <div className="mb-0 text-xs mt h-9 flex p-2">
                      {description ? (
                        <MarkdownPreview style={{ fontSize: 12, maxHeight: 50 }} source={description} />
                      ) : (
                        <span className="text-[#999]">{foxI18n.componentDescTip}</span>
                      )}
                    </div> */}
                  </div>
                }>
                <EyeOutlined className="text-white font-medium absolute right-3 top-3 z-[100] " />
              </Popover>
            )}
            <DragContainer disabled={disabled || !!config.sys?.readOnly} component={item}>
              <ImageCard isDetail={false} screenshot={screenshot} title={label || name} />
            </DragContainer>
          </div>
        );
      })}
    </div>
  );
};

export default HoverPanel;
