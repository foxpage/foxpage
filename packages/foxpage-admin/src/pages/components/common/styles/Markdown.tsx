import styled from 'styled-components';

export const Wrapper = styled.div<{ fullscreen: boolean }>`
  position: ${(props) => (props.fullscreen ? 'fixed' : 'relative')};
  top: ${(props) => (props.fullscreen ? 0 : 'unset')};
  right: ${(props) => (props.fullscreen ? 0 : 'unset')};
  left: ${(props) => (props.fullscreen ? 0 : 'unset')};
  bottom: ${(props) => (props.fullscreen ? 0 : 'unset')};
  z-index: ${(props) => (props.fullscreen ? 2000 : 'unset')};
`;

export const MarkdownEditorWrapper = styled.div`
  display: flex;
`;
export const MarkdownDisplay = styled.div`
  padding: 12px;
  overflow: auto;
  background: #ffffff;
  flex: 1;
`;
export const SplitLine = styled.div`
  border-left: 1px solid #fafafa;
  border-right: 1px solid #fafafa;
`;

export const ControlPanel = styled.div`
  display: flex;
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 30;
`;
