import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Pagination, Spin, Steps, Tag } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/dynamics/index';
import { Content, FoxPageBreadcrumb, FoxPageContent } from '@/components/index';
import { dynamicType, suffixTagColor, WIDTH_DEFAULT } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
import { DynamicEntity } from '@/types/index';
import { periodFormat } from '@/utils/index';

const { Step: AntdStep } = Steps;

const Step = styled(AntdStep)`
  .ant-steps-item-content {
    .ant-steps-item-title {
      width: 100%;
    }
    .ant-steps-item-subtitle {
      margin-left: 0;
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
`;

const mapStateToProps = (store: RootState) => ({
  organizationId: store.system.user.organizationId,
  loading: store.workspace.dynamics.loading,
  pageInfo: store.workspace.dynamics.pageInfo,
  dynamics: store.workspace.dynamics.dynamics,
});

const mapDispatchToProps = {
  searchDynamics: ACTIONS.fetchDynamics,
  clearAll: ACTIONS.clearAll,
};

type DynamicProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Dynamics: React.FC<DynamicProps> = (props) => {
  const { organizationId, loading, pageInfo, dynamics, clearAll, searchDynamics } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { global } = locale.business;

  useEffect(() => {
    searchDynamics({ organizationId, page: pageInfo.page, size: pageInfo.size, search: '' });

    return () => {
      clearAll();
    };
  }, []);

  return (
    <Content>
      <FoxPageContent
        breadcrumb={
          <FoxPageBreadcrumb
            breadCrumb={[
              {
                name: global.dynamics,
              },
            ]}
          />
        }>
        <Spin spinning={loading}>
          <Content style={{ maxWidth: WIDTH_DEFAULT }}>
            <Steps progressDot current={dynamics.length} direction="vertical">
              {dynamics.map((dynamic: DynamicEntity) => {
                const { realMethod, name, user, applicationName, originUrl } = dynamic.content;

                return (
                  <Step
                    key={dynamic.id}
                    title={periodFormat(dynamic.createTime, 'unknown')}
                    subTitle={
                      <>
                        {name && (
                          <>
                            {realMethod === dynamicType.delete || !originUrl ? (
                              <div>{name}</div>
                            ) : (
                              <Link to={originUrl.replace('/#', '')}>{name}</Link>
                            )}
                            <div>
                              {global.user}：{user}
                            </div>
                          </>
                        )}
                      </>
                    }
                    description={
                      <>
                        {applicationName && (
                          <div>
                            {global.application}：{applicationName}
                          </div>
                        )}

                        <div>
                          {global.type}：
                          <Tag color={suffixTagColor[realMethod]}>{global[dynamicType[realMethod]]}</Tag>
                        </div>
                      </>
                    }
                  />
                );
              })}
            </Steps>
            <Pagination
              style={{ textAlign: 'center' }}
              current={pageInfo.page}
              total={pageInfo.total}
              pageSize={pageInfo.size}
              hideOnSinglePage
              onChange={(page, pageSize) => {
                searchDynamics({ organizationId, page, size: pageSize, search: '' });
              }}
            />
          </Content>
        </Spin>
      </FoxPageContent>
    </Content>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Dynamics);
