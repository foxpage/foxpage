import React from 'react';

import { Pagination as AntPagination } from 'antd';
import styled from 'styled-components';

const Root = styled.div`
  text-align: center;
  padding: 11px 0 0;
`;

interface IProps {
  size?: 'default' | 'small';
  current: number;
  total: number;
  pageSize: number;
  onChange: (num: number) => void;
}

export function Pagination(props: IProps) {
  const { total = 0, pageSize = 0, size = 'default' } = props;

  return (
    <>
      {total && total / pageSize > 1 ? (
        <Root>
          <AntPagination size={size} showSizeChanger={false} {...props} />
        </Root>
      ) : null}
    </>
  );
}

export default Pagination;
