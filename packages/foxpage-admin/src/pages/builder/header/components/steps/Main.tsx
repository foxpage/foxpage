import React, { useContext, useEffect } from 'react';
import { connect } from 'react-redux';

import { RootState } from 'typesafe-actions';

import { IconMsg, StyledIcon } from '@/pages/builder/header/Main';
import { BackIcon, NextIcon } from '@/pages/components';
import { GlobalContext } from '@/pages/system';
import * as PAGE_ACTIONS from '@/store/actions/builder/main';

const mapStateToProps = (store: RootState) => ({
  curStep: store.builder.main.curStep,
  stepCount: store.builder.main.stepCount,
  content: store.builder.main.content,
});

const mapDispatchToProps = {
  getSteps: PAGE_ACTIONS.getSteps,
  goLastStep: PAGE_ACTIONS.preStep,
  goNextStep: PAGE_ACTIONS.nextStep,
};

type StepsType = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps;

const Steps: React.FC<StepsType> = (props) => {
  const { curStep, stepCount = 0, content, getSteps, goLastStep, goNextStep } = props;
  const preStepStatus = curStep > 0;
  const nextStepStatus = curStep < stepCount - 1;

  // i18n
  const { locale } = useContext(GlobalContext);
  const { builder } = locale.business;

  useEffect(() => {
    if (content.id) {
      getSteps();
    }
  }, [content.id]);

  const handleGoLastStep = () => {
    if (preStepStatus) {
      goLastStep();
    }
  };

  const handleGoNextStep = () => {
    if (nextStepStatus) {
      goNextStep();
    }
  };

  return (
    <>
      <StyledIcon className={preStepStatus ? '' : 'disabled'} onClick={handleGoLastStep}>
        <BackIcon color={preStepStatus ? '' : 'rgb(195, 193, 193)'} />
        <IconMsg>{builder.lastStep}</IconMsg>
      </StyledIcon>
      <StyledIcon className={nextStepStatus ? '' : 'disabled'} onClick={handleGoNextStep}>
        <NextIcon color={nextStepStatus ? '' : 'rgb(195, 193, 193)'} />
        <IconMsg>{builder.nextStep}</IconMsg>
      </StyledIcon>
    </>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Steps);
