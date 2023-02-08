import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import { CheckOutlined, InfoCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Checkbox, Input, Select, Tag } from 'antd';
import styled from 'styled-components';

import { Field, Group, Label, OperationDrawer } from '@/components/index';
import { FileType } from '@/constants/index';
import { JSONCodeEditor } from '@/pages/components/common';
import { GlobalContext } from '@/pages/system';
import { ContentEntity, FileTag, ProjectContentFetchParams } from '@/types/index';
import { objectEmptyCheck } from '@/utils/index';

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
  type: string;
  saveLoading: boolean;
  drawerOpen: boolean;
  baseContents?: Array<Record<string, string>>;
  locales: string[];
  editContent: Partial<ContentEntity>;
  closeDrawer: (open: boolean, editContent?: Partial<ContentEntity>) => void;
  updateContentValue: (key: string, value: unknown) => void;
  updateContentTags: (key: string, value: unknown) => void;
  saveContent: (params: ProjectContentFetchParams) => void;
}

const EditDrawer: React.FC<ProjectContentEditDrawer> = (props: ProjectContentEditDrawer) => {
  const {
    type,
    saveLoading,
    drawerOpen,
    baseContents,
    editContent,
    locales = [],
    closeDrawer,
    updateContentValue,
    updateContentTags,
    saveContent,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { content, global } = locale.business;

  const { applicationId } = useParams<{ applicationId: string }>();

  const localesTag: FileTag[] = editContent?.tags?.filter((item) => item.locale) || [];
  const queryTag: FileTag = editContent?.tags?.find((item) => item.query) || {};
  const isBase = editContent?.isBase;

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
    if (applicationId && editContent?.fileId) {
      saveContent({
        applicationId,
        fileId: editContent.fileId,
        fileType: FileType.page,
      });
    }
  };

  return (
    <OperationDrawer
      destroyOnClose
      width={480}
      title={content.edit}
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
          {drawerOpen && !isBase && !objectEmptyCheck(locales) && (
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

                    return (
                      <Tag
                        color={selected ? 'green' : 'blue'}
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

          {drawerOpen && !isBase && (
            <Field>
              <Label>{content.query}</Label>
              <JSONCodeEditor
                value={queryTag.query || {}}
                onChange={(v) => updateContentTags('query', v)}
                height={150}
              />
            </Field>
          )}

          {drawerOpen && type === FileType.page && !isBase && baseContents && (
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
