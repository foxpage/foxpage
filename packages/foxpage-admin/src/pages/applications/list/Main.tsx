import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { Card as AntCard, Col, Empty, Pagination, Row, Spin } from 'antd';
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
  loading: state.applications.list.loading,
  pageInfo: state.applications.list.pageInfo,
  list: state.applications.list.applicationList,
  editDrawerVisible: state.applications.list.editDrawerVisible,
});

const mapDispatchToProps = {
  clearAll: ACTIONS.clearAll,
  fetchList: ACTIONS.fetchList,
};

type ApplicationListProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Applications = (props: ApplicationListProps) => {
  const { loading, list, pageInfo, clearAll, fetchList } = props;

  // i18n
  const { locale, organizationId } = useContext(GlobalContext);
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
    if (organizationId)
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
          <Spin spinning={loading}>
            <Row gutter={16} style={{ maxWidth: WIDTH_DEFAULT, minHeight: 24, margin: '12px auto 24px' }}>
              {list.map((application) => {
                return (
                  <Col span={6} key={application.id}>
                    <Card
                      key={application.id}
                      bordered
                      hoverable
                      title={<Title>{application.name}</Title>}
                      onClick={() => {
                        history.push(`/applications/${application.id}/`);
                      }}
                      style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 12 }}>
                        {global.idLabel}: {application.id}
                      </p>
                      <p style={{ fontSize: 12 }}>
                        {global.creator}: {application?.creator?.email || ''}
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
