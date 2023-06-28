import React from 'react';

import { InputNumber } from 'antd';
import styled from 'styled-components';

import { useFoxpageContext } from '../../context';

import { BoxType } from './interface';

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

const Box: React.FC<BoxType> = (props) => {
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
    onApplyState = () => {},
  } = props;
  const { foxI18n } = useFoxpageContext();
  return (
    <BoxContainer>
      <MarginTopDiv>
        <StyledInputNumber
          style={{ top: -20 }}
          placeholder="0"
          size="small"
          bordered={false}
          value={marginTop}
          onChange={(val: number | string | null) => {
            if (val) onChange('marginTop', val);
          }}
          onBlur={() => {
            onApplyState();
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
          onChange={(val: number | string | null) => {
            if (val) onChange('marginRight', val);
          }}
          onBlur={() => {
            onApplyState();
          }}
        />
      </MarginRightDiv>
      <MarginBottomDiv>
        <HelpText>{foxI18n.margin}</HelpText>
        <StyledInputNumber
          style={{ top: 0 }}
          placeholder="0"
          size="small"
          bordered={false}
          value={marginBottom}
          onChange={(val: number | string | null) => {
            if (val) onChange('marginBottom', val);
          }}
          onBlur={() => {
            onApplyState();
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
          onChange={(val: number | string | null) => {
            if (val) onChange('marginLeft', val);
          }}
          onBlur={() => {
            onApplyState();
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
          onChange={(val: number | string | null) => {
            if (val) onChange('paddingTop', val);
          }}
          onBlur={() => {
            onApplyState();
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
          onChange={(val: number | string | null) => {
            if (val) onChange('paddingRight', val);
          }}
          onBlur={() => {
            onApplyState();
          }}
        />
      </PaddingRightDiv>
      <PaddingBottomDiv>
        <HelpText>{foxI18n.padding}</HelpText>
        <StyledInputNumber
          style={{ top: 0 }}
          placeholder="0"
          size="small"
          bordered={false}
          value={paddingBottom}
          onChange={(val: number | string | null) => {
            if (val) onChange('paddingBottom', val);
          }}
          onBlur={() => {
            onApplyState();
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
          onChange={(val) => {
            if (val) onChange('paddingLeft', val);
          }}
          onBlur={() => {
            onApplyState();
          }}
        />
      </PaddingLeftDiv>
    </BoxContainer>
  );
};
export default Box;
