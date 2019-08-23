//a special container which requires permission to access a feature. Even if this can be easily bypassed, the backend is still secure.
import React from "react";
import {Redirect, Route} from "react-router-dom";
import {connect} from "react-redux";
import PropTypes from "prop-types";

const PrivateRoute = ({component: Component, auth, ...rest}) => (
  <Route
    {...rest}
    render={props =>
      auth.isAuthenticated === true ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login"/>
      )
    }
  />
);
PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(mapStateToProps)(PrivateRoute);
