import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { ThunderboltTwoTone } from '@ant-design/icons';
import { Popconfirm, Timeline, Tooltip } from 'antd';
import styled from 'styled-components';

import { actionConfig } from '@/constants/index';
import { BackIcon } from '@/pages/components';
import { GlobalContext } from '@/pages/system';
import { pushBackNodes } from '@/store/actions/builder/recyclebin';
import { updateRemoteRecords } from '@/store/actions/record';
import { ContentVersion, HistoryRecord, RecordLog, RenderStructureNode } from '@/types/index';
import { periodFormat } from '@/utils/index';

export const Timer = styled.span`
  line-height: 20px;
  color: #999;
  margin-right: 10px;
`;

export const Content = styled.div<{ fontWeight?: number }>`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 2em;
  word-break: break-word;
  font-weight: ${(props) => props.fontWeight || 'unset'};
`;

export const LogItem = styled.div<{ fontSize?: number; padding?: number | string }>`
  width: 100%;
  font-size: ${(props) => `${props.fontSize || 12}px`};
  padding: ${(props) => `${props.padding || '8px'}`};

  &:hover {
    color: rgb(24, 144, 255);
  }
`;

export const NoData = styled.div`
  line-height: 34px;
  text-align: center;

  color: #656565;
  font-size: 12px;
`;

const _BackButton: React.FC<{
  data: RecordLog;
  pushBackNodes: (nodes: RenderStructureNode[]) => void;
  updateRemoteRecords: (index: number, record: RecordLog) =>void;
  index: number;
}> = (props) => {
  // i18n
  const { data, index, pushBackNodes, updateRemoteRecords } = props;
  const { locale } = useContext(GlobalContext);
  const { global, recyclebin } = locale.business;
  const Con = styled.div`
    display: inline;
    padding: 0 8px;
    float: right;
    &:hover {
      cursor: pointer;
      border-radius: 6px;
      background-color: #f3f4f6;
    }
  `;
  let content = data.content?.[0]?.content;
  if (typeof content === 'string') {
    content = JSON.parse(content);
  }

  const confirm = () => {
    pushBackNodes([content as RenderStructureNode]);
    updateRemoteRecords(index, { ...data, reversible: false });
  };

  return (
    <Popconfirm
      placement="topRight"
      title={recyclebin.pushBackTip}
      onConfirm={confirm}
      okText={global.yes}
      cancelText={global.no}>
      <Con>
        <BackIcon color="rgb(195, 193, 193)" />
      </Con>
    </Popconfirm>
  );
};

const BackButton = connect(() => ({}), { pushBackNodes, updateRemoteRecords })(_BackButton);

export const ContentElem = (contents: RecordLog['content'] = []) => {
  // const { locale } = useContext(GlobalContext);
  // const { record } = locale.business;
  return contents.map((item, idx) => {
    let content = {} as { label?: string; name?: string };
    try {
      content = JSON.parse(item.content as string);
    } catch (e) {
      console.error(e);
    }
    return (
      <React.Fragment key={idx}>
        {/* <span>{record[item.type || ''] || '-'}</span> */}
        <Tooltip title={item.id}>
          {content.label || content.name}
        </Tooltip>
      </React.Fragment>
    );
  });
};

export const TimeLineItem = ({
  item,
  localTag,
  padding,
  index,
}: {
  item: RecordLog;
  localTag?: boolean;
  padding?: string | number;
  index: number;
}) => {
  const { locale } = useContext(GlobalContext);
  const { record } = locale.business;
  const { text, textColor } = actionConfig[item.action] || {};
  return (
    <Timeline.Item color={textColor}>
      <LogItem padding={padding}>
        <Content>
          <Timer>
            {/* {localTag && <span style={{ marginRight: 4 }}>[{record.local}]</span>} */}
            {periodFormat(item.createTime as any, 'unknown')}
          </Timer>
          <span
            className="max-w-[112px] truncate inline-block leading-none"
            title={item.creator?.nickName || '-'}>
            {item.creator?.nickName || '-'}
          </span>
          <span>
            {record.do}
            <span style={{ color: textColor, padding: '0 4px', whiteSpace: 'nowrap' }}>{record[text] || '-'}</span>
            {record.action}
          </span>
        </Content>
        <div>
          {record.beAffected}
          {ContentElem(item.content)}
          {item.reversible && <BackButton data={item} index={index} />}
        </div>
      </LogItem>
    </Timeline.Item>
  );
};

export const TimelineElem = (_list: RecordLog[] = [], localTag?: boolean) => {
  return (
    <Timeline key={localTag ? 'local' : 'remote'}>
      {_list.map((item, index) => {
        return <TimeLineItem key={item.id} item={item} localTag={localTag} index={index} padding="8px 8px 0px"/>;
      })}
    </Timeline>
  );
};

export const TimeLineWithVersion = (
  historyRecords: HistoryRecord[],
  versionMap: { [key: string]: ContentVersion[] },
  pending: boolean,
) => {
  const { locale } = useContext(GlobalContext);
  const { historyRecord } = locale.business;

  return (
    <Timeline pending={pending}>
      {historyRecords.map((hRecord) => {
        const versionInfo = versionMap[hRecord.version];
        return (
          <>
            <Timeline.Item key={hRecord.version} dot={<ThunderboltTwoTone />}>
              <LogItem padding={4} fontSize={14}>
                <Content fontWeight={500}>
                  {versionInfo && versionInfo.length > 0 ? versionInfo[0].creator.nickName : '--'}
                  {historyRecord.publish}
                  {historyRecord.version}: {hRecord.version}
                </Content>
                {versionInfo && versionInfo.length > 0 && (
                  <Timer>{periodFormat(versionInfo[0].createTime as any, 'unknown')}</Timer>
                )}
              </LogItem>
            </Timeline.Item>
            {hRecord.histories.map((history, index) => (
              <TimeLineItem padding={4} key={history.id} item={history} index={index} />
            ))}
          </>
        );
      })}
    </Timeline>
  );
};
