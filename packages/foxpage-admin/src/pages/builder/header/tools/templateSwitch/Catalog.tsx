import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  CaretDownOutlined,
  FileOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { Popover, Tag } from 'antd';
import styled from 'styled-components';

import { FileTypeEnum } from '@/constants/index';
import { BasicTemRing, Ring, VLine } from '@/pages/components';
import { PageContentType } from '@/types/builder';
import { PageParam } from '@/types/builder/page';
import formatter from '@/utils/version-formatter';

import { catalogIconStyle } from '../common/CommonStyles';

const MenuTitle = styled.a`
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: #5b6b73;
  &:hover {
    color: #5b6b73;
    background: #f7f7f7;
  }
`;

const MenuTitleText = styled.span`
  display: inline-block;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Menu = styled.ul`
  width: 250px;
  max-height: 450px;
  overflow: auto;
  margin: 0;
  padding: 8px;
  list-style: none;
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
`;

const MenuItem = styled.li`
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 1px dashed #e8e8e8;
  user-select: none;
  color: #000000d8;
  &:last-of-type {
    border-bottom: none;
  }
  &:hover {
    background: #f7f7f7;
  }
  &.active {
    background: #f2f8ff;
  }
  &.disabled {
    color: #00000040 !important;
    background: 0 0;
    cursor: not-allowed;
  }
  &.no-select {
    &:hover {
      color: inherit;
      background: inherit;
    }
  }
  a {
    color: #000000d8;
  }
`;

const MenuItemSlot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ContentName = styled.div`
  display: inline-block;
  margin-right: 12px;
  padding-left: 18px;
  width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
