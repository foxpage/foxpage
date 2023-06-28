import React from 'react';

import styled from 'styled-components';

import Editor from './editor/Index';
import MockEditor from './mocker/Index';
import Sidebar from './sidebar/Index';
import Viewer from './viewer/Index';
import DesignerContextProvider from './DesignerContextProvider';
import DragContextProvider from './DragContextProvider';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  min-height: 0;
`;

const Designer = () => {
  return (
    <DragContextProvider>
      <DesignerContextProvider>
        <div className="flex h-full flex-1 min-w-0">
          <Panel style={{ borderRight: '1px solid #f2f2f2' }}>
            <Sidebar />
          </Panel>
          <Panel style={{ flexGrow: 1 }}>
            <Viewer />
          </Panel>
          <Panel>
            <Editor></Editor>
            <MockEditor />
          </Panel>
        </div>
      </DesignerContextProvider>
    </DragContextProvider>
  );
};

export default Designer;
