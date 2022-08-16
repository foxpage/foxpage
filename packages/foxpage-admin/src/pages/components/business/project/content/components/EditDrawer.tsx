import React, { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { CheckOutlined, InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Input, Select, Tag } from 'antd';
import styled from 'styled-components';

import { Field, Group, JSONEditor, Label, OperationDrawer } from '@/components/index';
import { FileType } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { ContentEntity, File, FileTag, ProjectContentFetchParams } from '@/types/index';
import { getLocationIfo, objectEmptyCheck } from '@/utils/index';

const LocaleSelect = styled.div`
  border: 1px solid rgb(217, 217, 217);
  padding: 8px 0 0 8px;
`;

const Tips = styled.p`
  color: #f5222d;
  margin: 10px 0;
  font-size: 12px;
`;

interface ProjectContentEditDrawer {
  saveLoading: boolean;
  drawerOpen: boolean;
  locales: string[];
  editContent: Partial<ContentEntity>;
  baseContents: Array<Record<string, string>>;
  fileDetail: File;
  closeDrawer: (open: boolean, editContent?: Partial<ContentEntity>) => void;
  fetchLocales: (applicationId: string) => void;
  updateContentValue: (key: string, value: unknown) => void;
  updateContentTags: (key: string, value: unknown) => void;
  saveContent: (params: ProjectContentFetchParams) => void;
}

const EditDrawer: React.FC<ProjectContentEditDrawer> = (props: ProjectContentEditDrawer) => {
  const {
    saveLoading,
    drawerOpen,
    fileDetail,
    editContent,
    locales = [],
    baseContents,
    closeDrawer,
    fetchLocales,
    updateContentValue,
    updateContentTags,
    saveContent,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global, content } = locale.business;

  // url search params
  const { applicationId, fileId } = getLocationIfo(useLocation());

  const localesTag: FileTag[] = editContent?.tags?.filter((item) => item.locale) || [];
  const queryTag: FileTag = editContent?.tags?.find((item) => item.query) || {};
  const isBase = editContent?.isBase;

  useEffect(() => {
    if (applicationId) fetchLocales(applicationId);
  }, []);

  const handleLocaleClick = (locale: string) => {
    let newLocalesTag: FileTag[] = [];

    const selected = localesTag.find((item) => item.locale === locale);
    if (selected) {
      newLocalesTag = localesTag.filter((item) => item.locale !== locale);
    } else {
      Object.assign(newLocalesTag, localesTag);
      newLocalesTag.push({ locale });
    }

    if (queryTag.query) {
      updateContentValue('tags', [...newLocalesTag, queryTag]);
    } else {
      updateContentValue('tags', [...newLocalesTag]);
    }
  };

  return (
    <OperationDrawer
      destroyOnClose
      width={480}
      title={editContent?.id ? content.edit : content.add}
      open={drawerOpen}
      onClose={() => {
        closeDrawer(false);
      }}
      actions={
        <Button
          type="primary"
          onClick={() => {
            if (applicationId && fileId) {
              saveContent({
                applicationId,
                fileId,
                fileType: fileDetail?.type || FileType.page,
              });
            }
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
              onChange={(e) => updateContentValue('title', e.target.value)}
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
                      style={{ width: 70, textAlign: 'center', cursor: 'pointer', marginBottom: 8 }}>
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
                  updateContentTags('query', json);
                }}
                onError={() => {
                  updateContentTags('query', undefined);
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
                onChange={(value) => updateContentValue('extendId', value)}>
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

export default EditDrawer;
