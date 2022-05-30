import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { CheckOutlined, InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Input, Select, Tag } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/projects/project/content';
import JSONEditor from '@/components/business/JsonEditor';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Field, Group, Label } from '@/components/widgets/group';
import { FileTypeEnum } from '@/constants/index';
import GlobalContext from '@/pages/GlobalContext';
import { ProjectContentTag } from '@/types/application/project';
import getLocationIfo from '@/utils/get-location-info';
import { objectEmptyCheck } from '@/utils/object-empty-check';

const LocaleSelect = styled.div`
  border: 1px solid rgb(217, 217, 217);
  padding: 8px;
`;

const Tips = styled.p`
  color: #f5222d;
  margin: 10px 0;
  font-size: 12px;
`;

const mapStateToProps = (store: RootState) => ({
  state: store.workspace.projects.project.content.editorDrawerOpen,
  editContent: store.workspace.projects.project.content.editContent,
  locales: store.workspace.projects.project.content.locales,
  fileDetail: store.workspace.projects.project.content.fileDetail,
  saveLoading: store.workspace.projects.project.content.saveLoading,
  baseContents: store.workspace.projects.project.content.baseContents,
});

const mapDispatchToProps = {
  closeDrawer: ACTIONS.updateEditDrawerOpen,
  update: ACTIONS.updateEditContentValue,
  updateTag: ACTIONS.updateEditContentTags,
  save: ACTIONS.saveContent,
  fetchLocales: ACTIONS.fetchLocales,
};

type ProjectContentEditDrawerType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const EditDrawer: React.FC<ProjectContentEditDrawerType> = (props) => {
  const {
    state,
    fileDetail,
    editContent,
    locales = [],
    saveLoading,
    baseContents,
    closeDrawer,
    update,
    updateTag,
    save,
    fetchLocales,
  } = props;

  // multi-language
  const { locale } = useContext(GlobalContext);
  const { global, content } = locale.business;

  // url search params
  const { applicationId, fileId } = getLocationIfo(useLocation());

  const localesTag: ProjectContentTag[] = editContent?.tags?.filter((item) => item.locale) || [];
  const queryTag: ProjectContentTag = editContent?.tags?.find((item) => item.query) || {};
  const isBase = editContent?.isBase;

  useEffect(() => {
    fetchLocales(applicationId as string);
  }, []);

  const handleLocaleClick = (locale: string) => {
    const selected = localesTag.find((item) => item.locale === locale);
    let newLocalesTag: ProjectContentTag[] = [];
    if (selected) {
      newLocalesTag = localesTag.filter((item) => item.locale !== locale);
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
      open={state}
      title={editContent?.id ? content.edit : content.add}
      onClose={() => {
        closeDrawer(false);
      }}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            save({
              applicationId: applicationId as string,
              fileId: fileId as string,
              fileType: fileDetail?.type || FileTypeEnum.page,
            });
          }}>
          {global.apply}
          {saveLoading && <SyncOutlined spin={true} style={{ color: '#fff' }} />}
        </Button>
      }>
      {editContent ? (
        <Group>
          <Field>
            <Label>{global.nameLabel}</Label>
            <Input
              value={editContent.title}
              placeholder={content.nameLabel}
              onChange={(e) => update('title', e.target.value)}
            />
          </Field>
          {!isBase && !objectEmptyCheck(locales) && (
            <Field>
              <Label>{global.locale}</Label>
              <LocaleSelect>
                {locales.map((locale: string) => {
                  const selected = localesTag.find((item) => item.locale === locale);
                  return (
                    <Tag
                      key={locale}
                      onClick={() => {
                        handleLocaleClick(locale);
                      }}
                      color={selected ? 'green' : 'blue'}
                      style={{ width: 70, textAlign: 'center', cursor: 'pointer' }}>
                      {selected && <CheckOutlined />}
                      {locale}
                    </Tag>
                  );
                })}
              </LocaleSelect>
            </Field>
          )}

          {!isBase && (
            <Field>
              <Label>{content.query}</Label>
              <JSONEditor
                jsonData={queryTag.query || {}}
                onChangeJSON={(json) => {
                  updateTag('query', json);
                }}
                onError={() => {
                  updateTag('query', undefined);
                }}
              />
            </Field>
          )}

          {!isBase && (
            <Field>
              <Label>{content.extendTitle}</Label>
              <Tips>
                <InfoCircleOutlined /> {content.extendTips}
              </Tips>
              <Select
                style={{ width: '100%' }}
                value={editContent?.extendId}
                disabled={!!editContent?.id}
                onChange={(value) => update('extendId', value)}>
                {baseContents.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Field>
          )}
        </Group>
      ) : (
        <div />
      )}
    </OperationDrawer>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(EditDrawer);
