import React, { useContext, useMemo } from 'react';
import { connect } from 'react-redux';

import {
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  LoadingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { Button, Modal, Steps, Typography } from 'antd';
import styled from 'styled-components';
import { RootState } from 'typesafe-actions';

import { PublishIcon } from '@/components/index';
import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { GlobalContext } from '@/pages/system';
import { resetPublishStatus, updateShowPublishModal } from '@/store/actions/builder/main';
import { PublishStatus, PublishSteps } from '@/types/index';

const { Paragraph, Text } = Typography;

const { Step } = Steps;

const mapStateToProps = (store: RootState) => ({
  blocked: store.builder.main.lockerState.blocked,
  publishStep: store.builder.main.publishStep,
  publishLoading: store.builder.main.publishLoading,
  publishStatus: store.builder.main.publishStatus,
  publishErrors: store.builder.main.publishErrors,
  showPublishModal: store.builder.main.showPublishModal,
});

const mapDispatchToProps = {
  resetPublishStatus,
  updateShowPublishModal,
};

const ErrorCon = styled.div`
  max-height: 300px;
  overflow: auto;
  margin-top: 20px;
  background-color: #fafafa;
  border: 1px solid #e9e9e9;
  border-radius: 2px;
  padding: 20px;
`;

const StepsBox = styled.div`
  padding: 24px 0 12px;
  background-color: #fbfbfb;
  border-radius: 4px;
  .ant-steps-item-wait .ant-steps-item-icon {
    border-color: #262626;
  }
  .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title::after {
    background-color: #262626;
  }
  .ant-steps-item-wait > .ant-steps-item-container > .ant-steps-item-content > .ant-steps-item-title,
  .ant-steps-item-wait .ant-steps-item-icon > .ant-steps-icon {
    color: #262626;
  }
`;

type Type = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    loading: boolean;
    onPublish: () => void;
  };

const Main: React.FC<Type> = (props) => {
  const {
    blocked,
    loading,
    onPublish,
    publishStep,
    resetPublishStatus,
    updateShowPublishModal,
    publishStatus,
    publishErrors,
    showPublishModal,
    publishLoading,
  } = props;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { version, builder, global } = locale.business;

  const showErrors = useMemo(() => {
    if (!publishErrors) return [];
    try {
      const errors = [] as Array<[string, string]>;
      const { structure = [], relation, ...rest } = publishErrors;
      const ErrorMsg = {
        '3': builder.invalidName,
        '4': builder.conditionBindFail,
        '5': builder.deletedComponents,
        '6': builder.deprecatedComponents
      };
      structure.forEach((item) => {
        (item.data || []).forEach((el) => {
          const msg = (el?.label || el?.name || '') + ' ' + ErrorMsg[item.status];
          errors.push([el.id, msg]);
        });
      });
      Object.keys(rest || {}).forEach((key) => rest[key] && errors.push([key, rest[key]]));
      Object.keys(relation || {}).forEach(
        (key) => relation[key] && errors.push([relation[key], key + ' ' + builder.invalidField]),
      );
      return errors;
    } catch (e) {
      const error = e as Error;
      return ['parse error', error.stack + error.message];
    }
  }, [publishErrors]);

  const handlePublish = () => {
    if (blocked) {
      return;
    }
    resetPublishStatus();
    updateShowPublishModal(true);
  };

  const closeModal = () => updateShowPublishModal(false);
  const steps = [
    { title: builder.confirmStep },
    { title: builder.saveStep },
    { title: builder.checkStep },
    { title: builder.finishStep },
  ];

  return (
    <>
      <StyledIcon className={blocked ? 'disabled' : ''} onClick={handlePublish}>
        {loading ? <SyncOutlined spin={true} style={{ color: '#1890ff' }} /> : <PublishIcon />}
        <IconMsg>{version.publish}</IconMsg>
      </StyledIcon>
      <Modal
        width={600}
        title={builder.publishProgressTitle}
        open={showPublishModal}
        maskClosable={false}
        destroyOnClose={true}
        onCancel={closeModal}
        footer={
          publishStep === PublishSteps.PUBLISHED && publishStatus === PublishStatus.FINISH
            ? [
                <Button type="primary" onClick={closeModal}>
                  {builder.publishSucceedTitle}
                </Button>,
              ]
            : [
                <Button onClick={closeModal}>{global.cancel}</Button>,
                <Button
                  onClick={onPublish}
                  type="primary"
                  disabled={
                    blocked ||
                    ((publishLoading || publishStep === PublishSteps.PUBLISHED) &&
                      publishStatus !== PublishStatus.ERROR)
                  }>
                  {publishStatus === PublishStatus.ERROR ? builder.rePublish : builder.startPublish}
                </Button>,
              ]
        }>
        <p style={{ fontSize: '12px', color: '#f90' }}>
          <ExclamationCircleOutlined style={{ marginRight: '4px' }} />
          {builder.publishTips}
        </p>
        <StepsBox>
          <Steps
            size="small"
            progressDot={true}
            current={publishStep}
            status={publishStatus}
            style={{ paddingBottom: '10px' }}>
            {steps.map(({ title }, idx) => {
              let icon: React.ReactElement | null = null;
              if (publishStep === idx && publishStep !== PublishSteps.PUBLISHED) {
                icon = publishStatus === PublishStatus.ERROR ? <CloseCircleOutlined /> : <LoadingOutlined />;
              }
              return <Step key={idx} title={title} icon={icon} />;
            })}
          </Steps>
        </StepsBox>
        {publishStatus === PublishStatus.ERROR && showErrors.length > 0 && (
          <ErrorCon>
            <Paragraph>
              <Text strong>{builder.publishErrorTip}</Text>
            </Paragraph>
            {showErrors.map((item, index) => {
              const [label, msg] = item as [string, string];
              return (
                <Paragraph style={{ color: 'red' }} key={index}>
                  <CloseCircleOutlined style={{ color: 'red', marginRight: 8 }} />
                  {label}: {msg}
                </Paragraph>
              );
            })}
          </ErrorCon>
        )}
      </Modal>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
