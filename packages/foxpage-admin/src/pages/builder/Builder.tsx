import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Layout } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as PAGE_ACTIONS from '@/actions/builder/page';
import * as ACTIONS from '@/actions/builder/template';
import { updatePageCopyModalOpen } from '@/actions/builder/template-select';
import { fetchApplicationInfo } from '@/actions/group/application/settings';
import { FileTypeEnum } from '@/constants/global';
import { PageParam } from '@/types/builder';
import { getProjectFile } from '@/utils/project/file';

import PageTemplateSelect from './template/PageTemplateSelect';
import Toolbar from './toolbar/Toolbar';
import { VariableBind } from './toolbar/tools';
import Viewer from './viewer/Viewer';
import BuilderContext from './BuilderContext';
import Editor from './editor';

const { Sider, Content } = Layout;

const StyledLayout = styled(Layout)`
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
  -webkit-box-align: center;
  align-items: center;
  padding: 0;
  background: rgb(255, 255, 255);
  height: 100%;
  .ant-drawer {
    box-shadow: 6px 0 16px -8px rgb(0 0 0 / 8%), 9px 0 28px 0 rgb(0 0 0 / 5%),
      12px 0 48px 16px rgb(0 0 0 / 3%);
  }
  .ant-drawer > * {
    transition: none !important;
  }
`;

const StyledSlider = styled(Sider)`
  display: flex;
  align-items: flex-start;
  border-right: 1px solid rgb(242, 242, 242);
  background: rgb(255, 255, 255);
  height: 100%;
  padding: 0;
  z-index: 1;
  user-select: none;
  .ant-layout-sider-children {
    width: 100%;
  }
  .ant-layout-sider-trigger {
    display: none;
  }
`;

const StyledContent = styled(Content)`
  position: relative;
  height: 100%;
  background-color: rgb(242, 242, 242);
  user-select: none;
`;

const mapStateToProps = (store: RootState) => ({
  versionChange: store.builder.template.versionChange,
  version: store.builder.template.version,
  componentLoading: store.builder.template.loading,
  selectedComponent: store.builder.template.selectedComponent,
  templateLoading: store.builder.viewer.loading,
  fileType: store.builder.page.fileType,
  pageLoading: store.builder.page.loading,
  fileDetail: store.builder.page.fileDetail,
  pageList: store.builder.page.pageList,
  storeContentId: store.builder.page.contentId,
  locale: store.builder.page.locale,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchTree: ACTIONS.fetchPageRenderTree,
  clearResource: ACTIONS.clearResource,
  localeChange: ACTIONS.localeChange,
  updatePageCopyModalOpen: updatePageCopyModalOpen,
  fetchFileDetail: PAGE_ACTIONS.fetchFileDetail,
  fetchCatalog: PAGE_ACTIONS.fetchPageList,
  selectContent: PAGE_ACTIONS.selectContent,
  fetchAppInfo: fetchApplicationInfo,
};

type BuilderProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Index: React.FC<BuilderProps> = (props) => {
  const [currentMenu, setCurMenu] = useState<'component' | undefined>(undefined);
  const [containerStyle, setContainerStyle] = useState<CSSProperties>({
    height: '100%',
    width: '100%',
  });
  const containerRef = useRef<any>(null);

  const {
    locale,
    fileDetail,
    pageList,
    storeContentId,
    version = { content: { schemas: [{ props: {} }] } },
    versionChange,
    fileType,
    templateLoading,
    componentLoading,
    pageLoading,
    selectedComponent,
    clearAll,
    fetchTree,
    clearResource,
    fetchFileDetail,
    fetchCatalog,
    selectContent,
    updatePageCopyModalOpen,
    localeChange,
    fetchAppInfo,
  } = props;

  // get url search params
  const { fileId, folderId, applicationId, contentId } = useParams<PageParam>();

  const handleSelectContent = (params: PageParam) => {
    clearResource({
      onSuccess: () => {
        selectContent(params);
      },
    });
  };

  useEffect(() => {
    if (applicationId) {
      fetchAppInfo(applicationId);
    }
  }, [applicationId]);

  useEffect(() => {
    if (fileId) {
      fetchFileDetail({ applicationId, ids: [fileId] });
    }

    if (folderId) {
      fetchCatalog({
        applicationId,
        folderId,
      });
    }
  }, []);

  useEffect(() => {
    localeChange(applicationId, locale);
  }, [locale]);

  // get default content id when url search params contentId is empty
  useEffect(() => {
    if (!storeContentId && pageList.length > 0) {
      // get file with filedId or default by index 0
      const file = fileId
        ? pageList.find((item) => item.id === fileId)
        : pageList.find((item) => item.contents && item.contents.length > 0);

      // get content by default index 0
      const contents = file && file?.contents;
      const content =
        contents && contentId ? contents.find((content) => content.id === contentId) : contents?.[0];

      if (content) {
        const defaultContentId = content && content?.id;
        const localeTag = content?.tags.filter((item) => item.locale);

        // push to store
        handleSelectContent({
          applicationId,
          folderId,
          fileId,
          contentId: contentId || defaultContentId,
          locale: localeTag && localeTag.length > 0 ? localeTag[0].locale : '',
          fileType: fileDetail?.type || FileTypeEnum.page,
        });
      }
    }
  }, [pageList]);

  useEffect(() => {
    if (storeContentId) {
      const file = getProjectFile();
      fetchTree(applicationId, storeContentId, fileType || file.type);
    }
  }, [storeContentId]);

  useEffect(() => {
    if (version && version.content && version.content.schemas && version.content.schemas.length > 0) {
      setContainerStyle({
        ...version.content.schemas[0].props,
      });
    }
  }, [versionChange]);

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  const handleContentChange = (contentId: string) => {
    for (let index = 0; index < pageList.length; index++) {
      const item = pageList[index];
      const content = item.contents?.find((subItem) => subItem.id === contentId);
      if (content) {
        const localeTags = content.tags ? content.tags.filter((item) => item.locale) : [];
        selectContent({
          applicationId,
          folderId,
          fileId: item.id,
          contentId,
          locale: localeTags.length > 0 ? localeTags[0].locale : '',
          fileType: 'template',
        });
        break;
      }
    }
  };

  return (
    <StyledLayout hasSider>
      <BuilderContext.Provider value={{ currentMenu, setCurMenu, container: containerRef.current }}>
        <StyledSlider width={40}>
          <Toolbar />
        </StyledSlider>
        <StyledContent>
          <div ref={containerRef} style={{ height: '100%', margin: '0 auto' }}>
            <Viewer
              containerStyle={containerStyle}
              loading={templateLoading || componentLoading || pageLoading}
              onContentChange={handleContentChange}
              onOpenPagesModal={updatePageCopyModalOpen}
            />
            <PageTemplateSelect />
          </div>
        </StyledContent>
        <VariableBind />
        {!selectedComponent?.id && (
          <StyledSlider
            style={{ position: 'absolute', right: 0, top: 52, bottom: 0, height: 'auto' }}
            width={300}>
            <Editor />
          </StyledSlider>
        )}
      </BuilderContext.Provider>
    </StyledLayout>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Index);
