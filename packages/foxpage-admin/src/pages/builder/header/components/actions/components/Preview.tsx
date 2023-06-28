import React, { useContext, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import {
  BugOutlined,
  EyeOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Empty, Modal, Popover, Spin, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { DEBUG_PATH, FileType, FOXPAGE_USER_TICKET, PREVIEW_PATH } from '@/constants/index';
import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { ZoneTimeSelector } from '@/pages/components';
import UrlWithQRcode from '@/pages/components/common/QRcodeUrl';
import { GlobalContext } from '@/pages/system';
import { getLocaleHost } from '@/utils/index';

const MoreItem = styled.div`
  word-break: break-all;
  line-height: 20px;
  cursor: pointer;
  padding: 8px 14px;
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
  .qr-code-outlined {
    color: #000;
  }
`;

const Tips = styled.div`
  color: #f90;
  font-size: 14px;
  line-height: 1.5715;
  padding: 8px 15px;
  word-wrap: break-word;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
`;

const Mark = styled.span`
  margin-right: 6px;
`;

const mapStateToProps = (store: RootState) => ({
  contentId: store.builder.header.contentId,
  pageType: store.builder.header.fileType,
  pageLocale: store.builder.header.locale,
  appInfo: store.builder.main.application,
  mock: store.builder.main.mock,
  pageContent: store.builder.main.pageContent,
  file: store.builder.main.file,
  editStatus: store.builder.main.editStatus && !!store.record.main.localRecords.length,
});

const mapDispatchToProps = {};

type PreviewType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<PreviewType> = (props) => {
  const { appInfo, contentId, mock, pageContent, pageLocale, pageType, file, editStatus } = props;
  const [zoneTime, setZoneTime] = useState('');
  const token = localStorage.getItem(FOXPAGE_USER_TICKET);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;

  const { host = [], slug = '' } = appInfo || {};

  // filter host by page locale
  const pageLocaleHost = getLocaleHost(host, pageLocale);

  const pathnameTag = file.tags?.find((item) => !!item.pathname);

  const reals =
    pathnameTag && pageLocale
      ? pageLocaleHost &&
        pageLocaleHost
          .map((item) =>
            item?.url
              ? `${item.url}/${slug}${pathnameTag.pathname}?locale=${pageLocale}&pageid=${contentId}&preview=1`
              : '',
          )
          .filter((item) => !!item)
      : [];
  let previews =
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
    previews = previews.map((item) => `${item}&locale=${pageLocale}`);
    debugs = debugs.map((item) => `${item}&locale=${pageLocale}`);
  }

  let mocks: string[] = [];

  const mockModeEnable = useMemo(() => mock?.enable, [mock]);

  if (mockModeEnable) {
    mocks = previews.map((item) => `${item}&mock`);
  }

  let realViews = reals && reals.length > 0 ? reals : previews;

  // set time to url
  if (zoneTime) {
    mocks = mocks.map((item) => `${item}&_foxpage_preview_time=${zoneTime}`);
    realViews = realViews.map((item) => `${item}&_foxpage_preview_time=${zoneTime}`);
    debugs = debugs.map((item) => `${item}&_foxpage_preview_time=${zoneTime}`);
  }

  const [open, setOpen] = useState<boolean>(false);

  const urlAppendWithTicket = (url) => url + '&_foxpage_ticket=' + token;

  const handleClick = (url) => {
    const urlWithTicket = urlAppendWithTicket(url);
    if (editStatus) {
      setOpen(false);
      Modal.confirm({
        title: builder.unsavedContentPreviewTip,
        onCancel() {
          window.open(urlWithTicket);
        },
        cancelText: builder.unsavedPreviewIgnored,
        centered: true,
      });
    } else {
      window.open(urlWithTicket);
    }
  };

  return pageType === FileType.page || pageType === FileType.block ? (
    <Popover
      placement="bottomLeft"
      overlayClassName="foxpage-builder-header_popover foxpage-builder-header_preview_popover"
      trigger={['hover']}
      style={{ width: 300 }}
      onOpenChange={setOpen}
      content={
        open && (
          <div>
            <div style={{ borderBottom: '1px solid #ddd', padding: '4px', display: 'flex' }}>
              <Tooltip placement="bottom" title={builder.timePreviewTips}>
                <QuestionCircleOutlined
                  style={{ lineHeight: '46px', paddingLeft: '10px', color: '#656565' }}
                />
              </Tooltip>
              <div style={{ flexGrow: 1 }}>
                <ZoneTimeSelector locale={pageLocale || 'en_US'} onChange={setZoneTime} />
              </div>
            </div>
            <Tips>
              <InfoCircleOutlined style={{ marginRight: '6px' }} />
              {builder.previewTips}
            </Tips>
            {appInfo?.id ? (
              <>
                {realViews.length > 0 || debugs.length > 0 ? (
                  <>
                    {realViews.map((url) => (
                      <MoreItem key={url} onClick={() => handleClick(url)}>
                        <Mark style={{ color: '#48a700' }}>
                          [ <EyeOutlined /> {builder.realPreview} ]
                        </Mark>
                        <UrlWithQRcode url={urlAppendWithTicket(url)} />
                        {url}
                      </MoreItem>
                    ))}
                    {mocks.map((mockUrl) => (
                      <MoreItem key={mockUrl} onClick={() => handleClick(mockUrl)}>
                        <Mark style={{ color: '#ff6a5b' }}>
                          [ <BugOutlined /> {builder.mockPreview} ]
                        </Mark>
                        <UrlWithQRcode url={urlAppendWithTicket(mockUrl)} />
                        {mockUrl}
                      </MoreItem>
                    ))}
                    {pageContent?.versionNumber &&
                      pageContent.versionNumber > 1 &&
                      debugs.map((debugUrl) => (
                        <MoreItem key={debugUrl} onClick={() => handleClick(debugUrl)}>
                          <Mark style={{ color: '#00a8f7' }}>
                            [ <ThunderboltOutlined /> {builder.debugPreview} ]
                          </Mark>
                          <UrlWithQRcode url={urlAppendWithTicket(debugUrl)} />
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
          </div>
        )
      }>
      <StyledIcon onMouseEnter={() => setOpen(true)}>
        <EyeOutlined />
        <IconMsg>{builder.preview}</IconMsg>
      </StyledIcon>
    </Popover>
  ) : null;
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
