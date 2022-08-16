import { Table as AntdTable, TableProps } from 'antd';
import styled from 'styled-components';

const Table: React.FC<TableProps<any>> = styled(AntdTable)`
  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 16px 8px !important;
  }
`;

export default Table;
