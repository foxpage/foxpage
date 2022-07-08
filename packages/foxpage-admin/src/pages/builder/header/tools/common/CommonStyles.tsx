import { CSSProperties } from 'react';

import styled from 'styled-components';

import { iconStyle } from '../../../constant';

export const catalogIconStyle: CSSProperties = {
  marginRight: 4,
  ...iconStyle,
};

export const Area = styled.div`
  border-bottom: 1px solid #d6dadc;
  user-select: none;
`;

export const Row = styled.div`
  line-height: 32px;
  padding: 0 24px;
  font-size: 12px;
  position: relative;
  color: ${(props: { disable?: boolean }) => (props.disable ? '#999' : 'inherit')};
  :hover {
    cursor: ${(props: { disable?: boolean }) => (props.disable ? 'not-allowed' : 'pointer')};
    color: ${(props: { disable?: boolean }) => (props.disable ? '#999' : '#1890ff')};
    background-color: ${(props: { disable?: boolean }) => (props.disable ? 'inherit' : '#f2f2f2')};
  }
`;
