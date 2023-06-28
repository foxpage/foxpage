import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  BranchesOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  LinkOutlined,
  SaveOutlined,
  UserOutlined,
  VerticalAlignBottomOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Image, Menu, Modal, Popconfirm, Popover, Select, Table, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import {
  BasicTemRing,
  BasicTemRingMask,
  LocaleTag,
  LocaleView,
  Name,
  NameContainer,
  Ring,
  VLine,
} from '@/components/index';
import { FileType } from '@/constants/index';
import VersionList from '@/pages/applications/detail/file/pages/content/versions';
import UrlWithQRcode from '@/pages/components/common/QRcodeUrl';
import { GlobalContext } from '@/pages/system';
import {
  ContentEntity,
  File,
  FileTag,
  ProjectContentCopyParams,
  ProjectContentDeleteParams,
  ProjectContentOfflineParams,
  ProjectContentSaveAsBaseParams,
  Screenshots,
} from '@/types/index';
import { formatter, getLocationIfo, objectEmptyCheck, periodFormat } from '@/utils/index';

const IdLabel = styled.div`
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.25);
  margin-top: 8px;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Label = styled.div`
  width: 70px;
`;

const ImageBox = styled(Image)`
  width: 80px !important;
  height: 45px !important;
  border: 1px solid #ebebeb;
  border-radius: 4px;
  padding: 4px;
