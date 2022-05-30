import React, { useContext, useState } from 'react';

import { Drawer, Input, List } from 'antd';

import { ComponentType } from '@/types/component';

import { RightCloseIcon } from '../../components';
import DragContent from '../../dnd/DragContent';
import viewerContext from '../../viewerContext';

const { Search } = Input;

interface DrawerProps {
  allComponent?: ComponentType[];
  showPlaceholder?: (visible: boolean, dndParams: any, offSet: { scrollX: number; scrollY: number }) => void;
  onClose?: () => void;
}

const ComponentDrawer: React.FC<DrawerProps> = (props) => {
  const [searchText, setSearchText] = useState<string>('');
  const { allComponent, onClose = () => {}, showPlaceholder } = props;
  const { foxpageI18n } = useContext(viewerContext);
  // const { container } = useContext(BuilderContext);

  return (
    <Drawer
      title={<span style={{ fontSize: '14px', fontWeight: 'bold' }}>{foxpageI18n.componentListTitle}</span>}
      placement="left"
      visible
      destroyOnClose
      mask={false}
      closable={false}
      extra={<RightCloseIcon onClose={onClose} />}
      width={410}
      // getContainer={container}
      onClose={onClose}
      headerStyle={{ padding: 16 }}
      bodyStyle={{ padding: '16px 0' }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 50,
        boxShadow: 'rgba(0, 0, 0, 0.1) 4px 4px 4px 2px',
        overflowY: 'auto',
        transition: 'none',
      }}>
      <div style={{ padding: '8px 16px' }}>
        <Search
          placeholder={foxpageI18n.componentSearch}
          onSearch={(text) => {
            setSearchText(text);
          }}
        />
      </div>

      <List
        size="small"
        loading={!allComponent}
        dataSource={allComponent?.filter((component: ComponentType) => component.name?.includes(searchText))}
        renderItem={(item) => (
          <List.Item style={{ cursor: 'move', userSelect: 'none', padding: 0 }}>
            <DragContent item={item} showPlaceholder={showPlaceholder}>
              <div style={{ padding: '8px 16px' }}>{item.name}</div>
            </DragContent>
          </List.Item>
        )}
      />
    </Drawer>
  );
};

export default ComponentDrawer;
