import React, { useContext, useEffect, useState } from 'react';

import { CheckOutlined } from '@ant-design/icons';
import { Button, Input, Tag } from 'antd';
import styled from 'styled-components';

import JSONEditor from '@/components/business/JsonEditor';
import OperationDrawer from '@/components/business/OperationDrawer';
import { Field, Group, Label } from '@/components/widgets/group';
import GlobalContext from '@/pages/GlobalContext';
import { ContentType } from '@/types/application/content';
import { TagType } from '@/types/application/tag';

const LocaleSelect = styled.div`
  border: 1px solid rgb(217, 217, 217);
  padding: 8px;
`;

interface ContentEditType {
  open: boolean;
  content?: ContentType;
  locales: string[];
  onClose: () => void;
  onSave: (content: ContentType) => void;
}

const ContentEditDrawer: React.FC<ContentEditType> = (props) => {
  const { open, content, locales = [], onClose, onSave } = props;
  const [editContent, setEditContent] = useState<ContentType>(content as ContentType);
  const [localesTag, setLocalesTag] = useState<TagType[]>([]);
  const [queryTag, setQueryTag] = useState<TagType>({});
  const { locale } = useContext(GlobalContext);
  const { global, content: contentI18n } = locale.business;

  useEffect(() => {
    if (content) {
      setEditContent((content || {}) as ContentType);
    }
  }, [content]);

  useEffect(() => {
    if (editContent?.tags) {
      setLocalesTag(editContent.tags.filter((item) => item.locale) || []);
      setQueryTag(editContent.tags.find((item) => item.query) || {});
    }
  }, [editContent]);

  const update = (key: string, value: unknown) => {
    const newFile = Object.assign({}, editContent);
    newFile[key] = value;
    setEditContent(newFile);
  };

  const handleLocaleClick = (locale: string) => {
    const selectedIndex = localesTag.findIndex((item) => item.locale === locale);
    const newLocalesTag: TagType[] = [];
    Object.assign(newLocalesTag, localesTag);
    if (selectedIndex > -1) {
      newLocalesTag.splice(selectedIndex, 1);
    } else {
      newLocalesTag.push({ locale });
    }
    if (queryTag.query) {
      update('tags', [...newLocalesTag, queryTag]);
    } else {
      update('tags', [...newLocalesTag]);
    }
  };

  const handleQueryTagChange = (value?: string) => {
    if (value) {
      update('tags', [...localesTag, { query: value }]);
    } else {
      update('tags', [...localesTag]);
    }
  };

  return (
    <OperationDrawer
      open={open}
      title={editContent && editContent.id ? global.edit : global.add}
      onClose={onClose}
      width={480}
      destroyOnClose
      actions={
        <Button
          type="primary"
          onClick={() => {
            onSave(editContent);
          }}>
          {global.add}
        </Button>
      }>
      {editContent ? (
        <Group>
          <Field>
            <Label>{global.nameLabel}</Label>
            <Input
              value={editContent.title}
              placeholder={contentI18n.nameLabel}
              onChange={(e) => update('title', e.target.value)}
            />
          </Field>
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
          <Field>
            <Label>{contentI18n.query}</Label>
            <JSONEditor
              jsonData={queryTag.query || {}}
              onChangeJSON={(json) => {
                handleQueryTagChange(json);
              }}
              onError={() => {
                handleQueryTagChange();
              }}
            />
          </Field>
        </Group>
      ) : (
        <div />
      )}
    </OperationDrawer>
  );
};

export default ContentEditDrawer;
