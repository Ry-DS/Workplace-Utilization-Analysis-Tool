import React, {Component} from 'react';
import {NavLink} from 'react-router-dom';
import {DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem} from 'reactstrap';
import PropTypes from 'prop-types';

import {AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler} from '@coreui/react';
import logo from '../../assets/img/brand/bgis.png'
import miniLogo from '../../assets/img/brand/logo_small.png'
//default header provided by coreui. just shows the logo, logout and dashboard link.
const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
  render() {

    // eslint-disable-next-line
    const { children, ...attributes } = this.props;

    return (
      <React.Fragment>
        <AppSidebarToggler className="d-lg-none" display="md" mobile />
        <AppNavbarBrand
          full={{src: logo, width: 89, height: 25, alt: 'BGIS Logo'}}
          minimized={{src: miniLogo, width: 30, height: 30, alt: 'BGIS Logo'}}
        />
        <AppSidebarToggler className="d-md-down-none" display="lg" />

        <Nav className="d-md-down-none" navbar>
          <NavItem className="px-3">
            <NavLink to="/dashboard" className="nav-link" >Dashboard</NavLink>
          </NavItem>


        </Nav>
        <Nav className="ml-auto" navbar>


          <AppHeaderDropdown direction="down">
            <DropdownToggle nav>
              <i className="fa fa-2x fa-user-circle"/>
            </DropdownToggle>
            <DropdownMenu right style={{ right: 'auto' }}>
              <DropdownItem header tag="div" className="text-center"><strong>Account</strong></DropdownItem>
              <DropdownItem onClick={e => this.props.onLogout(e)}><i className="fa fa-lock"></i> Logout</DropdownItem>
            </DropdownMenu>
          </AppHeaderDropdown>
        </Nav>

      </React.Fragment>
    );
  }
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
