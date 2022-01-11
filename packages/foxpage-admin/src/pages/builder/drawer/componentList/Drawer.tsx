import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Drawer, Input, List } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/component-list';
import { setSelectedComponent } from '@/actions/builder/template';
import RightCloseIcon from '@/pages/builder/component/close';
import { ComponentType } from '@/types/builder';

import DragContent from '../../dnd/DragContent';

const { Search } = Input;

interface IProps {
  visible: boolean;
  onClose?: () => void;
  fetchComponentList: (applicationId: string) => void;
  setSelectedId: (id: string) => void;
  container: any;
  showPlaceholder: (visible: boolean, dndParams: any, offSet: { scrollX: number; scrollY: number }) => void;
}

const mapStateToProps = (store: RootState) => ({
  loading: store.builder.componentList.fetchComponentListLoading,
  allComponent: store.builder.componentList.allComponent,
});

const mapDispatchToProps = {
  fetchComponentList: ACTIONS.fetchComponentList,
  setSelectedId: setSelectedComponent,
};

type DrawerProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & IProps;
const ListDrawer: React.FC<DrawerProps> = props => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [searchText, setSearchText] = useState<string>('');
  const { visible, container, loading, allComponent, onClose = () => {}, fetchComponentList, showPlaceholder } = props;

  useEffect(() => {
    if (allComponent.length === 0) {
      fetchComponentList(applicationId);
    }
  }, []);
  return (
    <Drawer
      title="Component List"
      placement="left"
      visible={visible}
      onClose={onClose}
      mask={false}
      style={{
        position: 'absolute',
        top: 8,
        height: 'calc(100% - 16px)',
        transition: 'none',
        left: 46,
        maxHeight: 600,
        overflowY: 'auto',
      }}
      closable={false}
      extra={<RightCloseIcon onClose={onClose} />}
      bodyStyle={{ padding: 0 }}
      getContainer={container}
    >
      <div style={{ padding: '8px 16px' }}>
        <Search
          placeholder="input search text"
          onSearch={text => {
            setSearchText(text);
          }}
        />
      </div>

      <List
        size="small"
        loading={loading}
        dataSource={allComponent.filter((component: ComponentType) => component.name?.includes(searchText))}
        renderItem={item => (
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

export default connect(mapStateToProps, mapDispatchToProps)(ListDrawer);
