import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import { CaretDownOutlined, FileOutlined, ProjectOutlined } from '@ant-design/icons';
import { Select } from 'antd';

import { FileTypeEnum } from '@/constants/index';
import { FileType } from '@/types/application/file';
import { PageContentType } from '@/types/builder';
import { PageParam } from '@/types/builder/page';

import { catalogIconStyle } from './common';
import { ContentName, List, ListItem, StyledSelect } from './Component';

const { Option } = Select;

interface Type {
  contentList: PageContentType[];
  locale: string;
  contentId: string;
  fileDetail?: FileType;
  selectContent: (param: PageParam) => void;
  selectFoldStatus: (id: string, fold: boolean) => void;
  setLocale: (locale: string) => void;
}
const FileList: React.FC<Type> = props => {
  const { contentList = [], locale, contentId, fileDetail, selectContent, setLocale } = props;
  const { applicationId, folderId, fileId } = useParams<{ applicationId: string; folderId: string; fileId: string }>();

  const [fileOpen, setFileOpen] = useState<boolean>(true);
  const fileType = fileDetail?.type || FileTypeEnum.page;

  return (
    <List>
      <ListItem
        key={fileDetail?.id}
        style={{ paddingLeft: 2 }}
        onClick={() => {
          setFileOpen(!fileOpen);
        }}
      >
        <CaretDownOutlined rotate={fileOpen ? 0 : 270} style={catalogIconStyle} />
        <FileOutlined style={catalogIconStyle} />
        {fileDetail?.name || ''}
      </ListItem>
      {fileOpen &&
        contentList.map(item => {
          return (
            <React.Fragment>
              <ListItem
                key={item.id}
                style={{ paddingRight: 4, paddingLeft: 32 }}
                className={contentId === item.id ? 'active' : ''}
                onClick={() => {
                  if (item.id !== contentId) {
                    const localeTags = item.tags ? item.tags.filter(item => item.locale) : [];
                    selectContent({
                      applicationId,
                      folderId,
                      fileId,
                      contentId: item.id,
                      locale: localeTags.length > 0 ? localeTags[0].locale : '',
                      fileType,
                    });
                  }
                }}
              >
                <ProjectOutlined style={{ marginRight: 4 }} />
                <ContentName className={contentId === item.id ? 'selected' : ''}>{item.title}</ContentName>
                <div style={{ position: 'absolute', right: 0 }}>
                  {contentId === item.id && (
                    <StyledSelect
                      size="small"
                      value={locale}
                      onClick={(e: any) => {
                        e.stopPropagation();
                      }}
                      onChange={(val: any) => {
                        setLocale(val);
                      }}
                    >
                      {item.tags
                        .filter(localeItem => localeItem.locale)
                        .map(localeItem => {
                          return (
                            <Option style={{ width: 80 }} key={localeItem.locale} value={localeItem.locale}>
                              {localeItem.locale}
                            </Option>
                          );
                        })}
                    </StyledSelect>
                  )}
                </div>
              </ListItem>
            </React.Fragment>
          );
        })}
    </List>
  );
};

export default FileList;
