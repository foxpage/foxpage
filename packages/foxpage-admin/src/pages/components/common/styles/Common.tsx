import { Tag as AntdTag } from 'antd';
import styled from 'styled-components';

const StyledLayout = styled.div`
  background-color: #fff;
  max-width: 1136px;
  min-height: 680px;
  margin: 24px auto 0;
  @media screen and (max-width: 1200px) {
    max-width: calc(100% - 48px) !important;
  }
`;

const Content = styled.div`
  width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0;
`;

const ScrollBar = styled.div`
  overflow: auto;
  ::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.15);
    background-color: #dbdbdb;
    border-radius: 8px;
  }
`;

const Tag = styled(AntdTag)`
  padding: 0 4px !important;
  line-height: normal !important;
`;

const LocaleTag = styled(Tag)`
  cursor: default !important;
  margin: 2px !important;
  width: 50px;
  text-align: center;
  font-weight: 400;
`;

const Name = styled.span`
  display: inline-block;
  max-width: 350px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
`;

const NameContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  a {
    display: inline-block;
    line-height: 1;
  }
`;

export { Content, LocaleTag, Name, NameContainer, ScrollBar, StyledLayout, Tag };
