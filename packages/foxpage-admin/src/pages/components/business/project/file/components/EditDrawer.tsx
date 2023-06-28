import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { ClearOutlined, CloseOutlined, PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Input, message, Modal, Select } from 'antd';
import shortId from 'shortid';
import styled from 'styled-components';

import { Field, Group, Label, OperationDrawer } from '@/components/index';
import { FileType, FileTypes } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import {
  Application,
  File,
  PaginationInfo,
  ProjectContentFetchParams,
  ProjectFileFetchParams,
  ProjectFileSaveParams,
} from '@/types/index';
import { getLocationIfo, objectEmptyCheck } from '@/utils/index';

const { Option } = Select;

const PathContainer = styled.div`
  margin-top: 12px;
  padding: 12px;
  transition: all 0.5s ease 0s;
  border: 1px solid rgba(193, 186, 186, 0.39);
`;

const PathLabel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
`;

const PathFormatError = styled.div`
  font-size: 12px;
  color: red;
`;

function pathVerify(path) {
  return path.match('^/[a-zA-Z0-9\\&%_\\./-~-]*((?<!.html)/|.html)$');
}

interface EditDrawerProps {
  drawerOpen?: boolean;
  saveLoading?: boolean;
  pageInfo?: PaginationInfo;
  editFile: File;
  application?: Application;
  fetchContentList?: (params: ProjectContentFetchParams) => void;
  fetchFileDetail?: (params: any) => void;
  fetchFileList?: (params: ProjectFileFetchParams) => void;
  saveFile?: (params: ProjectFileSaveParams, cb?: () => void) => void;
  updateEditFile?: (name: string, value: unknown) => void;
  closeDrawer?: (open: boolean, editFile?: File) => void;
}

const EditDrawer: React.FC<EditDrawerProps> = (props: EditDrawerProps) => {
  const {
    drawerOpen = false,
    saveLoading = false,
    pageInfo,
    editFile,
    application,
    fetchContentList,
    fetchFileDetail,
    fetchFileList,
    saveFile,
    updateEditFile,
    closeDrawer,
  } = props;
  const [pathArr, setPathArr] = useState<Array<Record<string, string>>>([{ pathname: '' }]);
  const [errorInfo, setErrorInfo] = useState({});
  const [duplicateInfo, setDuplicateInfo] = useState({});

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file, application: appI18n } = locale.business;

  // url params
  const { applicationId, folderId } = getLocationIfo(useLocation());
  const { applicationId: appId } = useParams<{ applicationId: string }>();

  useEffect(() => {
    if (drawerOpen) {
      setPathArr([{ pathname: '' }]);
      setErrorInfo({});
    }
  }, [drawerOpen]);

  useEffect(() => {
    const paths: any = editFile?.tags?.filter((item) => typeof item?.pathname !== 'undefined');

    if (!objectEmptyCheck(paths)) setPathArr(paths);
  }, [editFile]);

  useEffect(() => {
    if (pathArr) {
      let err = {};
      let duplicate = {};

      pathArr.forEach((pathObj, index) => {
        if (pathObj?.pathname) {
          err[index] = !pathVerify(pathObj?.pathname);

          const duplicateArr = pathArr.filter((path) => path.pathname === pathObj.pathname);
          if (duplicateArr && duplicateArr.length > 1) {
            duplicate[index] = true;
          }
        }
      });

      setErrorInfo(err);
      setDuplicateInfo(duplicate);
    }
  }, [pathArr]);

  const domain = useMemo(() => {
    let domain = '';

    const { slug, host } = application || {};
    if (slug && host && host?.[0]) {
      domain = `${host[0]?.url}${host[0]?.url?.endsWith('/') ? '' : '/'}${slug}`;
    }

    return domain;
  }, [application?.slug, application?.host]);

  const disabled = useMemo(() => {
    let disabled = false;

    const hasError = Object.keys(errorInfo).find((key) => errorInfo[key]);
    if (hasError) disabled = true;

    return disabled;
  }, [errorInfo]);

  const resetDisabled = useMemo(() => {
    let disabled = true;

    const hasPath = pathArr.find((path) => !!path?.pathname);
    if (hasPath) disabled = false;

    return disabled;
  }, [pathArr]);

  const handleTagsFilter = useCallback(() => {
    const originalTags = editFile?.tags || [];

    return originalTags.filter((tag) => typeof tag?.pathname === 'undefined');
  }, [editFile]);

  const handlePathReset = () => {
    Modal.confirm({
      title: file.pathReset,
      content: file.pathResetTips,
      okText: global.yes,
      okType: 'danger',
      cancelText: global.no,
      onOk() {
        if (typeof updateEditFile === 'function') {
          const originalTags = handleTagsFilter();

          updateEditFile('tags', originalTags.concat([{ pathname: '' }]));
        }
      },
    });
  };

  const handlePathChange = (type: string, index?: number, value?: string) => {
    const newPathArr = pathArr.concat();

    if (type === 'delete' && typeof index === 'number') {
      newPathArr.splice(index, 1);
    } else if (type === 'add') {
      newPathArr.push({
        pathname: '',
      });
    } else if (type === 'value' && typeof index === 'number' && !!value) {
      newPathArr.splice(index, 1, {
        pathname: value,
      });
    }

    // push the latest path config to store
    if (typeof updateEditFile === 'function' && newPathArr) {
      const originalTags = handleTagsFilter();

      updateEditFile('tags', originalTags.concat(newPathArr));
    }
  };

  const handleClose = () => {
    if (typeof closeDrawer === 'function') closeDrawer(false);
  };

  const handleUpdate = (type, value) => {
    if (typeof updateEditFile === 'function') updateEditFile(type, value);
  };

  const handleSave = () => {
    if (pathArr) {
      const newPathArr = pathArr.filter((item) => item?.pathname);

      if (typeof updateEditFile === 'function' && newPathArr) updateEditFile('tags', newPathArr);
    }

    if (!editFile.type) {
      message.warning(appI18n.typeInvalid);
      return;
    }
    if (!editFile.name) {
      message.warning(appI18n.nameInvalid);
      return;
    }

    if (applicationId || editFile?.applicationId || editFile?.application?.id) {
      if (typeof saveFile === 'function')
        setTimeout(() => {
          saveFile(
            {
              applicationId: applicationId || editFile?.application?.id || editFile?.applicationId || '',
              folderId: folderId || editFile?.folderId,
            },
            () => {
              // close drawer
              handleClose();

              // refresh
              if (typeof fetchFileDetail === 'function' && editFile?.id) {
                fetchFileDetail({ applicationId: applicationId || appId, ids: [editFile.id] });
              }

              if (typeof fetchContentList === 'function' && applicationId && editFile?.id) {
                fetchContentList({ applicationId, fileId: editFile.id, fileType: editFile?.type });
              }

              if (typeof fetchFileList === 'function' && pageInfo?.page && pageInfo?.size) {
                fetchFileList({
                  applicationId: applicationId || editFile?.application?.id || editFile?.applicationId || '',
                  id: folderId || editFile?.folderId,
                  page: pageInfo.page,
                  size: pageInfo.size,
                });
              }
            },
          );
        }, 250);
    }
  };

  return (
    <OperationDrawer
      destroyOnClose
      width={480}
      title={editFile?.id ? global.edit : global.add}
      open={drawerOpen}
      onClose={handleClose}
      actions={
        <Button type="primary" disabled={disabled} onClick={handleSave}>
          {global.save}
          {saveLoading && <SyncOutlined spin={true} style={{ color: '#fff' }} />}
        </Button>
      }>
      <Group>
        <Field>
          <Label>{global.type}</Label>
          <Select
            disabled={!!editFile?.id}
            value={editFile?.type}
            onSelect={(value) => {
              handleUpdate('type', value);
            }}
            style={{ width: 150 }}>
            {FileTypes.map((item) => (
              <Option value={item.type} key={item.type}>
                {file[item.type]}
              </Option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>{global.nameLabel}</Label>
          <Input
            value={editFile?.name}
            placeholder={global.nameLabelLength2Invalid?.toLowerCase()}
            onChange={(e) => handleUpdate('name', e.target.value)}
          />
        </Field>
      </Group>
      {editFile?.type === FileType.page && (
        <Group>
          <Field>
            <Label>{file.pathSetting}</Label>
          </Field>
          <Field>
            {pathArr.map((path, index) => (
              <PathContainer key={shortId()}>
                <PathLabel>
                  #{index + 1}
                  {pathArr.length > 1 && <CloseOutlined onClick={() => handlePathChange('delete', index)} />}
                </PathLabel>
                <Input
                  defaultValue={path.pathname as string}
                  placeholder={file.pathname}
                  onBlur={(e) => handlePathChange('value', index, e.target.value)}
                />
                {errorInfo?.[index] ? (
                  <PathFormatError>{file.pathErrorTips}</PathFormatError>
                ) : (
                  <>
                    {duplicateInfo?.[index] ? (
                      <PathFormatError>{file.pathDuplicateTips}</PathFormatError>
                    ) : (
                      <>
                        {path?.pathname && (
                          <PathLabel style={{ marginTop: 8, marginBottom: 0, justifyContent: 'flex-start' }}>
                            <span style={{ flexShrink: 0 }}>{file.previewUrl}:</span>
                            <span style={{ marginLeft: 4 }}>
                              <>
                                {domain}
                                {path.pathname.toLowerCase()}
                              </>
                            </span>
                          </PathLabel>
                        )}
                      </>
                    )}
                  </>
                )}
              </PathContainer>
            ))}
          </Field>
          <Field>
            <div>
              <Button type="dashed" size="small" onClick={() => handlePathChange('add')}>
                <PlusOutlined />
                {file.addPath}
              </Button>
              <Button
                danger
                type="default"
                size="small"
                disabled={resetDisabled}
                onClick={handlePathReset}
                style={{ marginLeft: 8 }}>
                <ClearOutlined /> {file.pathReset}
              </Button>
            </div>
          </Field>
        </Group>
      )}
    </OperationDrawer>
  );
};

export default EditDrawer;
