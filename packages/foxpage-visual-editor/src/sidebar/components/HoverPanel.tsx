import React, { useContext } from 'react';

import MarkdownPreview from '@uiw/react-markdown-preview';
import { Popover } from 'antd';
import styled from 'styled-components';

import { FoxContext } from '@/context/index';
import { DragContent } from '@/dnd/index';
import { Component } from '@/types/index';

const Container = styled.div``;

const Item = styled.div`
  width: 50%;
  display: inline-block;
  padding: 6px;
  vertical-align: top;
  position: relative;
  transition: all 0.3s;
  border-radius: 4px;
  :hover {
    box-shadow: 0px 0px 4px #cecece;
  }
`;

const Title = styled.h2`
  margin: 0;
  font-size: 12px;
  position: relative;
`;

const Desc = styled.div`
  margin-bottom: 0;
  font-size: 12px;
  margin-top: 4px;
  height: 36px;
`;

const ImageContent = styled.div`
  position: relative;
  height: 60px;
  background: #f4f4f4;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: move;
  :hover {
    div[data-type='hover-toolbar'] {
      display: block;
    }
  }
`;

const DragPanel = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: #dadada;
  font-size: 20px;
  text-align: center;
  padding: 12px 0px;
  text-shadow: 1px 1px #b7b7b7;
`;

export const Overflow = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  width: 200px;
  white-space: pre-wrap;
`;

interface IProps {
  components: Component[];
}

const HoverPanel = (props: IProps) => {
  const { foxI18n } = useContext(FoxContext);
  const { components = [] } = props;

  return (
    <Container>
      {components.map((item) => {
        const { id, name, category } = item;
        const { description, screenshot, name: label } = category || {};
        const mark = `component_view_${id}`;
        return (
          <Popover
            key={name}
            placement="right"
            content={
              <div>
                <ImageContent style={{ width: 200, height: 100 }}>
                  {screenshot && <img src={screenshot} alt="" width="100%" />}
                  <DragPanel></DragPanel>
                </ImageContent>
                <div>
                  <Title>
                    <Overflow>
                      {label || name} ( {name} )
                    </Overflow>
                  </Title>
                  <Desc>
                    {description ? (
                      <MarkdownPreview style={{ fontSize: 12, maxHeight: 50 }} source={description} />
                    ) : (
                      <span style={{ color: '#999' }}>{foxI18n.componentDescTip}</span>
                    )}
                  </Desc>
                </div>
              </div>
            }>
            <Item key={id} id={mark}>
              <DragContent component={item}>
                <ImageContent>
                  {screenshot ? <img src={screenshot} alt="" width="100%" /> : <DragPanel>{label}</DragPanel>}
                </ImageContent>
              </DragContent>
              <div>
                <Title>
                  <Overflow style={{ width: 110 }}>{label || name}</Overflow>
                </Title>
              </div>
            </Item>
          </Popover>
        );
      })}
    </Container>
  );
};

export default HoverPanel;