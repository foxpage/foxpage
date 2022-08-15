import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { LeftOutlined } from '@ant-design/icons';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/builder/header';
import { StyledIcon } from '@/pages/builder/header/Main';

const mapStateToProps = (store: RootState) => ({
  backState: store.builder.header.backState,
});

const mapDispatchToProps = {
  updateBackState: ACTIONS.updateBackState,
};

type GoBackType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const GoBack: React.FC<GoBackType> = (props) => {
  const { backState, updateBackState } = props;

  const history = useHistory();
  const { state } = useLocation<any>();

  useEffect(() => {
    updateBackState(state);

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
