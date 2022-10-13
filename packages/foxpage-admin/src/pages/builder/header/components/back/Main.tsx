import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { LeftOutlined } from '@ant-design/icons';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { StyledIcon } from '@/pages/builder/header/Main';
import { getBuilderHistory, setBuilderHistory } from '@/utils/builder-history';

const mapStateToProps = (store: RootState) => ({
  backState: store.builder.header.backState,
});

const mapDispatchToProps = {
  updateBackState: ACTIONS.updateBackState,
};

type GoBackType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const GoBack: React.FC<GoBackType> = (props) => {
  const { updateBackState } = props;
  const [backState, setBackState] = useState(props.backState);

  const history = useHistory();
  const { state } = useLocation<any>();
  const historyCache = getBuilderHistory();

  useEffect(() => {
    if (state) setBuilderHistory(state);

    setBackState(state || historyCache);

    updateBackState(state || historyCache);

    return () => {
      updateBackState();
    };
  }, []);

  const handleBack = () => {
    let pathname: string;
    let search = '';

    if (backState?.backPathname) {
      pathname = backState.backPathname;
      search = backState?.backSearch || '';
    } else {
      pathname = '/workspace/projects/list';
    }

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
