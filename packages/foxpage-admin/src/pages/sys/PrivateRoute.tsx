import React from 'react';
import { Route } from 'react-router-dom';

import PropTypes from 'prop-types';

const PrivateRoute: React.FC<any> = ({ component: Component, ...rest }) => (
  <Route {...rest} render={props => <Component {...props} />} />
);

PrivateRoute.propTypes = {
  component: PropTypes.func.isRequired,
};

export default PrivateRoute;
