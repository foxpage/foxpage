import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { CheckOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Input, Tag } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/group/project/content';
import JSONEditor from '@/components/business/JsonEditor';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Field, Group, Label } from '@/components/widgets/group';
import { FileTypeEnum } from '@/constants/index';
import GlobalContext from '@/pages/GlobalContext';
import { ProjectContentTag } from '@/types/application/project';
import { ProjectContentUrlParams } from '@/types/project';

const LocaleSelect = styled.div`
  border: 1px solid rgb(217, 217, 217);
  padding: 8px;
`;

const mapStateToProps = (store: RootState) => ({
  editorDrawerOpen: store.group.project.content.editorDrawerOpen,
  editContent: store.group.project.content.editContent,
  locales: store.group.project.content.locales,
  fileDetail: store.group.project.content.fileDetail,
  saveLoading: store.group.project.content.saveLoading,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.updateEditDrawerOpen,
  update: ACTIONS.updateEditContentValue,
  updateTag: ACTIONS.updateEditContentTags,
  save: ACTIONS.saveContent,
  fetchLocales: ACTIONS.fetchLocales,
};

type ProjectContentEditDrawerType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const EditDrawer: React.FC<ProjectContentEditDrawerType> = props => {
  const {
    editorDrawerOpen,
    fileDetail,
    editContent,
    locales = [],
    saveLoading,
    closeDrawer,
    update,
    updateTag,
    save,
    fetchLocales,
  } = props;
  const { fileId, applicationId } = useParams<ProjectContentUrlParams>();
  const { locale } = useContext(GlobalContext);
  const { global, content } = locale.business;

  const localesTag: ProjectContentTag[] =
    editContent && editContent.tags ? editContent.tags.filter(item => item.locale) || [] : [];
  const queryTag: ProjectContentTag =
    editContent && editContent.tags ? editContent.tags.find(item => item.query) || {} : {};

  useEffect(() => {
    fetchLocales(applicationId);
  }, []);

  const handleLocaleClick = (locale: string) => {
    const selected = localesTag.find(item => item.locale === locale);
    let newLocalesTag: ProjectContentTag[] = [];
    if (selected) {
      newLocalesTag = localesTag.filter(item => item.locale !== locale);
    } else {
      Object.assign(newLocalesTag, localesTag);
      newLocalesTag.push({ locale });
    }
    if (queryTag.query) {
      update('tags', [...newLocalesTag, queryTag]);
    } else {
      update('tags', [...newLocalesTag]);
    }
  };

  return (
    <OperationDrawer
      open={editorDrawerOpen}
      title={editContent && editContent.id ? content.edit : content.add}
      onClose={() => {
        closeDrawer(false);
      }}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            save({ applicationId, fileId, fileType: fileDetail?.type || FileTypeEnum.page });
          }}
        >
          {global.apply}
          {saveLoading && <SyncOutlined spin={true} style={{ color: '#fff' }} />}
        </Button>
      }
    >
      {editContent ? (
        <Group>
          <Field>
            <Label>{global.nameLabel}</Label>
            <Input
              value={editContent.title}
              placeholder={content.nameLabel}
              onChange={e => update('title', e.target.value)}
            />
          </Field>
          <Field>
            <Label>{global.locale}</Label>
            <LocaleSelect>
              {locales.map((locale: string) => {
                const selected = localesTag.find(item => item.locale === locale);
                return (
                  <Tag
                    onClick={() => {
                      handleLocaleClick(locale);
                    }}
                    color={selected ? 'green' : 'blue'}
                    style={{ width: 70, textAlign: 'center', cursor: 'pointer' }}
                  >
                    {selected && <CheckOutlined />}
                    {locale}
                  </Tag>
                );
              })}
            </LocaleSelect>
          </Field>
          <Field>
            <Label>{content.query}</Label>
            <JSONEditor
              jsonData={queryTag.query || {}}
              onChangeJSON={json => {
                updateTag('query', json);
              }}
              onError={() => {
                updateTag('query', undefined);
              }}
            ></JSONEditor>
          </Field>
        </Group>
      ) : (
        <div></div>
      )}
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EditDrawer);
