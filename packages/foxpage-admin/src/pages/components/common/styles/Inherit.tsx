import styled from 'styled-components';

const Ring = styled.span`
  position: absolute;
  width: 8px;
  height: 8px;
  top: calc(50% - 4px);
  left: 12px;
  z-index: 10;
  border: 2px solid #ffbb96;
  background-color: #fff;
  border-radius: 50%;
`;

const BasicTemRingMask = styled.span`
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 50%;
  z-index: 10;
  background-color: #ffffff;
`;

const BasicTemRing = styled(Ring)`
  width: 12px;
  height: 12px;
  top: calc(50% - 6px);
  left: 10px;
  border: 2px solid #fa541c;
`;

const VLine = styled.span`
  position: absolute;
  height: 100%;
  width: 2px;
  top: -50%;
  left: 15px;
  border-right: 1px dashed #ffbb96;
`;

export { BasicTemRing, BasicTemRingMask, Ring, VLine };
