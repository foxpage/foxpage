import React, { useEffect } from 'react';
import { connect } from 'react-redux';

import { Alert } from 'antd';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/notice';

const mapStateToProps = (store: RootState) => ({
  list: store.notice.main.notices,
});

const mapDispatchToProps = {
  fetch: ACTIONS.fetchNotices,
};

type ProjectProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Notice: React.FC<ProjectProps & { top?: number }> = (props) => {
  const { list = [], top = 0, fetch } = props;
  const showList = list.filter((item) => !!item.status);

  useEffect(() => {
    fetch();
  }, []);

  if (showList.length === 0) {
    return null;
  }

  return (
    <Alert
      type={showList[0].type}
      message={
        <>
          {showList.length > 1 ? (
            <>
              {showList.map((item, idx) => (
                <span key={idx}>{`${idx + 1}. ${item.message}`}; </span>
              ))}
            </>
          ) : (
            showList[0].message
          )}
        </>
      }
      style={{ zIndex: 1000, top }}
      showIcon
      closable={!!showList[0].closable}
    />
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Notice);
