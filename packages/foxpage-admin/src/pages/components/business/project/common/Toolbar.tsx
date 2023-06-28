import React, { useContext, useMemo, useState } from 'react';

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Input, Menu, Select, Tooltip } from 'antd';

import { GlobalContext } from '@/pages/system';
import { Application, ComponentType, File, FileType, ProjectEntity } from '@/types/index';

const { Search } = Input;

interface ToolbarType {
  env: 'application' | 'involved' | 'personal' | 'projects' | 'workspace';
  type: 'folder' | 'file';
  fileDetail?: File;
  folderDetail?: ProjectEntity;
  createDisabled?: boolean;
  deleteDisabled: boolean;
  search?: string;
  onAuthorize?: (type: string, id: string) => void;
  onCreate?: (open: boolean, data?: any) => void;
  onCommit?: () => void;
  onDelete?: () => void;
  onEdit?: (open: boolean, editFile?: File) => void;
  onRevoke?: () => void;
  onSearch?: (search: string, searchType?: string) => void;
}

const Toolbar: React.FC<ToolbarType> = (props: ToolbarType) => {
  const {
    env,
    type,
    fileDetail,
    folderDetail,
    createDisabled,
    deleteDisabled,
    search,
    onAuthorize,
    onCreate,
    onCommit,
    onDelete,
    onEdit,
    onRevoke,
    onSearch,
  } = props;
  const [searchType, setSearchType] = useState('page_template');

  // i18n
  const { locale } = useContext(GlobalContext);
  const {
    content: contentI18n,
    file: fileI18n,
    folder: folderI18n,
    global: globalI18n,
    project: projectI18n,
    store: storeI18n,
  } = locale.business;

  const createI18n = useMemo(() => {
    return type === 'folder' ? fileI18n.add : contentI18n.add;
  }, [type, contentI18n, fileI18n]);

  const deleteI18n = useMemo(() => {
    return type === 'folder' ? projectI18n.delete : fileI18n.delete;
  }, [type, fileI18n, projectI18n]);

  const deleteDisabledTitle = useMemo(() => {
    let title = '';

    if (deleteDisabled) {
      if (type === 'file') {
        if (fileDetail?.online) {
          title = fileI18n.fileCommitToStoreTips;
        } else {
          title = fileI18n.filePageLiveTips;
        }
      }
      if (type === 'folder') {
        title = folderI18n.deleteDisabledTips;
      }
    }

    return title;
  }, [type, deleteDisabled, fileDetail?.online, fileI18n, folderI18n]);

  const searchTypeOptions = useMemo(
    () => [
      {
        label: fileI18n.name,
        value: 'page_template',
      },
      {
        label: contentI18n.name,
        value: 'project_content',
      },
    ],
    [contentI18n, fileI18n],
  );

  const handleSearch = (value) => {
    if (typeof onSearch === 'function') {
      onSearch(value, searchType);
    }
  };

  const handleCommit = () => {
    if (fileDetail?.online) {
      if (typeof onRevoke === 'function') onRevoke();
    } else {
      if (typeof onCommit === 'function') onCommit();
    }
  };

  const handleEdit = () => {
    if (typeof onEdit === 'function') {
      const editFile: File = {
        intro: fileDetail?.intro || '',
        tags: fileDetail?.tags || [],
        suffix: fileDetail?.suffix || '',
        deleted: fileDetail?.deleted || false,
        id: fileDetail?.id || '',
        name: fileDetail?.name || '',
        folderId: fileDetail?.folderId || '',
        type: fileDetail?.type as FileType,
        componentType: fileDetail?.componentType || ('' as ComponentType),
        createTime: fileDetail?.createTime,
        updateTime: fileDetail?.updateTime,
        creator: fileDetail?.creator,
        application: fileDetail?.application as Application,
        hasContent: fileDetail?.hasContent || false,
        hasLiveContent: fileDetail?.hasLiveContent || false,
      };

      onEdit(true, editFile);
    }
  };

  const handleAuthorize = (type, id) => {
    if (typeof onAuthorize === 'function') onAuthorize(type, id);
  };

  const handleDelete = () => {
    if (typeof onDelete === 'function') onDelete();
  };

  const handleCreate = (open: boolean, data?: any) => {
    if (typeof onCreate === 'function') onCreate(open, data);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
      {type === 'folder' ? (
        <Search
          addonBefore={
            <Select
              options={searchTypeOptions}
              value={searchType}
              onChange={setSearchType}
              style={{
                width: 100,
              }}
            />
          }
          placeholder={globalI18n.searchPlaceholder}
          defaultValue={search}
          onSearch={handleSearch}
          style={{ width: 330, marginRight: 8 }}
        />
      ) : (
        <>
          {env === 'application' && (
            <Button
              title={fileDetail?.online ? storeI18n.revoke : storeI18n.commit}
              onClick={handleCommit}
              style={{ marginRight: 8 }}>
              {fileDetail?.online ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
              {fileDetail?.online ? storeI18n.revoke : storeI18n.commit}
            </Button>
          )}
        </>
      )}
      {type === 'file' && env !== 'involved' && (
        <Button onClick={handleEdit} style={{ marginRight: 8 }}>
          <EditOutlined />
          {fileI18n.edit}
        </Button>
      )}
      <Button
        onClick={() => handleAuthorize(type, folderDetail?.id || fileDetail?.id)}
        style={{ marginRight: 8 }}>
        <UserOutlined /> {type === 'folder' ? projectI18n.authorize : fileI18n.authorize}
      </Button>
      <Tooltip title={deleteDisabledTitle}>
        <Button danger disabled={deleteDisabled} onClick={handleDelete} style={{ marginRight: 8 }}>
          <DeleteOutlined /> {deleteI18n}
        </Button>
      </Tooltip>
      {type === 'folder' && (
        <Tooltip title={createDisabled ? folderI18n.countLimit : ''}>
          <Button
            type="primary"
            disabled={createDisabled}
            onClick={() => {
              handleCreate(true);
            }}>
            <>
              <PlusOutlined /> {createI18n}
            </>
          </Button>
        </Tooltip>
      )}
      {type === 'file' && (
        <>
          {fileDetail?.type === 'template' || fileDetail?.type === 'block' ? (
            <Button
              type="primary"
              onClick={() => {
                handleCreate(true);
              }}>
              <>
                <PlusOutlined /> {createI18n}
              </>
            </Button>
          ) : (
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    key="1"
                    onClick={() => {
                      handleCreate(true, { isBase: true });
                    }}>
                    {contentI18n.addBase}
                  </Menu.Item>
                  <Menu.Item
                    key="2"
                    onClick={() => {
                      handleCreate(true);
                    }}>
                    {contentI18n.addLocale}
                  </Menu.Item>
                </Menu>
              }>
              <Button type="primary">
                <PlusOutlined /> {contentI18n.add} <DownOutlined />
              </Button>
            </Dropdown>
          )}
        </>
      )}
    </div>
  );
};

export default Toolbar;
