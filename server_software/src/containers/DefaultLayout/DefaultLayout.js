import React, {Component, Suspense} from 'react';
import * as router from 'react-router-dom';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Container} from 'reactstrap';
import loading from '../../utils/LoadingAnimation';
import {
  AppAside,
  AppBreadcrumb2 as AppBreadcrumb,
  AppFooter,
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav2 as AppSidebarNav,
} from '@coreui/react';
//redux
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {logoutUser} from "../../redux/actions/authActions";
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
//Logo for WUAT
import wuatLogo from '../../assets/img/brand/wuat/WUAT Logo.svg';
import logoCover from '../../assets/img/brand/logo_small.png';


const DefaultAside = React.lazy(() => import('./DefaultAside'));
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

class DefaultLayout extends Component {


  signOut(e) {
    e.preventDefault();
    this.props.logoutUser();
    this.props.history.push('/login')
  }

  render() {
    const {user} = this.props.auth;
    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={loading()}>
            <DefaultHeader onLogout={e=>this.signOut(e)}/>
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader />
            <AppSidebarForm />
            <Suspense>
              {/*WUAT Logo here*/}

              <img src={wuatLogo} alt="WUAT Logo" className="center-art"/>
              {/*The sidebar object*/}
            <AppSidebarNav navConfig={navigation} {...this.props} router={router}/>
            </Suspense>
            <AppSidebarFooter />
            <AppSidebarMinimizer />
          </AppSidebar>
          <main className="main">
            <img src={logoCover} className="cover-bg" alt="BGIS Background Cover"/>

            <AppBreadcrumb appRoutes={routes} router={router}/>
            <Container fluid>
              <Suspense fallback={loading()}>
                <Switch>
                  {routes.map((route, idx) => {
                    return route.component ? (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        render={props => (
                          <route.component {...props} />
                        )} />
                    ) : (null);
                  })}
                  <Redirect from="/" to="/dashboard" />
                </Switch>
              </Suspense>
            </Container>
          </main>
          <AppAside fixed>
            <Suspense fallback={loading()}>
              <DefaultAside />
            </Suspense>
          </AppAside>
        </div>
        <AppFooter>
          <Suspense fallback={loading()}>
            <DefaultFooter />
          </Suspense>
        </AppFooter>
      </div>
    );
  }
}

DefaultLayout.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth
});
export default connect(
  mapStateToProps,
  {logoutUser}
)(DefaultLayout);
