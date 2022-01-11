import { Select } from 'antd';
import styled from 'styled-components';

const List = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ListItem = styled.li`
  cursor: pointer;
  position: relative;
  border-bottom: 1px dashed #e8e8e8;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  &:hover {
    color: rgb(41, 141, 248);
    background: rgb(247, 247, 247);
  }
  &.active {
    color: rgb(41, 141, 248);
    background: rgb(242, 248, 255);
  }
  &.no-select {
    &:hover {
      color: inherit;
      background: inherit;
    }
  }
`;

const StyledSelect = styled(Select)`
  width: 60px !important;
  color: #52c41a82;
  .ant-select-selector {
    border: none !important;
    background-color: transparent !important;
  }

  .ant-select-selection-item {
    padding: 0 !important;
  }
  .ant-select-arrow {
    display: none;
  }
`;

const ContentName = styled.div`
  display: inline-block;
  width: calc(100% - 14px);
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  &.selected {
    width: calc(100% - 66px);
  }
`;

export { ContentName,List, ListItem, StyledSelect };
