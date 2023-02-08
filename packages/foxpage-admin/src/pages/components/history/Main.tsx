import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { HistoryOutlined } from '@ant-design/icons';
import { usePrevious } from 'ahooks';
import { RootState } from 'typesafe-actions';

import { GlobalContext } from '@/pages/system';
import * as ACTIONS from '@/store/actions/history';
import { getLocationIfo } from '@/utils/index';

import { IconMsg, StyledIcon } from '../../builder/header/Main';

import Drawer from './Drawer';

const mapDispatchToProps = {
  initHistory: ACTIONS.initHistory,
  resetHistory: ACTIONS.resetHistory,
  updateListIndex: ACTIONS.updateListIndex,
};

const mapStateToProps = (store: RootState) => ({
  listIndex: store.history.main.listIndex,
});

type IProps = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    inPreview?: boolean;
  };

const Main = ({ inPreview = false, listIndex, initHistory, resetHistory, updateListIndex }: IProps) => {
  const { locale } = useContext(GlobalContext);
  const { historyRecord } = locale.business;
  const [visible, setVisible] = useState(false);
  const history = useHistory();
  const { versionId, applicationId, contentId } = getLocationIfo(history.location);
  const preViousContentId = usePrevious(contentId);
  useEffect(() => {
    if (applicationId && contentId) {
      initHistory({ applicationId, id: contentId }, versionId);
    }
  }, [applicationId, contentId]);

  useEffect(() => {
    if (preViousContentId && contentId && preViousContentId !== contentId) {
      resetHistory();
    }
    return () => {
      resetHistory();
    };
  }, [contentId, preViousContentId]);

  return (
    <div style={{ height: '100%' }}>
      <StyledIcon onClick={handleOpen}>
        <HistoryOutlined style={{ fontSize: '12px' }} />
        <IconMsg>{historyRecord.title}</IconMsg>
      </StyledIcon>
      <Drawer
        visible={visible}
        {...{ applicationId, contentId }}
        versionListIndex={listIndex}
        onNextVersion={handleNextVersion}
        onClose={handleClose}
        inPreview={inPreview}
      />
    </div>
  );

  function handleOpen() {
    setVisible(true);
  }

  function handleClose() {
    setVisible(false);
  }

  function handleNextVersion(v: number) {
    updateListIndex(v);
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
