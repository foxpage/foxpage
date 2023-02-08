import React, { useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { LeftOutlined } from '@ant-design/icons';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import * as MAIN_ACTIONS from '@/actions/builder/main';
import { StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';
import { getBuilderHistory, getLocationIfo, setBuilderHistory } from '@/utils/index';

const mapStateToProps = (store: RootState) => ({
  backState: store.builder.header.backState,
  editStatus: store.builder.main.editStatus && !!store.record.main.localRecords.length,
});

const mapDispatchToProps = {
  updateBackState: ACTIONS.updateBackState,
  unlockContent: MAIN_ACTIONS.unlockContent,
};

type GoBackType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const GoBack: React.FC<GoBackType> = (props) => {
  const { editStatus, updateBackState, unlockContent } = props;
  const [backState, setBackState] = useState(props.backState);

  // i18n
  const { locale: i18n } = useContext(GlobalContext);

  const history = useHistory();
  const { state } = useLocation<any>();
  const { applicationId, fileId } = getLocationIfo(useLocation());
  const historyCache = getBuilderHistory();

  useEffect(() => {
    if (state) setBuilderHistory(state);

    setBackState(state || historyCache);

    updateBackState(state || historyCache);

    return () => {
      updateBackState();
    };
  }, []);

  const handleBack = (e: React.MouseEvent) => {
    if (editStatus) {
      const leave = confirm(i18n.business.builder.leaveWithoutSave);
      if (!leave) {
        e.preventDefault();
        e.stopPropagation();

        return;
      }
    }

    let pathname: string;
    let search = '';

    if (backState?.backPathname) {
      pathname = backState.backPathname;
      search = backState?.backSearch || '';
    } else {
      pathname = '/projects/content';
      search = `?applicationId=${applicationId}&fileId=${fileId}`;
    }

    unlockContent();

    history.push({ pathname, search });
  };

  return (
    <>
      <StyledIcon onClick={handleBack}>
        <LeftOutlined />
      </StyledIcon>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(GoBack);
