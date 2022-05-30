import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Button, Card, Col, Empty, Pagination, Row, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/list';
import { Content, StyledLayout } from '@/pages/components';
import OperationDrawer from '@/pages/components/business/OperationDrawer';

import GlobalContext from '../GlobalContext';

import ActionBar from './components/ActionBar';
import EditPanel from './components/EditPanel';

const Title = styled.span`
  width: 100%;
  display: inline-block;
  padding: 16px 0;
  font-size: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const mapStateToProps = (state: RootState) => ({
  organizationId: state.system.organizationId,
  fetching: state.applications.list.fetching,
  list: state.applications.list.list,
  pageInfo: state.applications.list.pageInfo,
  editDrawerVisible: state.applications.list.editDrawerVisible,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchList,
  saveApp: ACTIONS.saveApp,
  updateDrawerVisible: ACTIONS.updateDrawerVisible,
};

type ApplicationListProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const ListView = (props: ApplicationListProps) => {
  const {
    organizationId,
    fetching,
    list,
    pageInfo,
    editDrawerVisible,
    clearAll,
    fetchList,
    saveApp,
    updateDrawerVisible,
  } = props;

  // get multi-language
  const { locale } = useContext(GlobalContext);
  const { global, application } = locale.business;

  const history = useHistory();

  if (!organizationId) {
    history.push({
      pathname: '/login',
    });
    return null;
  }

  useEffect(() => {
    fetchList({
      organizationId,
      page: pageInfo.page,
      size: pageInfo.size,
    });

    return () => {
      clearAll();
    };
  }, [fetchList, organizationId, clearAll]);

  return (
    <Spin spinning={fetching}>
      <StyledLayout>
        <Content>
          <ActionBar />
          <Row gutter={16} style={{ minHeight: 24, paddingBottom: 24, maxWidth: 1136, margin: '0 auto' }}>
            {list.map((application) => {
              return (
                <Col span={6} key={application.id}>
                  <Card
                    key={application.id}
                    title={<Title>{application.name}</Title>}
                    onClick={() => {
                      history.push(
                        `/organization/${organizationId}/application/${application.id}/detail/page`,
                      );
                    }}
                    style={{ marginBottom: 12 }}
                    hoverable
                    bordered>
                    <p>
                      {global.idLabel}: {application.id}
                    </p>
                  </Card>
                </Col>
              );
            })}
            {!fetching && list?.length === 0 && (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ margin: '48px auto' }} />
            )}
          </Row>
          <Pagination
            style={{ textAlign: 'center' }}
            current={pageInfo.page}
            total={pageInfo.total}
            pageSize={pageInfo.size}
            hideOnSinglePage
            onChange={(page, pageSize) => fetchList({ organizationId, page, size: pageSize })}
          />
          <OperationDrawer
            open={editDrawerVisible}
            width={480}
            title={application.add}
            onClose={() => updateDrawerVisible(false)}
            actions={
              <Button type="primary" onClick={() => saveApp()}>
                {global.apply}
              </Button>
            }>
            <EditPanel />
          </OperationDrawer>
        </Content>
      </StyledLayout>
    </Spin>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(ListView);
