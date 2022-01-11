import React from 'react';

import { Pagination as AntPagination, PaginationProps as AntdPaginationProps } from 'antd';
import styled from 'styled-components';

const Root = styled.div`
  text-align: center;
  padding: 30px 0;
`;

interface PaginationProps extends AntdPaginationProps {
  total: number;
  pageSize: number;
}

const Pagination: React.FC<PaginationProps> = props => {
  const { total, pageSize } = props;

  return (
    <React.Fragment>
      {total && total / pageSize > 1 ? (
        <Root>
          <AntPagination {...props} />
        </Root>
      ) : null}
    </React.Fragment>
  );
};

Pagination.defaultProps = {
  total: 0,
  pageSize: 10,
};

export default Pagination;
