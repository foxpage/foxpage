import React, { useContext, useEffect, useMemo, useState } from 'react';
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
import { Button, Dropdown, Menu, Modal, Popconfirm, Popover, Select, Table, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import { BasicTemRing, LocaleTag, LocaleView, Name, NameContainer, Ring, VLine } from '@/components/index';
import { FileType } from '@/constants/global';
import UrlWithQRcode from '@/pages/components/common/QRcodeUrl';
import { GlobalContext } from '@/pages/system';
import {
  ContentEntity,
  File,
  ProjectContentCopyParams,
  ProjectContentDeleteParams,
  ProjectContentOfflineParams,
  ProjectContentSaveAsBaseParams,
} from '@/types/index';
import { formatter, objectEmptyCheck, periodFormat } from '@/utils/index';

import VersionList from '../../versions';

const IdLabel = styled.div`
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.75);
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

interface ContentListType {
  applicationId: string;
  folderId: string;
  loading: boolean;
  contents: ContentEntity[];
  fileDetail: File;
  locales: string[];
  openDrawer: (open: boolean, editContent?: Partial<ContentEntity>) => void;
  offlineContent: (params: ProjectContentOfflineParams) => void;
  copyContent: (params: ProjectContentCopyParams, cb?: () => void) => void;
  saveAsBaseContent: (params: ProjectContentSaveAsBaseParams) => void;
  deleteContent: (params: ProjectContentDeleteParams) => void;
  openAuthDrawer: (type: string, id: string) => void;
}

const ContentList: React.FC<ContentListType> = (props) => {
  const {
    applicationId,
    folderId,
    loading,
    contents,
    fileDetail,
    locales,
    openDrawer,
    offlineContent,
    copyContent,
    saveAsBaseContent,
    deleteContent,
    openAuthDrawer,
  } = props;
  const [extendRecord, setExtendRecord] = useState<any>();
  const [list, setList] = useState<any>();
  const [selectContentId, setSelectContentId] = useState('');
  const [selectFileId, setSelectFileId] = useState('');
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

  const { pathname, search } = useLocation();

  // i18n
  const { locale } = useContext(GlobalContext);
  const { content, global, version, history } = locale.business;
  const isPageContent = fileDetail?.type === FileType.page;

  // re-sort by inherit relation
  useEffect(() => {
    let newList: ContentEntity[] = [];
    let extendRecord: Record<string, string[]> = {};

    const contentRecord: Record<string, ContentEntity[]> = {};

    contents.forEach((item) => {
      if (item.isBase || !item.extendId) {
        newList.push(item);
      } else {
        if (!contentRecord[item.extendId]) {
          contentRecord[item.extendId] = [];
        }
        contentRecord[item.extendId].push(item);

        if (!extendRecord[item.extendId]) {
          extendRecord[item.extendId] = [];
        }
        extendRecord[item.extendId].push(item.id);
      }
    });

    Object.keys(contentRecord).forEach((key) => {
      const children = contentRecord[key];
      if (children && children.length > 0) {
        const idx = newList.findIndex((item) => item.id === key);
        newList.splice(idx + 1, 0, ...children);
      }
    });

    setList(newList);
    setExtendRecord(extendRecord);
  }, [contents]);

  const localeOptions = useMemo(() => {
    return locales
      ? locales.map((locale) => ({
          label: locale,
          value: locale,
        }))
      : [];
  }, [locales]);

  const handleOffline = (id, fileId) => {
    if (typeof offlineContent === 'function') {
      offlineContent({
        applicationId,
        id,
        fileId,
      });
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
          fileId: selectFileId,
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

  const handleSaveAsBase = (contentId, fileId) => {
    if (typeof saveAsBaseContent === 'function') {
      saveAsBaseContent({
        applicationId,
        contentId,
        fileId,
      });
    }
  };

  const columns: any = [
    {
      title: '',
      key: '',
      width: 20,
      render: (_text: string, record: ContentEntity) => {
        if (record.isBase && extendRecord[record.id]?.length) {
          return <BasicTemRing />;
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
    },
    {
      title: global.nameLabel,
      dataIndex: 'title',
      render: (text: string, record: ContentEntity) => (
        <>
          <NameContainer>
            <Link
              to={{
                pathname: '/builder',
                search: `?applicationId=${applicationId}&folderId=${folderId}&fileId=${record.fileId}&contentId=${record.id}`,
                state: { backPathname: pathname, backSearch: search },
              }}>
              <Tooltip placement="topLeft" mouseEnterDelay={1} title={text}>
                <Name>{text}</Name>
              </Tooltip>
            </Link>
            {record.urls && !record.isBase && record.urls.length > 0 && (
              <Popover
                placement="bottom"
                content={
                  <React.Fragment>
                    {record.urls?.map((url) => {
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
      title: <Tooltip title={version.liveVersion}>{version.name}</Tooltip>,
      dataIndex: 'liveVersionNumber',
      key: 'liveVersionNumber',
      width: 90,
      render: (version: string) =>
        !!version ? (
          <Tag color="orange" style={{ width: 40, textAlign: 'center' }}>
            {formatter(version)}
          </Tag>
        ) : (
          ''
        ),
    },
    {
      title: global.locale,
      dataIndex: 'tag',
      key: 'tag',
      width: 170,
      render: (_text: string, record: ContentEntity) => {
        if (record.isBase) {
          return <LocaleTag color="blue">base</LocaleTag>;
        }

        const localesTag = record.tags ? record.tags.filter((item) => item.locale) : [];
        return <LocaleView locales={localesTag} />;
      },
    },
    {
      title: global.creator,
      dataIndex: 'creator',
      key: 'creator',
      width: 200,
      render: (_text: string, record: ContentEntity) => {
        return record.creator ? record.creator?.email : '--';
      },
    },
    {
      title: global.createTime,
      dataIndex: 'createTime',
      key: 'createTime',
      width: 200,
      render: (text: string) => periodFormat(text, 'unknown'),
    },
    {
      title: global.actions,
      key: '',
      width: 180,
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
            disabled={fileDetail?.online || !record?.version}
            okText={global.yes}
            cancelText={global.no}
            onConfirm={() => handleOffline(record.id, record.fileId)}>
            <Button
              danger
              type="default"
              size="small"
              shape="circle"
              title={content.offline}
              disabled={fileDetail?.online || !record?.version}
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
                      setSelectFileId(record.fileId);
                      setCopyModalOpen(true);
                    }}
                    style={{ width: '100%', padding: 0, textAlign: 'left' }}>
                    <CopyOutlined /> {content.copy}
                  </Button>
                </Menu.Item>
                <Menu.Item key="save">
                  <Button
                    type="text"
                    disabled={!!record?.isBase}
                    onClick={() => handleSaveAsBase(record.id, record.fileId)}
                    style={{ width: '100%', padding: 0, textAlign: 'left' }}>
                    <SaveOutlined /> {content.saveAsBaseTemplate}
                  </Button>
                </Menu.Item>
                <Menu.Item key="auth">
                  <Button
                    type="text"
                    onClick={() => openAuthDrawer('content', record.id)}
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
                      if (applicationId) {
                        deleteContent({
                          applicationId,
                          id: record.id,
                          status: true,
                          fileId: record.fileId,
                          fileType: 'page',
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
                      <DeleteOutlined /> {global.delete}
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
    },
  ];

  return (
    <>
      <Table rowKey="id" loading={loading} pagination={false} columns={columns} dataSource={list} />
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
        applicationId={applicationId}
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

export default ContentList;
