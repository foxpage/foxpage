import React, { useMemo, useRef } from 'react';

import { EyeOutlined } from '@ant-design/icons';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { Popover } from 'antd';

import { Component } from '@/types/index';

import { useFoxpageContext } from '../../context';
import { DragContent } from '../../dnd';

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
  const { config, foxI18n } = useFoxpageContext();
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
        const { id, name, category, deprecated } = item;
        const { screenshot, name: label, description } = category || {};
        const mark = `component_view_${id}`;
        const disabled = item?.__extentions?.disabled || deprecated;
        const title = (
          <span>
            <span>{label || name}</span>
          </span>
        );
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
                    <ImageCard isDetail={true} screenshot={screenshot} title={title} />

                    <div className="mb-0 text-xs mt flex p-2 max-h-96 overflow-y-auto">
                      {description ? (
                        <MarkdownPreview
                          style={{ fontSize: 12 }}
                          source={description}
                          linkTarget={'_blank'}
                          transformLinkUri={(href) => {
                            if (href.includes('http') || href.includes('https'))
                              return href.replaceAll("'", '');

                            return 'javascript:void(0)';
                          }}
                        />
                      ) : (
                        <span className="text-[#999]">{foxI18n.componentDescTip}</span>
                      )}
                    </div>
                  </div>
                }>
                <EyeOutlined className="text-white font-medium absolute right-3 top-3 z-[100] " />
              </Popover>
            )}
            {deprecated && (
              <span className="absolute top-3 left-3 z-[100] text-xs h-1.5 text-center text-red-800">
                {foxI18n.deprecated}
              </span>
            )}
            <DragContainer disabled={disabled || !!config.sys?.readOnly} component={item}>
              <ImageCard isDetail={false} screenshot={screenshot} title={title} />
            </DragContainer>
          </div>
        );
      })}
    </div>
  );
};

export default HoverPanel;
