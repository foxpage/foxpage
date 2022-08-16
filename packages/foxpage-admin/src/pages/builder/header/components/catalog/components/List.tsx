import React, { CSSProperties, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { CaretDownOutlined, FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
import { Popover, Tag, Tooltip } from 'antd';
import styled from 'styled-components';

import { BasicTemRing, LocaleTag, Ring, VLine } from '@/components/index';
import { suffixTagColor } from '@/constants/file';
import { GlobalContext } from '@/pages/system';
import { CatalogContentSelectParams, CatalogFileEntity, ContentEntity } from '@/types/index';
import { formatter } from '@/utils/index';

const CONTENT_LIST = 'Content-list';

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
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Menu = styled.ul`
  width: 320px;
  max-height: 400px;
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
  width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
`;

interface CatalogList {
  root: string;
  applicationId: string;
  contentId: string;
  fileId: string;
  folderId: string;
  contentList: CatalogFileEntity[];
  locale: string;
  selectContent: (param: CatalogContentSelectParams) => void;
  selectFoldStatus: (id: string, fold: boolean) => void;
  setLocale: (locale: string) => void;
}

const Main: React.FC<CatalogList> = (props) => {
  const {
    root,
    applicationId,
    contentId,
    fileId: propsFileId,
    folderId,
    contentList = [],
    locale,
    selectContent,
    selectFoldStatus,
    setLocale,
  } = props;
  const [folderOpen, setFolderOpen] = useState<boolean>(true);
  const [fileId, setFileId] = useState('');
  const { locale: i18n } = useContext(GlobalContext);

  useEffect(() => {
    if (propsFileId) setFileId(propsFileId);
  }, [propsFileId]);

  // expand current file by default
  useEffect(() => {
    if (fileId) {
      selectFoldStatus(fileId, false);
      // } else {
      // use first file when there is no file id in url search params
      // const defaultFile = contentList.find((item) => item.contents && item.contents.length > 0);

      // if (defaultFile) selectFoldStatus(defaultFile.id, false);
    }
  }, [fileId, selectFoldStatus]);

  // get current content
  const currentContent = useMemo(() => {
    const currentFile =
      (contentList && contentList.find((file) => file.id === fileId)) ||
      contentList.find((item) => item.contents && item.contents.length > 0);
    const currentFileContents = currentFile && currentFile.contents;

    return currentFileContents && currentFileContents.find((content) => content.id === contentId);
  }, [contentList, fileId, contentId]);

  const reSortList = useCallback((originList) => {
    const contentRecord: Record<string, ContentEntity[]> = {};
    const extendRecord: Record<string, string[]> = {};
    const list: ContentEntity[] = [];

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

  const handleSecondFolderClick = (menu) => {
    const { id, contents, fold } = menu;
    if (id && contents && contents.length > 0) selectFoldStatus(id, !fold);
  };

  const handlePopoverShow = (visible: boolean) => {
    if (contentId) {
      if (visible) {
        setTimeout(() => {
          document.getElementById(contentId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  };

  const iconStyle: CSSProperties = {
    marginRight: 4,
    transform: 'scale(0.8)',
  };

  const menu = (
    <Menu id={CONTENT_LIST}>
      <MenuItem
        onClick={() => {
          setFolderOpen(!folderOpen);
        }}
        style={{ paddingLeft: 2 }}>
        <CaretDownOutlined rotate={folderOpen ? 0 : 270} style={iconStyle} />
        {folderOpen ? <FolderOpenOutlined style={iconStyle} /> : <FolderOutlined style={iconStyle} />}
        {root}
      </MenuItem>
      {folderOpen &&
        contentList.map((item) => (
          <React.Fragment key={item.id}>
            <MenuItem
              className={item.contents && item.contents.length > 0 ? '' : 'disabled'}
              onClick={() => handleSecondFolderClick(item)}>
              <CaretDownOutlined rotate={!item.fold ? 0 : 270} style={iconStyle} />
              <Tag style={{ transform: 'scale(0.8)' }} color={suffixTagColor[item.type]}>
                {i18n.business.file[item.type]}
              </Tag>
              <MenuTitleText style={{ maxWidth: 190 }}>
                <Tooltip title={item.name}>{item.name}</Tooltip>
              </MenuTitleText>
            </MenuItem>
            {!item.fold && item.contents && item.contents.length > 0 && (
              <>
                {reSortList(item.contents).map((subItem) => {
                  const { id, isBase, extendId, tags = [] } = subItem || {};
                  const isSelected = contentId === id;
                  const _isBase =
                    isBase && !!item.contents && item.contents.find((content) => content.extendId === id);
                  const isInherited = !_isBase && !!extendId;
                  const locales = tags.filter((localeItem) => localeItem.locale).map((item) => item.locale);

                  return (
                    <MenuItem
                      id={id}
                      key={id}
                      className={isSelected ? 'active' : ''}
                      style={{ paddingLeft: 34, paddingRight: 4 }}
                      onClick={() => {
                        if (!isSelected) {
                          const localeTags = tags.filter((item) => item.locale);
                          selectContent({
                            applicationId,
                            folderId,
                            fileId: item.id,
                            contentId: id,
                            locale: localeTags.length > 0 ? (localeTags[0].locale as string) : '',
                            fileType: item.type,
                          });
                        }
                      }}>
                      <Link
                        to={{
                          pathname: '/builder',
                          search: `?applicationId=${applicationId}&folderId=${folderId}&fileId=${item.id}&contentId=${subItem.id}`,
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
                            <Tooltip title={subItem.title}>{subItem.title}</Tooltip>
                          </ContentName>
                          <div style={{ width: 50 }}>
                            {locales.length > 0 ? (
                              <LocaleTag
                                color="blue"
                                style={{
                                  marginRight: 4,
                                  transform: 'scale(0.8)',
                                  padding: '2px 0 !important ',
                                }}>
                                {locales[0] as string}
                              </LocaleTag>
                            ) : (
                              <></>
                            )}
                          </div>
                          {subItem.liveVersionNumber && subItem.liveVersionNumber > 0 ? (
                            <Tag color="orange" style={{ margin: '0 0 0 4px', transform: 'scale(0.8)' }}>
                              {formatter(subItem.liveVersionNumber)}
                            </Tag>
                          ) : (
                            <></>
                          )}
                        </MenuItemSlot>
                      </Link>
                    </MenuItem>
                  );
                })}
              </>
            )}
          </React.Fragment>
        ))}
    </Menu>
  );

  const localeMenu = useMemo(
    () => (
      <Menu style={{ width: 76, padding: 0 }}>
        {currentContent &&
          currentContent.tags
            .filter((localeItem) => localeItem.locale)
            .map((item) => {
              const locale: string = item.locale as string;

              return (
                <React.Fragment key={locale}>
                  <MenuItem onClick={() => setLocale(locale)}>{locale}</MenuItem>
                </React.Fragment>
              );
            })}
      </Menu>
    ),
    [currentContent],
  );

  return (
    <>
      <Popover
        zIndex={99}
        placement="bottomLeft"
        overlayClassName="foxpage-builder-header_popover foxpage-builder-header_content_popover"
        trigger={['hover']}
        content={menu}
        getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
        onVisibleChange={handlePopoverShow}>
        <MenuTitle>
          <MenuTitleText>{currentContent?.title || ''}</MenuTitleText>
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
          <MenuTitle style={{ width: 80, display: 'flex', justifyContent: 'space-between' }}>
            <MenuTitleText>{locale}</MenuTitleText>
            <CaretDownOutlined style={{ fontSize: 8, marginLeft: 4 }} />
          </MenuTitle>
        </Popover>
      )}
    </>
  );
};

export default Main;
