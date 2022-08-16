import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { BugOutlined, CodeOutlined, MoreOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';
import { getLocationIfo } from '@/utils/index';

const MoreItem = styled.div`
  line-height: 32px;
  cursor: pointer;
  padding: 0 24px;
  font-size: 12px;
  width: 100px;
  border-bottom: 1px solid #e8e8e8;
  &:hover {
    color: rgb(24, 144, 255);
    background-color: rgb(242, 242, 242);
  }
  &:last-of-type {
    border-bottom: none;
  }
`;

const mapStateToProps = (store: RootState) => ({
  storeContentId: store.builder.header.contentId,
});

const mapDispatchToProps = {
  updateDslModalOpen: ACTIONS.updateDSLModalVisible,
  updateMockModalVisible: ACTIONS.updateMockModalVisible,
  fetchDSL: ACTIONS.fetchDsl,
};

type HeaderType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<HeaderType> = (props) => {
  const { storeContentId, updateDslModalOpen, updateMockModalVisible, fetchDSL } = props;

  const { applicationId, contentId } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;

  const handleFetchDSL = () => {
    fetchDSL({ applicationId, ids: [contentId || storeContentId] });
  };

  return (
    <React.Fragment>
      <Popover
        placement="bottom"
        overlayClassName="foxpage-builder-header_popover"
        trigger={['hover']}
        content={
          <>
            <MoreItem
              onClick={() => {
                handleFetchDSL();
                updateDslModalOpen(true);
              }}>
              <CodeOutlined style={{ marginRight: 4 }} />
              DSL
            </MoreItem>
            <MoreItem
              onClick={() => {
                updateMockModalVisible(true);
              }}>
              <BugOutlined style={{ marginRight: 4 }} />
              Mock
            </MoreItem>
          </>
        }>
        <StyledIcon>
          <MoreOutlined rotate={90} />
          <IconMsg>{builder.more}</IconMsg>
        </StyledIcon>
      </Popover>
    </React.Fragment>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
