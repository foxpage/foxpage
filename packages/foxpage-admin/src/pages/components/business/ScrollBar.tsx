import styled from 'styled-components';

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

export default ScrollBar;
