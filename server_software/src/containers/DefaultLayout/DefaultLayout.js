import React, {Component, Suspense} from 'react';
import * as router from 'react-router-dom';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Container} from 'reactstrap';
import loading from '../../utils/LoadingAnimation';
import {
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

//default layout by coreui. Assembles all the default stuff together.
const DefaultFooter = React.lazy(() => import('./DefaultFooter'));
const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

class DefaultLayout extends Component {


  signOut(e) {//signs out the user
    e.preventDefault();
    this.props.logoutUser();
    this.props.history.push('/login')//redirect to login screen after logout
  }

  render() {
    //here, we remove navigation items if the user doesn't have perms to access them
    let navItems = navigation.items;
    //remove items based on permissions
    navItems = navItems.filter(el => {
      if (!el.name)
        return true;
      let name = el.name;
      let perms = this.props.auth.user.permissions;

      if (!perms.editMonitors && name === 'Monitor Groups')
        return false;
      if (!perms.editUsers && name === 'Users')
        return false;
      if (!perms.editSettings && name === 'Employee Teams')
        return false;
      if (!perms.editSettings && !perms.editMonitors && !perms.editUsers && name === 'Manage')
        return false;
      return true;
    });
    //render html to user
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
              <AppSidebarNav navConfig={{items: navItems}} {...this.props} router={router}/>
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
                    ) : null;
                  })}
                  <Redirect from="/" to="/dashboard" />
                </Switch>
              </Suspense>
            </Container>
          </main>
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
