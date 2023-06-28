import React, { useCallback, useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { RollbackOutlined } from '@ant-design/icons';
import { Empty, List, Popconfirm, Popover } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { RecordLog, StructureNode } from '@foxpage/foxpage-client-types';

import { GlobalContext } from '@/pages/system';
import { fetchList, pushBackNodes, removeNode } from '@/store/actions/builder/recyclebin';
import { periodFormat } from '@/utils/index';

const mapStateToProps = (store: RootState) => ({
  applicationId: store.builder.header.applicationId,
  contentId: store.builder.header.contentId,
  localList: store.builder.recyclebin.localList,
  localTotal: store.builder.recyclebin.localTotal,
  remoteList: store.builder.recyclebin.remoteList,
  remoteTotal: store.builder.recyclebin.remoteTotal,
});

const mapDispatchToProps = {
  fetchList,
  removeNode,
  pushBackNodes,
};

type PropsFromStore = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;
type NodeListProps = Pick<typeof mapDispatchToProps, 'removeNode' | 'pushBackNodes'> & {
  nodeList: RecordLog[];
  total: number;
  remote?: boolean;
  load?: (...args: any[]) => void;
};

const Header = styled.div`
  width: 400px;
  padding: 8px;
  font-size: 12px;
  background-color: #f2f2f2;
`;

const PAGE_SIZE = 10;

const NodeList: React.FC<NodeListProps> = (props) => {
  const { nodeList, remote = false, total, load, removeNode, pushBackNodes } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, recyclebin } = locale.business;

  useEffect(() => {
    load?.(1, PAGE_SIZE);
  }, [load]);

  const confirm = (node: StructureNode, index: number) => {
    removeNode(index, remote);
    pushBackNodes([node]);
  };

  if (nodeList.length === 0)
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '10px 0px' }} />;

  return (
    <List
      itemLayout="horizontal"
      dataSource={nodeList}
      pagination={
        total > PAGE_SIZE
          ? { position: 'bottom', size: 'small', pageSize: PAGE_SIZE, total, onChange: load }
          : false
      }
      style={{ padding: '0 12px' }}
      renderItem={(item, index) => {
        return item.content.map((rawContent) => {
          let content = rawContent.content;
          if (typeof content === 'string') {
            content = JSON.parse(content);
          }
          return (
            <List.Item
              style={{ paddingBottom: 20 }}
              actions={[
                <Popconfirm
                  title={recyclebin.pushBackTip}
                  onConfirm={() => confirm(content as StructureNode, index)}
                  okText={global.yes}
                  cancelText={global.no}>
                  <RollbackOutlined />
                </Popconfirm>,
              ]}>
              <List.Item.Meta
                title={(content as StructureNode).label}
                description={
                  <div style={{ fontSize: 12 }}>
                    <span>{item.creator?.nickName || '--'}</span>
                    <span style={{ marginLeft: 6 }}>{periodFormat(item.createTime as any, 'unknown')}</span>
                  </div>
                }
              />
            </List.Item>
          );
        });
      }}
    />
  );
};

const RecycleBin: React.FC<PropsFromStore> = (props) => {
  const {
    applicationId,
    contentId,
    localList,
    localTotal,
    remoteList,
    remoteTotal,
    fetchList,
    ...restProps
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { recyclebin } = locale.business;

  const fetchData = useCallback(
    (pageNum: number, pageSize: number) => {
      if (applicationId && contentId) {
        fetchList({ applicationId, contentId, page: pageNum, size: pageSize });
      }
    },
    [applicationId, contentId],
  );

  return (
    <Popover
      overlayClassName="foxpage-builder-header_popover foxpage-builder-header_record_popover"
      content={
        <section>
          <Header>{recyclebin.localTip}</Header>
          <NodeList {...restProps} nodeList={localList} total={localTotal} />
          <Header>{recyclebin.remoteTip}</Header>
          <NodeList {...restProps} nodeList={remoteList} remote={true} total={remoteTotal} load={fetchData} />
        </section>
      }
      trigger={['hover']}>
      <svg
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="4149"
        width="14"
        height="14">
        <path
          d="M922 88.8H102.5c-21.7 0-38.2 19.3-34.9 40.7L189 919.9c2.3 14.8 15 25.7 29.9 25.7h595.9c15.1 0 27.9-11.1 30-26L957 129.1c3-21.2-13.5-40.3-35-40.3z m-153.5 773H264.8L158.9 172.6h707.3l-97.7 689.2z"
          p-id="4150"></path>
        <path
          d="M446.2 435.1l4.8 2.8c6 3.5 13 4.4 19.7 2.6 6.7-1.8 12.3-6.1 15.8-12.1l26.9-46.4 32.8 56.4c-6.8-1.4-14 0.1-19.8 4-5.9 4.1-9.9 10.4-11 17.5l-0.8 5c-2.1 13.8 7 26.8 20.7 29.4l65.5 12.7c1.7 0.3 3.4 0.5 5 0.5 11.8 0 22.4-8 25.2-20l15.7-65.8c1.7-7 0.4-14.2-3.5-20.2s-10-10.1-17-11.4l-6-1.1c-11.5-2.2-23 3.8-28.1 14l-56.5-97.1c-4.7-8.1-13.1-12.9-22.5-12.9s-17.8 4.8-22.5 12.9l-54.2 93.4c-6.9 12.7-2.6 28.6 9.8 35.8zM324.2 706.4l107.9 2.4h0.6c14.1 0 25.7-11.3 26-25.4l0.1-5.6c0.3-14.3-11.1-26.3-25.4-26.6l-53.6-1.2 33.6-56c2.1 6.7 6.8 12.2 13.1 15.4 6.4 3.2 13.9 3.7 20.7 1.2l4.7-1.7c13.1-4.8 20.1-19 15.8-32.4L447.3 513c-4.3-13.3-18.2-20.8-31.7-17.1l-65.2 18c-6.9 1.9-12.6 6.4-16 12.8-3.4 6.3-4 13.6-1.8 20.4l1.9 5.8c3.7 11.1 14.4 18.3 25.8 17.8L302.5 667c-4.8 8-5 17.7-0.5 25.9 4.6 8.3 12.9 13.3 22.2 13.5zM635 551.4l-4.9 2.7c-12.5 7-16.9 22.9-9.9 35.4l26.3 46.7-65.3-0.3c4.7-5.2 7-12.1 6.6-19.1-0.5-7.2-4-13.9-9.5-18.4l-3.9-3.2c-10.9-8.8-26.6-7.5-35.9 2.9L494.3 648c-9.3 10.5-8.6 26.3 1.4 35.9l48.7 46.9c4.9 4.7 11.2 7.3 18 7.3h1.2c7.2-0.3 13.7-3.5 18.5-8.9l4-4.6c7.7-8.8 8.4-21.7 2.2-31.3l112.3 0.6h0.1c9.3 0 17.7-4.8 22.4-12.8 4.7-8.1 4.8-17.8 0.2-25.9l-53-94.1c-3.4-6.1-9-10.4-15.7-12.3-6.5-1.6-13.5-0.8-19.6 2.6z"
          p-id="4151"></path>
      </svg>
    </Popover>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(RecycleBin);
