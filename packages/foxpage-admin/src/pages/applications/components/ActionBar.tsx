import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import styled from 'styled-components';

import * as ACTIONS from '@/actions/applications/list';
import GlobalContext from '@/pages/GlobalContext';

const Root = styled.div`
  width: 100%;
  margin-bottom: 12px;
  box-sizing: border-box;
  display: flex;
`;

const Actions = styled.div`
  flex-grow: 1;
  text-align: right;
`;

const mapDispatchToProps = {
  updateDrawerVisible: ACTIONS.updateDrawerVisible,
};

type IProps = typeof mapDispatchToProps;

function ActionBar(props: IProps) {
  const { updateDrawerVisible } = props;
  const { locale } = useContext(GlobalContext);
  const { application } = locale.business;

  return (
    <Root>
      <Actions>
        <Button type="primary" onClick={() => updateDrawerVisible(true)}>
          <PlusOutlined />
          {application.add}
        </Button>
      </Actions>
    </Root>
  );
}

export default connect(null, mapDispatchToProps)(ActionBar);
