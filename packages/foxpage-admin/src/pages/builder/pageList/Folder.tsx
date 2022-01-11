import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  CaretDownOutlined,
  FileOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { Select } from 'antd';

import { PageFileType } from '@/types/builder';
import { PageParam } from '@/types/builder/page';

import { catalogIconStyle } from './common';
import { ContentName, List, ListItem, StyledSelect } from './Component';

const { Option } = Select;

interface Type {
  fileList: PageFileType[];
  locale: string;
  contentId: string;
  selectContent: (param: PageParam) => void;
  selectFoldStatus: (id: string, fold: boolean) => void;
  setLocale: (locale: string) => void;
}
const PageList: React.FC<Type> = props => {
  const { locale, fileList = [], contentId, selectContent, selectFoldStatus, setLocale } = props;
  const { applicationId, folderId } = useParams<{ applicationId: string; folderId: string }>();
  const [folderOpen, setFolderOpen] = useState<boolean>(true);
  const folder = localStorage.foxpage_project_folder
    ? JSON.parse(localStorage.foxpage_project_folder)
    : { name: 'folder' };

  return (
    <List>
      <ListItem
        style={{ paddingLeft: 2 }}
        onClick={() => {
          setFolderOpen(!folderOpen);
        }}
      >
        <CaretDownOutlined rotate={folderOpen ? 0 : 270} style={catalogIconStyle} />
        {folderOpen ? <FolderOpenOutlined style={catalogIconStyle} /> : <FolderOutlined style={catalogIconStyle} />}
        {folder.name}
      </ListItem>
      {folderOpen &&
        fileList.map(item => {
          return (
            <React.Fragment>
              <ListItem
                onClick={() => {
                  selectFoldStatus(item.id, !item.fold);
                }}
              >
                {item.contents && item.contents.length > 0 && (
                  <CaretDownOutlined rotate={item.fold ? 270 : 0} style={catalogIconStyle} />
                )}
                <FileOutlined style={catalogIconStyle} />
                {item.name}
              </ListItem>
              {!item.fold && item.contents && item.contents.length > 0 && (
                <React.Fragment>
                  {item.contents.map(subItem => {
                    return (
                      <React.Fragment>
                        <ListItem
                          className={contentId === subItem.id ? 'active' : ''}
                          style={{ paddingLeft: 48, paddingRight: 4 }}
                          onClick={() => {
                            if (contentId !== subItem.id) {
                              const localeTags = subItem.tags ? subItem.tags.filter(item => item.locale) : [];
                              selectContent({
                                applicationId,
                                folderId,
                                fileId: item.id,
                                contentId: subItem.id,
                                locale: localeTags.length > 0 ? localeTags[0].locale : '',
                                fileType: item.type,
                              });
                            }
                          }}
                        >
                          <ProjectOutlined style={{ marginRight: 4 }} />
                          <ContentName className={contentId === subItem.id ? 'selected' : ''}>
                            {subItem.title}
                          </ContentName>
                          <div style={{ position: 'absolute', right: 0 }}>
                            {contentId === subItem.id && (
                              <StyledSelect
                                value={locale}
                                size="small"
                                onClick={(e: any) => {
                                  e.stopPropagation();
                                }}
                                onChange={(val: any) => {
                                  setLocale(val);
                                }}
                              >
                                {subItem.tags
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
                </React.Fragment>
              )}
            </React.Fragment>
          );
        })}
    </List>
  );
};

export default PageList;
