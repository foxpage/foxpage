import React, { useEffect, useState } from 'react';

import { Button, Input, Select } from 'antd';

import OperationDrawer from '@/components/business/OperationDrawer';
import { Field, Group, Label } from '@/components/widgets/group';
import { FileTypes, Suffix } from '@/pages/common/constant/FileType';
import { FileType } from '@/types/application/file';

const { Option } = Select;

interface FileEditProp {
  open: boolean;
  file?: FileType;
  onClose: () => void;
  onSave: (file: FileType) => void;
}
const FileEditDrawer: React.FC<FileEditProp> = props => {
  const { open, file, onClose, onSave } = props;
  const [editFile, setEditFile] = useState<FileType>(file as FileType);

  useEffect(() => {
    if (file) {
      setEditFile((file || {}) as FileType);
    }
  }, [file]);

  const update = (key: string, value: unknown) => {
    const newFile = Object.assign({}, editFile);
    newFile[key] = value;
    setEditFile(newFile);
  };

  const pathnameTag = editFile?.tags?.find(item => item.pathname) || {};
  return (
    <OperationDrawer
      open={open}
      key={editFile?.id}
      title={editFile ? 'Edit' : 'Add'}
      onClose={onClose}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            onSave(editFile);
          }}
        >
          Apply
        </Button>
      }
    >
      {editFile ? (
        <Group>
          <Field>
            <Label>Type</Label>
            <Select
              style={{ width: 150 }}
              defaultValue={editFile.type ? editFile.type : undefined}
              onSelect={value => {
                update('type', value);
              }}
              disabled={!!editFile.id}
            >
              {FileTypes.map(item => (
                <Option value={item.type} key={item.type}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label>Name</Label>
            <Input
              defaultValue={editFile.name}
              placeholder="file name"
              onChange={e => update('name', e.target.value)}
              addonAfter={
                <Select
                  style={{ width: 80 }}
                  value={editFile.suffix || Suffix[0].type}
                  className="select-after"
                  onSelect={value => {
                    update('suffix', value);
                  }}
                >
                  {Suffix.map(item => (
                    <Option key={item.type} value={item.type}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              }
            />
          </Field>
          {editFile.type === 'page' && (
            <Field>
              <Label>Pathname</Label>
              <Input
                defaultValue={pathnameTag.pathname}
                placeholder="pathname"
                onChange={e => {
                  update('tags', [{ pathname: e.target.value }]);
                }}
              />
            </Field>
          )}
        </Group>
      ) : (
        <></>
      )}
    </OperationDrawer>
  );
};

export default FileEditDrawer;
