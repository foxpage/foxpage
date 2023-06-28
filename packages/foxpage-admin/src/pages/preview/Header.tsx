import React, { useContext, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { InfoCircleOutlined } from '@ant-design/icons';
import { Layout, Tag } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { FileType } from '@/constants/global';
import { PageContent } from '@/types/index';
import { getLocationIfo } from '@/utils/location-info';

import { Actions, Catalog, GoBack } from '../builder/header/components';
import { History } from '../components';
import { GlobalContext } from '../system';

const { Header } = Layout;

const StyledHeader = styled(Header)`
  background: rgb(255, 255, 255) !important;
  border-bottom: 1px solid rgb(242, 242, 242);
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  z-index: 100;
  line-height: 48px;
  height: 48px;
  padding: 0;
`;

export const StyledIcon = styled.div`
  min-width: 44px;
  font-size: 14px;
  text-align: center;
  position: relative;
  padding: 2px 4px;
  display: flex;
  flex-direction: column;
  height: 100%;
  color: rgb(91, 107, 115);
  border-top: 2px solid transparent;
  background-color: transparent;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  user-select: none;
  > span {
    height: 14px;
  }
  &:hover {
    color: rgb(65, 80, 88);
    background-color: rgb(242, 242, 242);
  }
  &.disabled {
    cursor: not-allowed;
    color: rgb(195, 193, 193);
    background-color: inherit;
  }
  &.selected {
    background-color: rgb(242, 242, 242);
  }
`;

export const IconMsg = styled.p`
  font-size: 12px;
  font-weight: 500;
  margin: 0;
  line-height: 22px;
  user-select: none;
`;

const Part = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .ant-popover-inner-content {
    padding: 0;
  }
`;

const mapStateToProps = (store: RootState) => ({
  pageList: store.builder.header.pageList,
  versionId: store.builder.header.versionId,
  readOnly: store.builder.main.readOnly,
  versionList: store.history.main.versionsList,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchCatalog: ACTIONS.fetchCatalog,
  selectContent: ACTIONS.selectContent,
};

type HeaderType = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    pageContent: PageContent;
  };

const Main: React.FC<HeaderType> = (props) => {
  const { clearAll, fetchCatalog, selectContent, pageContent, pageList, readOnly, versionId, versionList } =
    props;

  const { applicationId, folderId, fileId, contentId } = getLocationIfo(useLocation());
  // i18n
  const { locale } = useContext(GlobalContext);
  const { history } = locale.business;

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  // supplement fileId and contentId if query string undefined
  useEffect(() => {
    if (pageList.length > 0) {
      // get file with filedId or default by index 0
      const file = !!fileId
        ? pageList.find((item) => item.id === fileId)
        : pageList.find((item) => item.contents && item.contents.length > 0);

      // get content by default index 0
      const contents = file?.contents;
      const content =
        contents && contentId ? contents.find((content) => content.id === contentId) : contents?.[0];

      if (content) {
        // push to store
        const localeTag = content?.tags.filter((item) => item.locale);
        selectContent({
          applicationId,
          fileId: fileId || file?.id,
          contentId: contentId || content.id,
          locale: localeTag && localeTag.length > 0 ? localeTag[0].locale : '',
          fileType: file?.type || FileType.page,
        });
      }
    }
  }, [pageList]);

  // fetch catalog
  useEffect(() => {
    if (applicationId && folderId) {
      fetchCatalog({ applicationId, folderId });
    }
  }, [applicationId, folderId]);

  const version = useMemo(() => {
    let versionStr = '';

    if (!readOnly) {
      versionStr = pageContent.version;
    } else {
      versionStr = versionList.find((version) => version.id === versionId)?.version || '';
    }

    return versionStr;
  }, [versionList, pageContent, readOnly, versionId]);

  return (
    <React.Fragment>
      <StyledHeader>
        <Part style={{ flex: 1, justifyContent: 'flex-start' }}>
          <GoBack />
          <Catalog readOnly={true} />
          {pageContent.version && (
            <Tag color="green" style={{ marginLeft: 8 }}>
              {version}
            </Tag>
          )}
        </Part>
        <Part style={{ flex: 1, justifyContent: 'flex-start' }}>
          <History inPreview />
        </Part>
        <Part style={{ flex: 1, justifyContent: 'flex-center' }}>
          <span style={{ color: '#f90' }}>
            <InfoCircleOutlined /> {history.previewTip}
          </span>
        </Part>
        <Part style={{ flex: 1, justifyContent: 'flex-end', paddingRight: 12 }}>
          <Actions />
        </Part>
      </StyledHeader>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
