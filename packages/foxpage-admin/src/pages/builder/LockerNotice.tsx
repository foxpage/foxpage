import React, { useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import { Alert, Button, Modal, Space } from 'antd';
import dayjs from 'dayjs';
import { RootState } from 'typesafe-actions';
import { clearInterval, setInterval } from 'worker-timers';

import { LockerManagerState, LockerState } from '@/types/index';

import * as ACTIONS from '@/actions/builder/main';
import * as RECORD_ACTIONS from '@/actions/record/index';
import { clearCache } from '@/store/sagas/builder/services';

import { GlobalContext } from '../system';

const mapStateToProps = (store: RootState) => ({
  lockerState: store.builder.main.lockerState,
  lockerManagerState: store.builder.main.lockerManagerState,
  serverUpdateTime: store.builder.main.serverUpdateTime,
  contentId: store.builder.main.content.id,
  editStatus: store.builder.main.editStatus && !!store.record.main.localRecords.length,
});

const mapDispatchToProps = {
  handleContentLock: ACTIONS.lockContent,
  setLockerManagerState: ACTIONS.setLockerManagerState,
  handleLockerManager: ACTIONS.handleLockerManager,
  handleContentUnlock: ACTIONS.unlockContent,
  clearLocalRecord: RECORD_ACTIONS.clearLocalRecord,
  updateLockerState: ACTIONS.updateLockerState,
  saveContent: ACTIONS.saveContent,
};

let releaseInterval;
let modal;
let saveInterval;
const LOCKER_TIME = 5 * 60;
const SAVER_TIME = 30 * 1000;

const LockerNotice = ({
  lockerState,
  lockerManagerState,
  handleContentUnlock,
  handleContentLock,
  handleLockerManager,
  saveContent,
  serverUpdateTime: updateTime,
  clearLocalRecord,
  editStatus,
}) => {
  // i18n
  const { locale: i18n } = useContext(GlobalContext);
  const { content: contentI18n } = i18n.business;
  // notice state
  const {
    blocked,
    operator,
    operationTime: newUpdateTime,
    needUpdate,
    preLocked,
  } = lockerState as LockerState;
  const { noticeVisible } = lockerManagerState as LockerManagerState;
  const [unlockRemaining, setUnlockRemaining] = useState(LOCKER_TIME);
  const contentChanged = useMemo(() => {
    return dayjs(newUpdateTime).isAfter(dayjs(updateTime));
  }, [updateTime, newUpdateTime]);

  // effects
  useEffect(() => {
    if (noticeVisible) {
      releaseInterval = setInterval(() => {
        setUnlockRemaining((pre) => pre - 1);
      }, 1000);
    } else {
      resetTimer();
    }
    return () => {
      if (releaseInterval) {
        clearInterval(releaseInterval);
        releaseInterval = undefined;
      }
    };
  }, [noticeVisible, unlockRemaining]);

  useEffect(() => {
    if (unlockRemaining <= 0) {
      handleContentUnlock();
      handleLockerManager(false);
      resetTimer();
    }
  }, [unlockRemaining]);

  useEffect(() => {
    if (modal) {
      return;
    }
    if (needUpdate || (contentChanged && (blocked || preLocked))) {
      modal = Modal.warning({
        title: contentI18n.lockedContentChanged,
        okText: contentI18n.lockedContentFreshButton,
        closable: false,
        maskClosable: false,
        centered: true,
        content: <span>{contentI18n.lockerRefreshTip}</span>,
        onOk: () => {
          clearLocalRecord();
          clearCache('-1').then(() => {
            window.location.reload();
          });
        },
      });
    }
    return () => {
      modal?.destroy();
      modal = undefined;
    };
  }, [blocked, contentChanged, needUpdate]);

  useEffect(() => {
    if (editStatus && !saveInterval) {
      saveInterval = setInterval(() => {
        saveContent({ delay: false, autoSave: true });
      }, SAVER_TIME);
    } else {
      if (saveInterval) clearInterval(saveInterval);
      saveInterval = undefined;
    }
  }, [editStatus]);

  return (
    <>
      {blocked ? (
        <Alert type="warning" showIcon message={`${contentI18n.contentIsLockedBy}: ${operator?.email}`} />
      ) : null}
      {noticeVisible ? (
        <Alert
          type="info"
          showIcon
          message={`${contentI18n.contentWillBeReleased}`}
          action={
            <Space>
              <Button size="small" type="primary" onClick={handleKeep}>
                {contentI18n.lock} {`(${unlockRemaining}s)`}
              </Button>
              <Button size="small" onClick={handleRelease}>
                {contentI18n.unlock}
              </Button>
            </Space>
          }
        />
      ) : null}
    </>
  );

  // callbacks
  function handleKeep(e) {
    e.preventDefault();
    // force to lock when keep
    handleContentLock(true);
    // reset locker first
    handleLockerManager(true);
    resetTimer();
  }
  function handleRelease(e) {
    e.preventDefault();
    handleContentUnlock();
    handleLockerManager(false);
    resetTimer();
  }

  function resetTimer() {
    if (releaseInterval) {
      clearInterval(releaseInterval);
      releaseInterval = undefined;
    }
    setUnlockRemaining(LOCKER_TIME);
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(LockerNotice);
