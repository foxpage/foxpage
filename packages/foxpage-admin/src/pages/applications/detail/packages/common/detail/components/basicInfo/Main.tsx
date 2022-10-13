import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { CalendarOutlined, CodeOutlined, TagOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar as AntdAvatar, Skeleton, Tag, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/detail';
import { StoreGoodsPurchaseType, suffixTagColor } from '@/constants/index';
import { getLocationIfo, periodFormat } from '@/utils/index';

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

const Name = styled.span`
  display: inline-block;
  margin-right: 12px;
  vertical-align: bottom;
`;

const mapStateToProps = (store: RootState) => ({
  applicationId: store.applications.detail.settings.app.applicationId,
  compInfoLoading: store.applications.detail.packages.detail.compInfoLoading,
  componentInfo: store.applications.detail.packages.detail.componentInfo,
  fileDetail: store.applications.detail.packages.detail.fileDetail,
});

const mapDispatchToProps = {
  fetchComponentInfo: ACTIONS.fetchComponentInfoAction,
};

type ComponentDetailHeaderType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<ComponentDetailHeaderType> = (props) => {
  const { applicationId, compInfoLoading, componentInfo, fileDetail, fetchComponentInfo } = props;
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
  const { tags } = fileDetail || {};
  const isReference = tags && tags.find((tag) => tag.type === StoreGoodsPurchaseType.reference);

  // url params
  const { fileId: id } = getLocationIfo(useLocation());

  useEffect(() => {
    if (applicationId && id)
      fetchComponentInfo({
        applicationId,
        id,
      });
  }, [applicationId]);

  return (
    <Skeleton
      active
      round
      avatar={{
        shape: 'circle',
        size: 64,
      }}
      paragraph={{
        rows: 1,
      }}
      title={{
        width: 200,
      }}
      loading={compInfoLoading}>
      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
        <Avatar size="large">{type.substring(0, 1)?.toUpperCase() || ''}</Avatar>
        <Content>
          <h1 style={{ lineHeight: '24px', fontWeight: 'bold' }}>
            <Name>{title}</Name>
            {isReference && (
              <Tag color={suffixTagColor.refer} style={{ zoom: 0.9 }}>
                refer
              </Tag>
            )}
          </h1>
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

export default connect(mapStateToProps, mapDispatchToProps)(Main);