`;

interface ProjectContentList {
  type: string;
  loading: boolean;
  contentList: ContentEntity[];
  extendRecord: Record<string, string[]>;
  fileDetail: File;
  locales: string[];
  screenshots: Screenshots;
  openDrawer: (open: boolean, editContent?: Partial<ContentEntity>) => void;
  deleteContent: (params: ProjectContentDeleteParams) => void;
  copyContent?: (params: ProjectContentCopyParams, cb?: () => void) => void;
  saveAsBaseContent?: (params: ProjectContentSaveAsBaseParams) => void;
  offlineContent?: (params: ProjectContentOfflineParams) => void;
  openAuthDrawer?: (type: string, id?: string) => void;
}

const ProjectContentList: React.FC<ProjectContentList> = (props: ProjectContentList) => {
  const {
    type,
    loading,
    fileDetail,
    contentList,
    extendRecord,
    locales,
    deleteContent,
    copyContent,
    saveAsBaseContent,
    offlineContent,
    openDrawer,
    openAuthDrawer,
    screenshots = {},
  } = props;
  const [selectContentId, setSelectContentId] = useState('');
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [targetContentLocales, setTargetContentLocales] = useState([]);
  const [versionsModalData, setVersionsModalData] = useState<{
    visible: boolean;
    contentId: string;
    contentName: string;
    fileType: string;
  }>({
    contentId: '',
    visible: false,
    contentName: '',
    fileType: '',
  });

  const isPageContent = fileDetail?.type === FileType.page;

  // url search params
  const { pathname, search, applicationId, fileId } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, content, version, history } = locale.business;

  const localeOptions = useMemo(() => {
    return locales
      ? locales.map((locale) => ({
          label: locale,
          value: locale,
        }))
      : [];
  }, [locales]);

  const generateBaseOfflineDisabled = useCallback(
    (content) => {
      let disabled = false;
      if (isPageContent) {
        if (content && content?.isBase) {
          const childrenIdList = extendRecord?.[content.id] || [];
          if (!objectEmptyCheck(childrenIdList)) {
            const childrenList =
              contentList && contentList.filter((content) => childrenIdList.includes(content.id));
            const childPublished = childrenList && childrenList.find((child) => !!child.version);

            if (childPublished) disabled = true;
          }
        }
      }

      return disabled;
    },
    [fileDetail, extendRecord, contentList],
  );

  const handleAuthorize = (id: string) => {
    if (typeof openAuthDrawer === 'function') {
      openAuthDrawer('content', id);
    }
  };

  const handleCopy = () => {
    if (
      typeof copyContent === 'function' &&
      applicationId &&
      (!isPageContent || (isPageContent && !objectEmptyCheck(targetContentLocales)))
    ) {
      copyContent(
        {
          applicationId,
          fileId,
          fileType: fileDetail.type,
          sourceContentId: selectContentId,
          targetContentLocales: targetContentLocales.map((locale) => ({ locale })),
        },
        () => {
          setCopyModalOpen(false);
        },
      );
    }
  };

  const handleSaveAsBase = (contentId) => {
    if (typeof saveAsBaseContent === 'function') {
      saveAsBaseContent({
        applicationId,
        contentId,
        fileId,
      });
    }
  };

  const handleOffline = (id) => {
    if (typeof offlineContent === 'function') {
      offlineContent({
        applicationId,
        id,
        fileId,
        fileType: fileDetail.type,
      });
    }
  };

  const handleLocaleDuplicate = (locales: FileTag[]) => {
    return locales.map((locale) => {
      const duplicateTags =
        (contentList &&
          contentList.filter((content) => content.tags.find((tag) => tag.locale === locale.locale))) ||
        [];

      return {
        ...locale,
        duplicate: duplicateTags.length > 1,
      } as FileTag;
    });
  };

  const authorizeAdmin = useMemo(
    () => type === 'personal' || type === 'application' || type === 'projects',
    [type],
  );

  const columns: any = [
    {
      title: global.nameLabel,
      dataIndex: 'title',
      render: (text: string, record: ContentEntity) => (
        <>
          <NameContainer>
            <Link
              to={{
                pathname: '/builder',
                search: `?applicationId=${applicationId}&folderId=${fileDetail?.folderId}&fileId=${fileId}&contentId=${record.id}`,
                state: { backPathname: pathname, backSearch: search },
              }}>
              <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
                <Name style={{ maxWidth: 230 }}>{text}</Name>
              </Tooltip>
            </Link>
            {fileDetail?.type === FileType.page &&
              !record.isBase &&
              record.urls?.length > 0 &&
              !!record.tags.find((tag) => tag.locale) &&
              !!record?.version && (
                <Popover
                  placement="bottom"
                  content={
                    <React.Fragment>
                      {record.urls.map((url) => {
                        return (
                          <p key={url}>
                            <UrlWithQRcode url={url}>
                              <a href={url} target="_blank">
                                {url}
                              </a>
                            </UrlWithQRcode>
                          </p>
                        );
                      })}
                    </React.Fragment>
                  }
                  trigger="hover">
                  <LinkOutlined style={{ marginLeft: 6 }} />
                </Popover>
              )}
          </NameContainer>
          <IdLabel>
            {global.idLabel}: {record.id}
          </IdLabel>
        </>
      ),
    },
    {
      title: global.screenshot,
      dataIndex: '',
      width: 200,
      render: (_: string, record: File) => {
        const pictures = screenshots[record.id] || [];
        const [one, two, ..._rest] = pictures;
        if (one || two) {
          return (
            <Image.PreviewGroup>
              {one && <ImageBox key={one.sort} src={one.url} />}
              {two && <ImageBox key={two.sort} src={two.url} style={{ marginLeft: 4 }} />}
            </Image.PreviewGroup>
          );
        }
        return '-';
      },
    },
    {
      title: <Tooltip title={version.liveVersion}>{version.name}</Tooltip>,
      dataIndex: 'liveVersionNumber',
      key: 'liveVersionNumber',
      width: 90,
      render: (text: string) => {
        return text ? (
          <Tag color="orange" style={{ width: 40, textAlign: 'center' }}>
            {formatter(text)}
          </Tag>
        ) : (
          '-'
        );
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      width: 200,
      render: (_text: string, record: ContentEntity) => {
        return record.creator ? record.creator.email : '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
  ];

  if (isPageContent) {
    columns.splice(3, 1, {
      title: global.locale,
      dataIndex: 'tag',
      key: 'tag',
      width: 170,
      render: (_text: string, record: ContentEntity) => {
        if (record.isBase) {
          return <LocaleTag color="blue">base</LocaleTag>;
        }

        const localesTag = record.tags ? record.tags.filter((item) => item.locale) : [];
        const localesTagFormatted = handleLocaleDuplicate(localesTag);
        return <LocaleView locales={localesTagFormatted} />;
      },
    });
  }

  if (isPageContent) {
    columns.unshift({
      title: '',
      key: '',
      width: 20,
      render: (_text: string, record: ContentEntity) => {
        if (record.isBase && extendRecord[record.id]?.length) {
          return (
            <>
              <BasicTemRingMask />
              <BasicTemRing />
            </>
          );
        }
        if (record.extendId) {
          return (
            <>
              <Ring />
              <VLine />
            </>
          );
        }
        return <></>;
      },
    });
  }

  if (authorizeAdmin) {
    columns.push({
      title: global.actions,
      key: '',
      width: 200,
      render: (_text: string, record: ContentEntity) => (
        <>
          <Button
            type="default"
            size="small"
            shape="circle"
            title={global.edit}
            onClick={() => openDrawer(true, record)}>
            <EditOutlined />
          </Button>
          <Popconfirm
            title={`${content.offlineMessage} ${record.title}?`}
            disabled={fileDetail?.online || !record?.version || generateBaseOfflineDisabled(record)}
            okText={global.yes}
            cancelText={global.no}
            onConfirm={() => handleOffline(record.id)}>
            <Button
              danger
              type="default"
              size="small"
              shape="circle"
              title={content.offline}
              disabled={fileDetail?.online || !record?.version || generateBaseOfflineDisabled(record)}
              style={{ marginLeft: 8 }}>
              <VerticalAlignBottomOutlined />
            </Button>
          </Popconfirm>
          <Button
            type="default"
            size="small"
            shape="circle"
            title={history.versions}
            style={{ marginLeft: 8 }}
            onClick={() => {
              setVersionsModalData({
                visible: true,
                contentId: record.id,
                contentName: record.title,
                fileType: record.type,
              });
            }}>
            <BranchesOutlined />
          </Button>
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="copy">
                  <Button
                    type="text"
                    onClick={() => {
                      setSelectContentId(record.id);
                      setCopyModalOpen(true);
                    }}
                    style={{ width: '100%', padding: 0, textAlign: 'left' }}>
                    <CopyOutlined /> {content.copy}
                  </Button>
                </Menu.Item>
                <>
                  {fileDetail?.type === FileType.page && (
                    <Menu.Item key="save">
                      <Button
                        type="text"
                        disabled={!!record?.isBase}
                        onClick={() => handleSaveAsBase(record.id)}
                        style={{ width: '100%', padding: 0, textAlign: 'left' }}>
                        <SaveOutlined /> {content.saveAsBaseTemplate}
                      </Button>
                    </Menu.Item>
                  )}
                </>
                <Menu.Item key="auth">
                  <Button
                    type="text"
                    onClick={() => handleAuthorize(record.id)}
                    style={{ width: '100%', padding: 0, textAlign: 'left' }}>
                    <UserOutlined /> {global.userPermission}
                  </Button>
                </Menu.Item>
                <Menu.Item key="delete">
                  <Popconfirm
                    title={`${content.deleteMessage} ${record.title}?`}
                    disabled={
                      fileDetail?.online ||
                      !!(record.isBase && extendRecord[record.id]?.length) ||
                      !!record?.version
                    }
                    onConfirm={() => {
                      if (applicationId && fileId && fileDetail) {
                        deleteContent({
                          applicationId,
                          id: record.id,
                          status: true,
                          fileId,
                          fileType: fileDetail.type,
                        });
                      }
                    }}
                    okText={global.yes}
                    cancelText={global.no}>
                    <Button
                      danger
                      type="text"
                      disabled={
                        fileDetail?.online ||
                        !!(record.isBase && extendRecord[record.id]?.length) ||
                        !!record?.version
                      }
                      style={{ width: '100%', padding: 0, textAlign: 'left' }}>
                      <DeleteOutlined />
                      {global.delete}
                    </Button>
                  </Popconfirm>
                </Menu.Item>
              </Menu>
            }>
            <Button type="default" size="small" shape="circle" style={{ marginLeft: 8 }}>
              <EllipsisOutlined />
            </Button>
          </Dropdown>
        </>
      ),
    });
  }

  return (
    <>
      <Table rowKey="id" loading={loading} pagination={false} columns={columns} dataSource={contentList} />
      <Modal
        title={`${content.copy}`}
        open={copyModalOpen}
        onOk={handleCopy}
        onCancel={() => setCopyModalOpen(false)}>
        {isPageContent ? (
          <Container>
            <Label>{global.locale}</Label>
            <Select
              mode="multiple"
              options={localeOptions}
              onChange={setTargetContentLocales}
              style={{ width: '100%' }}
            />
          </Container>
        ) : (
          content.copyTips
        )}
      </Modal>
      <VersionList
        applicationId={applicationId || ''}
        fileId={fileDetail.id}
        folderId={fileDetail.folderId}
        {...versionsModalData}
        closeFunc={() => {
          setVersionsModalData({
            visible: false,
            contentId: '',
            contentName: '',
            fileType: '',
          });
        }}
      />
    </>
  );
};

export default ProjectContentList;
