import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { CalendarOutlined, CodeOutlined, TagOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar as AntdAvatar, Skeleton, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/store/actions/group/application/packages/detail';
import periodFormat from '@/utils/period-format';

const Avatar = styled(AntdAvatar)`
  background: rgb(253, 227, 207) !important;
  width: 64px !important;
  height: 64px !important;
  font-size: 24px !important;
  display: inline-flex !important;
  justify-content: center !important;
  align-items: center;
  color: rgb(245, 106, 0) !important;
`;

const Content = styled.div`
  display: inline-flex;
  flex-direction: column;
  margin-left: 12px;
  > h1 {
    font-size: 24px;
  }
  > div {
    color: rgb(112, 112, 112);
    > span {
      margin-right: 24px;
    }
  }
`;

const mapStateToProps = (store: RootState) => ({
  compInfoLoading: store.group.application.packages.detail.compInfoLoading,
  componentInfo: store.group.application.packages.detail.componentInfo,
});

const mapDispatchToProps = {
  fetchComponentInfo: ACTIONS.fetchComponentInfoAction,
};

type HeaderProp = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Header: React.FC<HeaderProp> = props => {
  const { compInfoLoading, componentInfo, fetchComponentInfo } = props;
  const {
    title = '',
    type = '',
    fileId = '',
    creator = {
      account: '',
    },
    liveVersion = '',
    createTime = '',
  } = componentInfo || {};
  const { applicationId, fileId: id } = useParams<{ fileId: string; applicationId: string }>();

  useEffect(() => {
    fetchComponentInfo({
      applicationId,
      id,
    });
  }, []);

  return (
    <Skeleton
      loading={compInfoLoading}
      avatar={{
        shape: 'circle',
        size: 64,
      }}
      active
      round
      paragraph={{
        rows: 1,
      }}
      title={{
        width: 200,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <Avatar size="large">{type.substring(0, 1)?.toUpperCase() || ''}</Avatar>
        <Content>
          <h1 style={{ lineHeight: '24px', fontWeight: 'bold' }}>{title}</h1>
          <div>
            <Tooltip title="File Id">
              <CodeOutlined style={{ marginRight: 6 }} />
              <span>{fileId}</span>
            </Tooltip>
            <Tooltip title="Creator">
              <UserOutlined style={{ marginRight: 6 }} />
              <span>{creator?.account || '--'}</span>
            </Tooltip>
            <Tooltip title="Live Version">
              <TagOutlined style={{ marginRight: 6 }} />
              <span>{liveVersion || '--'}</span>
            </Tooltip>
            <Tooltip title="Create Time">
              <CalendarOutlined style={{ marginRight: 6 }} />
              <span>{periodFormat(createTime, 'unknown')}</span>
            </Tooltip>
          </div>
        </Content>
      </div>
    </Skeleton>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
