import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { SyncOutlined } from '@ant-design/icons';
import { Button, Input, Select } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/detail';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Field, Group, Label } from '@/components/widgets/group';
import { FileTypeEnum } from '@/constants/index';
import { FileTypes } from '@/pages/common/constant/FileType';
import GlobalContext from '@/pages/GlobalContext';

const { Option } = Select;

const mapStateToProps = (store: RootState) => ({
  drawerOpen: store.group.project.detail.drawerOpen,
  editFile: store.group.project.detail.editFile,
  saveLoading: store.group.project.detail.saveLoading,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.setAddFileDrawerOpenStatus,
  update: ACTIONS.updateEditFileValue,
  save: ACTIONS.saveFile,
};

type EditDrawerProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const EditDrawer: React.FC<EditDrawerProp> = props => {
  const { drawerOpen, editFile, saveLoading, closeDrawer, update, save } = props;
  const { folderId, applicationId } = useParams<{ folderId: string; applicationId: string }>();
  const { locale } = useContext(GlobalContext);
  const { global, file } = locale.business;

  const pathnameTag = editFile?.tags?.find(item => item.pathname) || {};
  return (
    <OperationDrawer
      open={drawerOpen}
      title={editFile?.id ? 'Edit' : 'Add'}
      onClose={() => {
        closeDrawer(false);
      }}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            save({ folderId, applicationId });
          }}
        >
          {global.apply}
          {saveLoading && <SyncOutlined spin={true} style={{ color: '#fff' }} />}
        </Button>
      }
    >
      <Group>
        <Field>
          <Label>{global.type}</Label>
          <Select
            style={{ width: 150 }}
            value={editFile?.type}
            onSelect={value => {
              update('type', value);
            }}
            disabled={!!editFile?.id}
          >
            {FileTypes.map(item => (
              <Option value={item.type} key={item.type}>
                {file[item.type]}
              </Option>
            ))}
          </Select>
        </Field>
        <Field>
          <Label>{global.nameLabel}</Label>
          <Input value={editFile?.name} placeholder={file.nameLabel} onChange={e => update('name', e.target.value)} />
        </Field>

        {editFile?.type === FileTypeEnum.page && (
          <Field>
            <Label>{file.pathname}</Label>
            <Input
              value={pathnameTag?.pathname}
              placeholder={file.pathname}
              onChange={e => {
                update('tags', [{ pathname: e.target.value }]);
              }}
            />
          </Field>
        )}
      </Group>
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EditDrawer);
