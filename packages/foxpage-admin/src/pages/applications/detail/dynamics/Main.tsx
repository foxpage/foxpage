import React from 'react';
import { useParams } from 'react-router-dom';

import { Dynamics as DynamicsComponent } from '@/components/index';

const Dynamics = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  return applicationId ? <DynamicsComponent applicationId={applicationId} /> : null;
};

export default Dynamics;
