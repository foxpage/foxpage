import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { CheckOutlined, InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, message, Select, Tag } from 'antd';
import styled from 'styled-components';

import { Field, Group, Label, OperationDrawer } from '@/components/index';
import { FileType } from '@/constants/index';
import { JSONCodeEditor } from '@/pages/components/common';
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

const CheckboxLabel = styled.span`
  font-size: 12px;
`;

interface ProjectContentEditDrawer {
  saveLoading: boolean;
  drawerOpen: boolean;
  locales: string[];
  editContent: Partial<ContentEntity>;
  baseContents: Array<Record<string, string>>;
  contentList: ContentEntity[];
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
    contentList,
    closeDrawer,
    fetchLocales,
    updateContentValue,
    updateContentTags,
    saveContent,
  } = props;
  const [selectedLocale, setSelectedLocale] = useState<string[]>([]);

  // i18n
  const { locale } = useContext(GlobalContext);
  const { content, global } = locale.business;

  // url search params
  const { applicationId, fileId } = getLocationIfo(useLocation());

  const localesTag: FileTag[] = editContent?.tags?.filter((item) => item.locale) || [];
  const queryTag: FileTag = editContent?.tags?.find((item) => item.query) || {};
  const isBase = editContent?.isBase;

  useEffect(() => {
    if (applicationId) fetchLocales(applicationId);
  }, []);

  // generate all selected locale with all contents when add new content
  useEffect(() => {
    if (drawerOpen) {
      if (!editContent.id) {
        const localeContent = contentList && contentList.filter((content) => !content.isBase);
        const locales: string[] = [];

        if (localeContent) {
          localeContent.forEach((content) => {
            const contentLocales = content.tags
              .filter((tag) => !!tag?.locale)
              .map((tag) => tag.locale as string);

            if (!objectEmptyCheck(contentLocales)) {
              contentLocales.forEach((locale) => locales.push(locale));
            }
          });
        }

        const newSelectedLocales = Array.from(new Set(locales));
        if (!objectEmptyCheck(newSelectedLocales)) setSelectedLocale(newSelectedLocales);
      }
    } else {
      setSelectedLocale([]);
    }
  }, [contentList, drawerOpen, editContent]);

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

  const handleSave = () => {
    if (!isBase && fileDetail?.type === FileType.page) {
      if (!editContent.tags?.find((tag) => tag.locale)) {
        message.warn(content.localeTips);
        return;
      }
    }

    if (applicationId && fileId) {
      setTimeout(
        () =>
          saveContent({
            applicationId,
            fileId,
            fileType: fileDetail?.type || FileType.page,
          }),
        250,
      );
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
        <Button type="primary" onClick={handleSave}>
          {global.save}
          {saveLoading && <SyncOutlined spin={true} style={{ color: '#fff' }} />}
        </Button>
      }>
      {editContent ? (
        <Group>
          <Field>
            <Label>{global.nameLabel}</Label>
            <Input
              defaultValue={editContent.title}
              placeholder={content.nameLabel}
              onBlur={(e) => updateContentValue('title', e.target.value)}
            />
          </Field>
          {drawerOpen && !isBase && fileDetail?.type === FileType.page && !objectEmptyCheck(locales) && (
            <>
              <Field>
                <Label>{global.locale}</Label>
                {!editContent?.id && (
                  <Checkbox
                    defaultChecked
                    onChange={(e) => updateContentValue('oneLocale', e.target.checked)}
                    style={{ marginBottom: 8 }}>
                    <CheckboxLabel>{content.addMultipleContent}</CheckboxLabel>
                  </Checkbox>
                )}
                <LocaleSelect>
                  {locales.map((locale: string) => {
                    const selected = localesTag.find((item) => item.locale === locale);
                    const exist = selectedLocale.includes(locale);

                    return (
                      <Tag
                        color={selected || exist ? 'green' : 'blue'}
                        key={locale}
                        onClick={() => {
                          handleLocaleClick(locale);
                        }}
                        style={{ width: 70, textAlign: 'center', cursor: 'pointer', marginBottom: 8 }}>
                        {selected && <CheckOutlined />}
                        {locale}
                      </Tag>
                    );
                  })}
                </LocaleSelect>
              </Field>
            </>
          )}

          {drawerOpen && !isBase && fileDetail?.type === FileType.page && (
            <Field>
              <Label>{content.query}</Label>
              <JSONCodeEditor
                //@ts-ignore
                value={queryTag.query || {}}
                onChange={(v) => updateContentTags('query', v)}
                height={150}
              />
            </Field>
          )}

          {drawerOpen && !isBase && fileDetail?.type === FileType.page && (
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