`;

interface Type {
  root: string;
  contentList: PageContentType[];
  locale: string;
  fileId: string;
  contentId: string;
  selectContent: (param: PageParam) => void;
  selectFoldStatus: (id: string, fold: boolean) => void;
  setLocale: (locale: string) => void;
}

const Catalog: React.FC<Type> = (props) => {
  const {
    root,
    contentList = [],
    locale,
    fileId: propsFileId,
    contentId,
    selectContent,
    selectFoldStatus,
    setLocale,
  } = props;
  const [folderOpen, setFolderOpen] = useState<boolean>(true);
  const [fileId, setFileId] = useState('');

  const { applicationId, folderId, fileId: _fileId } = useParams<{
    applicationId: string;
    folderId: string;
    fileId: string;
  }>();

  useEffect(() => {
    const newFileId = propsFileId || _fileId;

    if (newFileId) setFileId(newFileId);
  }, [propsFileId]);

  // expand current file by default
  useEffect(() => {
    if (fileId) {
      selectFoldStatus(fileId, false);
    } else {
      // use first file when there is no file id in url search params
      const defaultFile = contentList.find((item) => item.contents && item.contents.length > 0);
      if (defaultFile) selectFoldStatus(defaultFile.id, false);
    }
  }, [fileId, selectFoldStatus]);

  const reSortList = useCallback((originList) => {
    const contentRecord: Record<string, PageContentType[]> = {};
    const extendRecord: Record<string, string[]> = {};
    const list: PageContentType[] = [];

    originList.forEach((item) => {
      if (item.isBase || !item.extendId) {
        list.push(item);
      } else {
        if (!contentRecord[item.extendId]) {
          contentRecord[item.extendId] = [];
        }
        contentRecord[item.extendId].push(item);
        if (!extendRecord[item.extendId]) {
          extendRecord[item.extendId] = [];
        }
        extendRecord[item.extendId].push(item.id);
      }
    });

    Object.keys(contentRecord).forEach((key) => {
      const children = contentRecord[key];
      if (children && children.length > 0) {
        const idx = list.findIndex((item) => item.id === key);
        list.splice(idx + 1, 0, ...children);
      }
    });

    return list;
  }, []);

  // get current content detail
  const currentFile =
    (contentList && contentList.find((file) => file.id === fileId)) ||
    contentList.find((item) => item.contents && item.contents.length > 0);
  const currentFileContents = currentFile && currentFile.contents;
  const currentContent =
    currentFileContents && currentFileContents.find((content) => content.id === contentId);
  const title = currentContent?.title || '';

  const handleSecondFolderClick = (menu) => {
    const { id, contents, fold } = menu;
    if (id && contents && contents.length > 0) selectFoldStatus(id, !fold);
  };

  const menu = (
    <Menu>
      <MenuItem
        style={{ paddingLeft: 2 }}
        onClick={() => {
          setFolderOpen(!folderOpen);
        }}>
        <CaretDownOutlined rotate={folderOpen ? 0 : 270} style={catalogIconStyle} />
        {folderOpen ? (
          <FolderOpenOutlined style={catalogIconStyle} />
        ) : (
          <FolderOutlined style={catalogIconStyle} />
        )}
        {root}
      </MenuItem>
      {folderOpen &&
        contentList.map((item) => (
          <React.Fragment key={item.id}>
            <MenuItem
              className={item.contents && item.contents.length > 0 ? '' : 'disabled'}
              onClick={() => handleSecondFolderClick(item)}>
              <CaretDownOutlined rotate={!item.fold ? 0 : 270} style={catalogIconStyle} />
              {item.type === FileTypeEnum.page ? (
                <FileTextOutlined style={catalogIconStyle} />
              ) : (
                <FileOutlined style={catalogIconStyle} />
              )}
              {item.name}
            </MenuItem>
            {!item.fold && item.contents && item.contents.length > 0 && (
              <>
                {reSortList(item.contents).map((subItem) => {
                  const isSelected = contentId === subItem.id;
                  const isBase =
                    subItem.isBase &&
                    !!item.contents &&
                    item.contents.find((content) => content.extendId === subItem.id);
                  const isInherited = !subItem.isBase && !!subItem.extendId;

                  return (
                    <React.Fragment key={subItem.id}>
                      <MenuItem
                        className={isSelected ? 'active' : ''}
                        style={{ paddingLeft: 34, paddingRight: 4 }}
                        onClick={() => {
                          if (!isSelected) {
                            const localeTags = subItem.tags ? subItem.tags.filter((item) => item.locale) : [];
                            selectContent({
                              applicationId,
                              folderId,
                              fileId: item.id,
                              contentId: subItem.id,
                              locale: localeTags.length > 0 ? localeTags[0].locale : '',
                              fileType: item.type,
                            });
                          }
                        }}>
                        <Link
                          to={{
                            pathname: `/application/${applicationId}/folder/${folderId}/file/${item.id}/content/${subItem.id}/builder`,
                          }}>
                          <MenuItemSlot>
                            {isBase && <BasicTemRing style={{ left: 34 }} />}
                            {isInherited && (
                              <>
                                <VLine style={{ left: 38 }} />
                                <Ring style={{ left: 36 }} />
                              </>
                            )}
                            <ContentName className={isSelected ? 'selected' : ''}>
                              {subItem.title}
                            </ContentName>
                            {subItem.liveVersionNumber > 0 && (
                              <Tag color="orange" style={{ marginRight: 0 }}>
                                {formatter(subItem.liveVersionNumber)}
                              </Tag>
                            )}
                          </MenuItemSlot>
                        </Link>
                      </MenuItem>
                    </React.Fragment>
                  );
                })}
              </>
            )}
          </React.Fragment>
        ))}
    </Menu>
  );

  const localeMenu = (
    <Menu style={{ width: 76, padding: 0 }}>
      {currentContent &&
        currentContent.tags
          .filter((localeItem) => localeItem.locale)
          .map((item) => (
            <MenuItem key={item.locale} onClick={() => setLocale(item.locale)}>
              {item.locale}
            </MenuItem>
          ))}
    </Menu>
  );

  return (
    <>
      <Popover
        zIndex={99}
        placement="bottomLeft"
        overlayClassName="foxpage-builder-header_popover"
        trigger={['hover']}
        content={menu}
        getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}>
        <MenuTitle>
          <MenuTitleText>{title}</MenuTitleText>
          <CaretDownOutlined style={{ fontSize: 8, marginLeft: 4 }} />
        </MenuTitle>
      </Popover>
      {locale && (
        <Popover
          zIndex={99}
          placement="bottomLeft"
          overlayClassName="foxpage-builder-header_popover"
          trigger={['hover']}
          content={localeMenu}
          getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}>
          <MenuTitle style={{ width: 76, display: 'flex', justifyContent: 'space-between' }}>
            <MenuTitleText>{locale}</MenuTitleText>
            <CaretDownOutlined style={{ fontSize: 8, marginLeft: 4 }} />
          </MenuTitle>
        </Popover>
      )}
    </>
  );
};

export default Catalog;
