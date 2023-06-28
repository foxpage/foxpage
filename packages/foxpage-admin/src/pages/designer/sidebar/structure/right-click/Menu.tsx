import React, { useState } from 'react';

import { CopyOutlined, FormOutlined } from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import styled from 'styled-components';

import { RightClickMenuConfig, Structure } from '@/types/index';

import { RightClickCopyType, RightClickPasteType } from '@/constants/right-click';
import { useFoxpageContext } from '@/pages/designer/context';
import { CopyOptions, PasteOptions } from '@/types/index';
import { DSLInput } from './DSLInput';
import _ from 'lodash';

const RightClickItems = styled.div`
  line-height: 24px;
  padding: 0;
  font-size: 12px;
  min-width: 100px;
  > span {
    margin-left: 4px;
  }
`;

type IProps = {
  children: React.ReactNode;
  config?: RightClickMenuConfig;
  readOnly?: boolean;
  copy?: (params: CopyOptions) => void;
  paste?: (params: PasteOptions) => void;
};

const PublicRightClick: React.FC<IProps> = (props) => {
  const { foxI18n } = useFoxpageContext();
  const [inputType, setInputType] = useState<RightClickPasteType>(RightClickPasteType.IN);
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const { children, copy, paste, config, readOnly = false } = props;
  const {
    // enableCopyIt = true,
    enableCopyAll = true,
    enablePasteIn = true,
    enablePasteAfter = true,
    enablePasteBefore = true,
  } = config || {};
  // @ts-ignore
  const { env } = APP_CONFIG;
  const prod = env === 'prod';

  // const handleCopyIt = () => {
  //   copy?.({ type: RightClickCopyType.CURRENT });
  // };

  const handleCopyAll = () => {
    copy?.({ type: RightClickCopyType.ALL });
  };

  const handlePasteIn = () => {
    paste?.({ type: RightClickPasteType.IN });
  };

  const handlePasteToPre = () => {
    paste?.({ type: RightClickPasteType.BEFORE });
  };

  const handlePasteToNext = () => {
    paste?.({ type: RightClickPasteType.AFTER });
  };

  const handleOpenInputModal = (type: RightClickPasteType) => {
    setInputType(type);
    setInputModalVisible(true);
  };

  const handleInputModalOk = (data: Structure) => {
    paste?.({ type: inputType, inputData: _.isEmpty(data) ? undefined : data });
    setInputModalVisible(false);
  };

  return (
    <>
      <Dropdown
        overlay={
          <Menu>
            {/* {enableCopyIt && (
            <Menu.Item key="1" onClick={handleCopyIt}>
              <RightClickItems>
                <CopyOutlined />
                <span>{foxI18n.rightClickCopyIt}</span>
              </RightClickItems>
            </Menu.Item>
          )} */}
            {enableCopyAll && (
              <Menu.Item key="2" onClick={handleCopyAll}>
                <RightClickItems>
                  <CopyOutlined />
                  <span>{foxI18n.rightClickCopyIt}</span>
                </RightClickItems>
              </Menu.Item>
            )}
            {enablePasteIn && !readOnly && (
              <Menu.Item key="3" onClick={() => handlePasteIn()}>
                <RightClickItems>
                  <FormOutlined />
                  <span>{foxI18n.rightClickPasteIn}</span>
                </RightClickItems>
              </Menu.Item>
            )}
            {enablePasteBefore && !readOnly && (
              <Menu.Item key="4" onClick={() => handlePasteToPre()}>
                <RightClickItems>
                  <FormOutlined />
                  <span>{foxI18n.rightClickPasteBefore}</span>
                </RightClickItems>
              </Menu.Item>
            )}

            {enablePasteAfter && !readOnly && (
              <Menu.Item key="5" onClick={() => handlePasteToNext()}>
                <RightClickItems>
                  <FormOutlined />
                  <span>{foxI18n.rightClickPasteAfter}</span>
                </RightClickItems>
              </Menu.Item>
            )}
            {!prod && enablePasteIn && !readOnly && (
              <Menu.Item key="3-1" onClick={() => handleOpenInputModal(RightClickPasteType.IN)}>
                <RightClickItems>
                  <FormOutlined />
                  <span>
                    {foxI18n.rightClickPasteIn} ( {foxI18n.rightClickPasteFromOutSid} )
                  </span>
                </RightClickItems>
              </Menu.Item>
            )}
            {!prod && enablePasteBefore && !readOnly && (
              <Menu.Item key="4-1" onClick={() => handleOpenInputModal(RightClickPasteType.BEFORE)}>
                <RightClickItems>
                  <FormOutlined />
                  <span>
                    {foxI18n.rightClickPasteBefore} ( {foxI18n.rightClickPasteFromOutSid} )
                  </span>
                </RightClickItems>
              </Menu.Item>
            )}
            {!prod && enablePasteAfter && !readOnly && (
              <Menu.Item key="5-1" onClick={() => handleOpenInputModal(RightClickPasteType.AFTER)}>
                <RightClickItems>
                  <FormOutlined />
                  <span>
                    {foxI18n.rightClickPasteAfter}( {foxI18n.rightClickPasteFromOutSid} )
                  </span>
                </RightClickItems>
              </Menu.Item>
            )}
          </Menu>
        }
        trigger={['contextMenu']}>
        {children}
      </Dropdown>
      <DSLInput
        open={inputModalVisible}
        onOk={handleInputModalOk}
        onCancel={() => setInputModalVisible(false)}
      />
    </>
  );
};
export default PublicRightClick;
