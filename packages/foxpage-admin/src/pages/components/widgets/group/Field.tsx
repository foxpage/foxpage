import styled from 'styled-components';

export default styled.div`
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  '&:first-child': {
    margin-top: 0;
  }
  button {
    align-self: flex-start;
  }
`;
