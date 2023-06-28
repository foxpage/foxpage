import React, { useContext, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

import {
  CalendarOutlined,
  CodeOutlined,
  StarFilled,
  StarOutlined,
  TagOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar as AntdAvatar, Button, Modal, Skeleton, Tag, Tooltip } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import * as ACTIONS from '@/actions/applications/detail/packages/detail';
import { setComponentAction } from '@/actions/applications/detail/packages/list';
import { ComponentTagType, StoreGoodsPurchaseType, suffixTagColor } from '@/constants/index';
import { GlobalContext } from '@/pages/system';
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
  height: 64px;
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
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
  margin-right: 8px;
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
  fetchFileDetail: ACTIONS.fetchFileDetail,
  setComponent: setComponentAction,
};

type ComponentDetailHeaderType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Main: React.FC<ComponentDetailHeaderType> = (props) => {
  const {
    applicationId,
    compInfoLoading,
    componentInfo,
    fileDetail,
    fetchComponentInfo,
    fetchFileDetail,
    setComponent,
  } = props;
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
  const isComponent = componentInfo?.type === 'component';
  const isReference = tags && tags.find((tag) => tag.type === StoreGoodsPurchaseType.reference);
  const isLoadOnIgnite = tags && tags.find((tag) => tag.type === ComponentTagType.loadOnIgnite && tag.status);
  const isOnline = componentInfo?.online;
  const hasLiveVersion = !!componentInfo?.liveVersion;

  // url params
  const { fileId: id } = getLocationIfo(useLocation());

  // i18n
  const { locale } = useContext(GlobalContext);
  const { file: fileI18n, global, package: packageI18n, store: storeI18n } = locale.business;

  useEffect(() => {
    if (applicationId && id)
      fetchComponentInfo({
        applicationId,
        id,
      });
  }, [applicationId]);

  const disabled = useMemo(() => {
    let disabled = false;

    if (fileDetail.deprecated) disabled = true;

    return disabled;
  }, [fileDetail.deprecated]);

  const handleSetImportant = () => {
    Modal.confirm({
      title: packageI18n.loadOnIgniteTitle,
      content: packageI18n.loadOnIgniteMsg,
      okText: global.yes,
      okType: 'primary',
      cancelText: global.no,
      onOk() {
        setComponent(
          {
            applicationId,
            id: id,
            intro: '',
            loadOnIgnite: !isLoadOnIgnite,
          },
          () => {
            fetchFileDetail({ applicationId, ids: [id] });
          },
        );
      },
    });
  };

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
          <h1 style={{ lineHeight: '30px', fontWeight: 'bold' }}>
            <Name>{title}</Name>
            {isComponent && (
              <Tooltip title={disabled ? '' : hasLiveVersion ? '' : packageI18n.liveVersionTips}>
                <Button
                  size="small"
                  shape="circle"
                  disabled={!hasLiveVersion || disabled}
                  onClick={handleSetImportant}
                  style={{ marginRight: 12 }}>
                  {isLoadOnIgnite ? <StarFilled style={{ color: '#287dfa' }} /> : <StarOutlined />}
                </Button>
              </Tooltip>
            )}
            {isOnline && (
              <Tag color="cyan" style={{ zoom: 0.9 }}>
                {fileI18n.inStore}
              </Tag>
            )}
            {isReference && (
              <Tag color={suffixTagColor.refer} style={{ zoom: 0.9 }}>
                {storeI18n.refer}
              </Tag>
            )}
            {disabled && (
              <Tag color="error" style={{ zoom: 0.9 }}>
                {packageI18n.disabled}
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
