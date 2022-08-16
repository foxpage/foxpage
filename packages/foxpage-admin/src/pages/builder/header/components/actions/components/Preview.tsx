import React, { useContext, useMemo } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { BugOutlined, EyeOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Empty, Popover, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { DEBUG_PATH, PREVIEW_PATH } from '@/constants/index';
import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';

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

const mapStateToProps = (store: RootState) => ({
  appInfo: store.builder.main.application,
  mock: store.builder.main.mock,
  contentId: store.builder.header.contentId,
  pageLocale: store.builder.header.locale,
  pageType: store.builder.header.fileType,
});

const mapDispatchToProps = {};

type PreviewType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<PreviewType> = (props) => {
  const { appInfo, contentId, mock, pageLocale, pageType } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;

  const { host = [], slug = '' } = appInfo || {};

  // filter host by page locale
  let pageLocaleHost =
    host && pageLocale ? host.filter((item) => item.locales?.indexOf(pageLocale) > -1) : [];
  if (!pageLocaleHost || pageLocaleHost.length === 0) pageLocaleHost = [host[0]];

  let reals =
    pageLocaleHost &&
    pageLocaleHost
      .map((item) =>
        item?.url ? `${item.url}/${slug}${PREVIEW_PATH}?appid=${appInfo.id}&pageid=${contentId}` : '',
      )
      .filter((item) => !!item);
  let debugs =
    pageLocaleHost &&
    pageLocaleHost
      .map((item) =>
        item?.url ? `${item.url}/${slug}${DEBUG_PATH}?appid=${appInfo.id}&pageid=${contentId}` : '',
      )
      .filter((item) => !!item);

  if (pageLocale) {
    reals = reals.map((item) => `${item}&locale=${pageLocale}`);
    debugs = debugs.map((item) => `${item}&locale=${pageLocale}`);
  }

  let mocks: string[] = [];

  const mockModeEnable = useMemo(() => mock?.enable, [mock]);

  if (mockModeEnable) {
    mocks = reals.map((item) => `${item}&mock`);
  }

  const handleClick = (url) => {
    window.open(url);
  };

  return (
    <>
      {pageType === 'page' && (
        <Popover
          placement="bottomLeft"
          overlayClassName="foxpage-builder-header_popover foxpage-builder-header_preview_popover"
          trigger={['hover']}
          style={{ width: 300 }}
          content={
            <>
              {appInfo?.id ? (
                <>
                  {reals.length > 0 || debugs.length > 0 ? (
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
                  ) : (
                    <MoreItem key="unknown">
                      <Link to={`/applications/${appInfo.id}/settings/application`}>
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={<span>{builder.previewUrlEmptyTips}</span>}
                        />
                      </Link>
                    </MoreItem>
                  )}
                </>
              ) : (
                <Spin spinning size="small" />
              )}
            </>
          }>
          <StyledIcon>
            <EyeOutlined />
            <IconMsg>{builder.preview}</IconMsg>
          </StyledIcon>
        </Popover>
      )}
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
