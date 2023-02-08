import React, { CSSProperties, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { CaretDownOutlined, FolderOpenOutlined, FolderOutlined } from '@ant-design/icons';
import { Popover, Tag, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

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

const MenuTitleDisplay = styled.span`
  display: flex;
  align-items: center;
  padding: 0 12px;
  color: #5b6b73;
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
  margin: 0;
  padding: 8px;
  list-style: none;
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  overflow: auto;
  ::-webkit-scrollbar-track {
    background-color: #f5f5f5;
  }
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-thumb {
    box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.15);
    background-color: #dbdbdb;
    border-radius: 8px;
  }
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
    background: #eaf2fb;
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
  width: 140px;
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
  readOnly?: boolean;
  selectContent: (param: CatalogContentSelectParams) => void;
  selectFoldStatus: (id: string, fold: boolean) => void;
  setLocale: (locale: string) => void;
}

const mapStateToProps = (store: RootState) => ({
  editStatus: store.builder.main.editStatus && !!store.record.main.localRecords.length,
});

const mapDispatchToProps = {};

const Main: React.FC<CatalogList & ReturnType<typeof mapStateToProps>> = (props) => {
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
    editStatus,
    readOnly = false,
  } = props;
  const [visible, setVisible] = useState(false);
  const [folderOpen, setFolderOpen] = useState<boolean>(true);
  const [fileId, setFileId] = useState('');
  const { locale: i18n } = useContext(GlobalContext);

  useEffect(() => {
    if (propsFileId) setFileId(propsFileId);
  }, [propsFileId]);

  // expand current file by default
  useEffect(() => {
    if (fileId) {
      selectFoldStatus(fileId, !visible);
    }

    // if (fileId) {
    //   selectFoldStatus(fileId, false);
    //   } else {
    //   // use first file when there is no file id in url search params
    //   const defaultFile = contentList.find((item) => item.contents && item.contents.length > 0);
    //
    //   if (defaultFile) selectFoldStatus(defaultFile.id, false);
    // }
  }, [fileId, visible]);

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
    setVisible(visible);

    if (contentId) {
      if (visible) {
        setTimeout(() => {
          document.getElementById(contentId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  };

  const iconStyle: CSSProperties = {
    marginRight: 4,
    transform: 'scale(0.8)',
  };

  const beforeLeave = (e: React.MouseEvent) => {
    if (editStatus) {
      const leave = confirm(i18n.business.builder.leaveWithoutSave);
      if (!leave) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
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
        <MenuTitleText style={{ maxWidth: 230 }}>
          <Tooltip title={root}>{root}</Tooltip>
        </MenuTitleText>
      </MenuItem>
      {folderOpen &&
        contentList.map((item) => (
          <React.Fragment key={item.id}>
            <MenuItem
              className={item.contents && item.contents.length > 0 ? '' : 'disabled'}
              onClick={() => handleSecondFolderClick(item)}>
              <CaretDownOutlined rotate={!item.fold ? 0 : 270} style={iconStyle} />
              <Tag
                style={{ transform: 'scale(0.8)', minWidth: '38px', textAlign: 'center' }}
                color={suffixTagColor[item.type]}>
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
                      }}
                      style={{ padding: 0 }}>
                      <a
                        href={`#/builder?applicationId=${applicationId}&folderId=${folderId}&fileId=${item.id}&contentId=${subItem.id}`}
                        onClick={beforeLeave}
                        style={{ display: 'block', padding: '8px 4px 8px 50px' }}>
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
                      </a>
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
      <Menu style={{ width: 100, padding: 0 }}>
        {currentContent &&
          currentContent.tags
            .filter((localeItem) => localeItem.locale)
            .map((item) => {
              const locale: string = item.locale as string;

              return (
                <MenuItem key={locale} onClick={() => setLocale(locale)}>
                  {locale}
                </MenuItem>
              );
            })}
      </Menu>
    ),
    [currentContent],
  );

  return (
    <>
      {readOnly ? (
        <MenuTitleDisplay>
          <MenuTitleText>{currentContent?.title || ''}</MenuTitleText>
        </MenuTitleDisplay>
      ) : (
        <Popover
          zIndex={99}
          placement="bottomLeft"
          overlayClassName="foxpage-builder-header_popover foxpage-builder-header_content_popover"
          trigger={['hover']}
          content={menu}
          getPopupContainer={(triggerNode) => triggerNode.parentNode as HTMLElement}
          onOpenChange={handlePopoverShow}>
          <MenuTitle>
            <MenuTitleText>{currentContent?.title || ''}</MenuTitleText>
            <CaretDownOutlined style={{ fontSize: 8, marginLeft: 4 }} />
          </MenuTitle>
        </Popover>
      )}

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

export default connect(mapStateToProps, mapDispatchToProps)(Main);
