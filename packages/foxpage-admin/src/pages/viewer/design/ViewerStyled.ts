import styled from 'styled-components';

const ViewerStyled = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #fbfbfb;
  display: flex;
  flex-direction: row;
  > div[node-type='dnd-context'] {
    position: relative;
    flex-grow: 1;
    width: 100%;
    height: 100%;
  }
  .fox-design-viewer {
    width: calc(100% - 30px);
    height: calc(100% - 30px);
  }
  .infinite-viewer-scroll-thumb {
    background: #b3b1b1 !important;
  }
  [class^='target'] {
    position: absolute;
    outline-offset: 0;
    :hover {
      outline: 1px solid rgb(41, 141, 248);
    }
  }

  .box {
    font-family: 'Roboto', sans-serif;
    position: absolute;
    width: 200px;
    height: 200px;
    text-align: center;
    font-size: 40px;
    /* margin: 0px auto; */
    font-weight: 100;
    letter-spacing: 1px;
    background-color: #f90;
    color: #fff;
  }

  .box span {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    display: inline-block;
    word-break: break-all;
  }

  .fox-design-viewer {
    position: absolute !important;
    left: 30px;
    top: 30px;
  }

  .description {
    text-align: center;
  }

  .badges {
    padding: 10px;
    text-align: center;
  }

  .label {
    position: fixed;
    top: 0;
    left: 0;
    padding: 5px;
    border-radius: 5px;
    background: #333;
    z-index: 3001;
    color: #fff;
    font-weight: bold;
    font-size: 12px;
    display: none;
    transform: translate(-100%, -100%);
  }

  .page.feature,
  .page.footer {
    height: auto;
    text-align: left;
    padding: 60px 20px;
  }

  .page.feature .container,
  .page.footer .container {
    top: 0;
    left: 0;
    padding: 60px 0px;
    margin: auto;
    transform: none;
    width: auto;
    max-width: 800px;
  }

  .page.feature .container {
    display: flex;
  }

  .page.footer .container {
    padding: 0px;
  }

  .page.feature h2.container {
    padding: 10px 0px;
    font-weight: 300;
    font-size: 40px;
  }

  .feature .container .left {
    position: relative;
    width: 300px;
    height: 205px;
    display: inline-block;
    vertical-align: top;
    z-index: 2000;
    margin-bottom: 20px;
  }

  .feature .container .right {
    position: relative;
    display: inline-block;
    vertical-align: top;
    flex: 1;
  }

  .feature .right .description {
    text-align: left;
    margin: 0px 0px 10px;
  }

  .feature .right .description strong {
    font-weight: 600;
  }

  .draggable,
  .resizable,
  .scalable,
  .rotatable,
  .origin,
  .warpable,
  .pinchable {
    position: absolute;
    left: 0;
  }

  .origin {
    transform-origin: 30% 50%;
  }

  pre {
    position: relative;
    border: 1px solid #ccc;
    box-sizing: border-box;
    padding: 10px;
    max-width: 500px;
  }

  code.hljs {
    padding: 0;
  }

  .tab {
    padding: 10px 12px;
    appearance: none;
    -webkit-appearance: none;
    background: transparent;
    border: 1px solid #ccc;
    box-shadow: none;
    font-weight: bold;
    margin: 0;
    cursor: pointer;
    outline: none;
  }

  .tab.selected {
    background: #333;
    color: #fff;
    border: 1px solid #333;
  }

  .panel {
    display: none;
  }

  .panel.selected {
    display: block;
  }

  .page.footer {
    font-weight: 400;
  }

  .page.footer a {
    text-decoration: underline;
  }

  .page.footer span:first-child:before {
    content: '';
  }

  .page.footer span:before {
    content: '/';
  }

  .rest-box {
    position: absolute !important;
    background-color: #f0958e;
    width: 20px;
    height: 20px;
    z-index: 10;
    box-sizing: border-box;
    left: 0;
    top: 0;
  }
`;
export default ViewerStyled;
