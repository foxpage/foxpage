import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { Pagination, Spin, Steps, Tag } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/workspace/dynamics';
import { dynamicType } from '@/constants/workspace';
import { suffixTagColor } from '@/pages/common/constant/FileType';
import { Dynamic } from '@/types/workspace';
import periodFormat from '@/utils/period-format';

const { Step: AntdStep } = Steps;

const Container = styled.div`
  position: relative;
  max-width: 800px;
  margin: 44px auto 0;
`;

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
  loading: store.workspace.dynamics.loading,
  pageInfo: store.workspace.dynamics.pageInfo,
  dynamics: store.workspace.dynamics.dynamics,
});

const mapDispatchToProps = {
  searchDynamics: ACTIONS.searchDynamics,
  clearAll: ACTIONS.clearAll,
};

type DynamicProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Dynamics: React.FC<DynamicProps> = props => {
  const { loading, pageInfo, dynamics, searchDynamics, clearAll } = props;

  useEffect(() => {
    searchDynamics({ page: pageInfo.page, size: pageInfo.size, search: '' });
    return () => {
      clearAll();
    };
  }, []);

  return (
    <Container>
      <Steps progressDot current={dynamics.length} direction="vertical">
        {dynamics.map((dynamic: Dynamic) => {
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
                      <div>User：{user}</div>
                    </>
                  )}
                </>
              }
              description={
                <>
                  {applicationName && <div>Application：{applicationName}</div>}

                  <div>
                    Type：
                    <Tag color={suffixTagColor[realMethod]}>{dynamicType[realMethod]}</Tag>
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
          searchDynamics({ page, size: pageSize, search: '' });
        }}
      />
      {loading && (
        <Spin
          style={{
            padding: 48,
            position: 'absolute',
            left: '50%',
            top: 0,
          }}
          spinning={true}
        />
      )}
    </Container>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Dynamics);
