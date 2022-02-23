import React, { useContext } from 'react';

import { InputNumber } from 'antd';
import styled from 'styled-components';

import viewerContext from '../../viewerContext';

import { BoxType } from './index.d';

const StyledInputNumber = styled(InputNumber)`
  position: absolute !important;
  height: 20px;
  background: transparent;
  border: none !important;
  box-shadow: none !important;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  width: 40px !important;
`;

const BoxContainer = styled.div`
  position: relative;
  width: 100%;
  height: 120px;
  box-sizing: border-box;
  > div {
    box-sizing: border-box;
    transition: all 0.3s ease;
    position: absolute;
    text-align: center;
    .ant-input-number-handler-wrap {
      display: none;
    }
    .ant-input-number-sm input {
      text-align: center;
      width: 40px;
    }
  }
`;
const MarginTopDiv = styled.div`
  top: 0;
  left: 0;
  right: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 20px solid #d6e4ff;
  &:hover {
    border-top: 20px solid #bfd4fb;
  }
`;

const MarginRightDiv = styled.div`
  top: 5px;
  bottom: 5px;
  right: 0;
  width: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-right: 20px solid #d6e4ff;
  &:hover {
    border-right: 20px solid #bfd4fb;
  }
`;

const MarginBottomDiv = styled.div`
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 20px solid #d6e4ff;
  &:hover {
    border-bottom: 20px solid #bfd4fb;
  }
`;

const MarginLeftDiv = styled.div`
  top: 5px;
  bottom: 5px;
  left: 0;
  width: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-left: 20px solid #d6e4ff;
  &:hover {
    border-left: 20px solid #bfd4fb;
  }
`;

const PaddingTopDiv = styled.div`
  top: 25px;
  left: 25px;
  right: 25px;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-top: 20px solid #d6e4ff;
  &:hover {
    border-top: 20px solid #bfd4fb;
  }
`;

const PaddingRightDiv = styled.div`
  top: 30px;
  bottom: 30px;
  right: 25px;
  width: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-right: 20px solid #d6e4ff;
  &:hover {
    border-right: 20px solid #bfd4fb;
  }
`;

const PaddingBottomDiv = styled.div`
  bottom: 25px;
  left: 25px;
  right: 25px;
  height: 0;
  border-left: 20px solid transparent;
  border-right: 20px solid transparent;
  border-bottom: 20px solid #d6e4ff;
  &:hover {
    border-bottom: 20px solid #bfd4fb;
  }
`;

const PaddingLeftDiv = styled.div`
  top: 30px;
  bottom: 30px;
  left: 25px;
  width: 0;
  border-top: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-left: 20px solid #d6e4ff;
  &:hover {
    border-left: 20px solid #bfd4fb;
  }
`;

const HelpText = styled.div`
  float: left;
  margin-left: -10px;
  transform: scale(0.75);
`;

const Box: React.FC<BoxType> = props => {
  const {
    paddingLeft,
    paddingRight,
    paddingTop,
    paddingBottom,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    onChange = (_val: number | string) => {},
    onApplyState = (_key: string, _val: string) => {},
  } = props;
  const { foxpageI18n } = useContext(viewerContext);
  return (
    <BoxContainer>
      <MarginTopDiv>
        <StyledInputNumber
          style={{ top: -20 }}
          placeholder="0"
          size="small"
          bordered={false}
          value={marginTop}
          onChange={(val: number | string) => {
            onChange('marginTop', val);
          }}
          onBlur={(e: any) => {
            onApplyState('marginTop', e.target.value);
          }}
        />
      </MarginTopDiv>
      <MarginRightDiv>
        <StyledInputNumber
          style={{ top: 'calc(50% - 10px)', right: -8, left: 'auto', transform: 'translateX(50%)' }}
          placeholder="0"
          size="small"
          bordered={false}
          value={marginRight}
          onChange={(val: number | string) => {
            onChange('marginRight', val);
          }}
          onBlur={(e: any) => {
            onApplyState('marginRight', e.target.value);
          }}
        />
      </MarginRightDiv>
      <MarginBottomDiv>
        <HelpText>{foxpageI18n.margin}</HelpText>
        <StyledInputNumber
          style={{ top: 0 }}
          placeholder="0"
          size="small"
          bordered={false}
          value={marginBottom}
          onChange={(val: number | string) => {
            onChange('marginBottom', val);
          }}
          onBlur={(e: any) => {
            onApplyState('marginBottom', e.target.value);
          }}
        />
      </MarginBottomDiv>
      <MarginLeftDiv>
        <StyledInputNumber
          style={{ top: 'calc(50% - 10px)', left: -10 }}
          placeholder="0"
          size="small"
          bordered={false}
          value={marginLeft}
          onChange={(val: number | string) => {
            onChange('marginLeft', val);
          }}
          onBlur={(e: any) => {
            onApplyState('marginLeft', e.target.value);
          }}
        />
      </MarginLeftDiv>
      <PaddingTopDiv>
        <StyledInputNumber
          style={{ top: -20 }}
          placeholder="0"
          size="small"
          bordered={false}
          value={paddingTop}
          onChange={(val: number | string) => {
            onChange('paddingTop', val);
          }}
          onBlur={(e: any) => {
            onApplyState('paddingTop', e.target.value);
          }}
        />
      </PaddingTopDiv>
      <PaddingRightDiv>
        <StyledInputNumber
          style={{ top: 'calc(50% - 10px)', right: -8, left: 'auto', transform: 'translateX(50%)' }}
          placeholder="0"
          size="small"
          bordered={false}
          value={paddingRight}
          onChange={(val: number | string) => {
            onChange('paddingRight', val);
          }}
          onBlur={(e: any) => {
            onApplyState('paddingRight', e.target.value);
          }}
        />
      </PaddingRightDiv>
      <PaddingBottomDiv>
        <HelpText>{foxpageI18n.padding}</HelpText>
        <StyledInputNumber
          style={{ top: 0 }}
          placeholder="0"
          size="small"
          bordered={false}
          value={paddingBottom}
          onChange={(val: number | string) => {
            onChange('paddingBottom', val);
          }}
          onBlur={(e: any) => {
            onApplyState('paddingBottom', e.target.value);
          }}
        />
      </PaddingBottomDiv>
      <PaddingLeftDiv>
        <StyledInputNumber
          style={{ top: 'calc(50% - 10px)', left: -10 }}
          placeholder="0"
          size="small"
          bordered={false}
          value={paddingLeft}
          onChange={(val: number | string) => {
            onChange('paddingLeft', val);
          }}
          onBlur={(e: any) => {
            onApplyState('paddingLeft', e.target.value);
          }}
        />
      </PaddingLeftDiv>
    </BoxContainer>
  );
};
export default Box;
