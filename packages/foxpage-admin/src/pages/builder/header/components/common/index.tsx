import React, { useContext } from 'react';

import { ThunderboltTwoTone } from '@ant-design/icons';
import { Timeline } from 'antd';
import styled from 'styled-components';

import { actionConfig } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ContentVersion } from '@/types/builder';
import { HistoryRecord } from '@/types/history';
import { RecordLog } from '@/types/record';
import { periodFormat } from '@/utils/index';

export const Timer = styled.div`
  line-height: 20px;
  color: #999;
`;

export const Content = styled.div<{ fontWeight?: number }>`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  word-break: break-all;
  font-weight: ${(props) => props.fontWeight || 'unset'};
`;

export const LogItem = styled.div<{ fontSize?: number; padding?: number }>`
  width: 100%;
  font-size: ${(props) => `${props.fontSize || 12}px`};
  padding: ${(props) => `${props.padding || 8}px`};

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

export const ContentElem = (contents: RecordLog['content'] = []) => {
  const { locale } = useContext(GlobalContext);
  const { record } = locale.business;
  return contents.map((item, idx) => {
    let content = {} as { label?: string; name?: string };
    try {
      content = JSON.parse(item.content as string);
    } catch (e) {
      console.error(e);
    }
    return (
      <React.Fragment key={idx}>
        <span>{record[item.type || ''] || '-'}</span>
        <span>
          ({content.label ? `${content.label}@` : ''}
          {content.name ? `${content.name}@` : ''}
          {item.id}) ;
        </span>
      </React.Fragment>
    );
  });
};

export const TimeLineItem = ({
  item,
  localTag,
  padding,
}: {
  item: RecordLog;
  localTag?: boolean;
  padding?: number;
}) => {
  const { locale } = useContext(GlobalContext);
  const { record } = locale.business;
  const { text, textColor } = actionConfig[item.action] || {};
  return (
    <Timeline.Item color={textColor}>
      <LogItem padding={padding}>
        <Content>
          {item.creator?.nickName || '-'} {record.do}
          <span style={{ color: textColor, padding: '0 4px' }}>{record[text] || '-'}</span>
          {record.action}
          {record.beAffected}
          {ContentElem(item.content)}
        </Content>
        <Timer>
          {localTag && <span style={{ marginRight: 4 }}>[{record.local}]</span>}
          {periodFormat(item.createTime as any, 'unknown')}
        </Timer>
      </LogItem>
    </Timeline.Item>
  );
};

export const TimelineElem = (_list: RecordLog[] = [], localTag?: boolean) => {
  return (
    <Timeline key={localTag ? 'local' : 'remote'}>
      {_list.map((item) => {
        return <TimeLineItem key={item.id} item={item} localTag={localTag} />;
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
            {hRecord.histories.map((history) => (
              <TimeLineItem padding={4} key={history.id} item={history} />
            ))}
          </>
        );
      })}
    </Timeline>
  );
};
