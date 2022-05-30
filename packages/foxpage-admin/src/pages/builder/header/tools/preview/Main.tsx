import React from 'react';

import { BugOutlined, EyeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import styled from 'styled-components';

import { DEBUG_URL, PREVIEW_URL } from '@/constants/index';
import { Application } from '@/types/application';

const MoreItem = styled.div`
  word-break: break-all;
  line-height: 20px;
  cursor: pointer;
  padding: 8px 24px;
  font-size: 12px;
  width: 100%;
  border-bottom: 1px solid #e8e8e8;
  &:hover {
    color: rgb(24, 144, 255);
    background-color: rgb(242, 242, 242);
  }
  &:last-of-type {
    border-bottom: none;
  }
`;

type HeaderType = {
  appInfo: Application;
  mockModeEnable?: boolean;
  contentId: string;
  pageLocale?: string;
};

const PreviewPage: React.FC<HeaderType> = (props) => {
  const { appInfo, mockModeEnable, contentId, pageLocale } = props;
  const { host = [], slug } = appInfo || {};

  if (!appInfo.id) {
    return (
      <MoreItem>
        <Spin spinning />
      </MoreItem>
    );
  }

  let reals = host.map((item) => `${item}/${slug}${PREVIEW_URL}?appid=${appInfo.id}&pageid=${contentId}`);
  let debugs = host.map((item) => `${item}/${slug}${DEBUG_URL}?appid=${appInfo.id}&pageid=${contentId}`);

  if (pageLocale) {
    reals = reals.map((item) => `${item}&locale=${pageLocale}`);
    debugs = debugs.map((item) => `${item}&locale=${pageLocale}`);
  }
  let mocks: string[] = [];
  if (mockModeEnable) {
    mocks = reals.map((item) => `${item}&mock`);
  }

  const handleClick = (url) => {
    window.open(url);
  };

  return (
    <>
      {reals.map((url) => (
        <MoreItem key={url} onClick={() => handleClick(url)}>
          <span style={{ color: '#48a700' }}>
            [ <EyeOutlined /> ]
          </span>{' '}
          {url}
        </MoreItem>
      ))}
      {mocks.map((mockUrl) => (
        <MoreItem key={mockUrl} onClick={() => handleClick(mockUrl)}>
          <span style={{ color: '#00a8f7' }}>
            [ <BugOutlined /> ]
          </span>{' '}
          {mockUrl}
        </MoreItem>
      ))}
      {debugs.map((debugUrl) => (
        <MoreItem key={debugUrl} onClick={() => handleClick(debugUrl)}>
          <span style={{ color: '#ff6a5b' }}>
            [ <ThunderboltOutlined /> ]
          </span>{' '}
          {debugUrl}
        </MoreItem>
      ))}
    </>
  );
};

export default PreviewPage;
