import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { PlusOutlined } from '@ant-design/icons';
import { Button, Card as AntCard, Col, Empty, Pagination, Row, Spin } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/list';
import { WIDTH_DEFAULT } from '@/constants/global';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/pages/components';
import { GlobalContext } from '@/pages/system';

import { EditDrawer } from './components';

const Title = styled.span`
  width: 100%;
  display: inline-block;
  padding: 16px 0;
  font-size: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Card = styled(AntCard)`
  .ant-card-head {
    .ant-card-head-title {
      span {
        padding: 24px 0;
      }
    }
  }
`;

const mapStateToProps = (state: RootState) => ({
  organizationId: state.system.user.organizationId,
  loading: state.applications.list.loading,
  pageInfo: state.applications.list.pageInfo,
  list: state.applications.list.applicationList,
  editDrawerVisible: state.applications.list.editDrawerVisible,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchList,
  saveApp: ACTIONS.saveApp,
  openDrawer: ACTIONS.openEditDrawer,
};

type ApplicationListProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Applications = (props: ApplicationListProps) => {
  const { organizationId, loading, list, pageInfo, clearAll, fetchList, openDrawer } = props;

  // get multi-language
  const { locale } = useContext(GlobalContext);
  const { application, global } = locale.business;

  const history = useHistory();

  if (!organizationId) {
    history.push({
      pathname: '/login',
    });
    return null;
  }

  useEffect(() => {
    return () => {
      clearAll();
    };
  }, []);

  useEffect(() => {
    fetchList({
      organizationId,
      page: pageInfo.page,
      size: pageInfo.size,
    });
  }, [fetchList, organizationId, clearAll]);

  return (
    <>
      <Content>
        <FoxPageContent
          breadcrumb={
            <FoxPageBreadcrumb
              breadCrumb={[
                {
                  name: application.name,
                },
              ]}
            />
          }
          style={{ maxWidth: WIDTH_DEFAULT, overflow: 'unset' }}>
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="primary" onClick={() => openDrawer(true)}>
              <PlusOutlined /> {application.add}
            </Button>
          </div>
          <Spin spinning={loading}>
            <Row
              gutter={16}
              style={{ maxWidth: WIDTH_DEFAULT, minHeight: 24, paddingBottom: 24, margin: '0 auto' }}>
              {list.map((application) => {
                return (
                  <Col span={6} key={application.id}>
                    <Card
                      key={application.id}
                      bordered
                      hoverable
                      title={<Title>{application.name}</Title>}
                      onClick={() => {
                        history.push(`/applications/${application.id}/file/pages/list`);
                      }}
                      style={{ marginBottom: 12 }}>
                      <p>
                        {global.idLabel}: {application.id}
                      </p>
                    </Card>
                  </Col>
                );
              })}
              {!loading && list?.length === 0 && (
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
          </Spin>
        </FoxPageContent>
      </Content>
      <EditDrawer />
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Applications);
