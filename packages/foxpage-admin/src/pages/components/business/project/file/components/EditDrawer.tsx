import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';

import { SyncOutlined } from '@ant-design/icons';
import { Button, Input, message, Select } from 'antd';

import { Field, Group, Label, OperationDrawer } from '@/components/index';
import { FileType, FileTypes } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { File, PaginationInfo, ProjectFileFetchParams, ProjectFileSaveParams } from '@/types/index';
import { getLocationIfo } from '@/utils/index';

const { Option } = Select;

interface EditDrawerProps {
  drawerOpen: boolean;
  saveLoading: boolean;
  pageInfo: PaginationInfo;
  editFile: File;
  updateEditFile: (name: string, value: unknown) => void;
  saveFile: (params: ProjectFileSaveParams, cb?: () => void) => void;
  fetchFileList: (params: ProjectFileFetchParams) => void;
  closeDrawer: (open: boolean, editFile?: File) => void;
}

const EditDrawer: React.FC<EditDrawerProps> = (props: EditDrawerProps) => {
  const {
    drawerOpen,
    saveLoading,
    pageInfo,
    editFile,
    updateEditFile,
    saveFile,
    fetchFileList,
    closeDrawer,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, file, application } = locale.business;

  // url search params
  const { applicationId, folderId } = getLocationIfo(useLocation());

  const pathnameTag = editFile?.tags?.find((item) => item?.pathname) || {};

  const handleSave = () => {
    if (!editFile.type) {
      message.warning(application.typeInvalid);
      return;
    }
    if (!editFile.name) {
      message.warning(application.nameInvalid);
      return;
    }
    if (editFile?.name && editFile.name.length < 5) {
      message.warning(application.nameLengthInvalid);
      return;
    }

    if (applicationId && folderId) {
      saveFile({ applicationId, folderId }, () => {
        // close drawer
        closeDrawer(false);

        // refresh file list
        fetchFileList({
          applicationId,
          id: folderId,
          page: pageInfo.page,
          size: pageInfo.size,
        });
      });
    }
  };

  return (
    <OperationDrawer
      destroyOnClose
      width={480}
      title={editFile?.id ? global.edit : global.add}
      open={drawerOpen}
      onClose={() => {
        closeDrawer(false);
      }}
      actions={
        <Button type="primary" onClick={handleSave}>
          {global.apply}
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
              updateEditFile('type', value);
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
            placeholder={file.nameLabel}
            onChange={(e) => updateEditFile('name', e.target.value)}
          />
        </Field>

        {editFile?.type === FileType.page && (
          <Field>
            <Label>{file.pathname}</Label>
            <Input
              value={pathnameTag?.pathname as string}
              placeholder={file.pathname}
              onChange={(e) => {
                updateEditFile('tags', [{ pathname: e.target.value }]);
              }}
            />
          </Field>
        )}
      </Group>
    </OperationDrawer>
  );
};

export default EditDrawer;
