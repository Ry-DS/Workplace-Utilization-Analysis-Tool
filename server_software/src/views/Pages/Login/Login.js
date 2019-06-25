//https://blog.bitsrc.io/build-a-login-auth-app-with-the-mern-stack-part-3-react-components-88190f8db718
import React, {Component} from 'react';
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {loginUser} from "../../../redux/actions/authActions";
import wuatLogo from '../../../assets/img/brand/wuat/WUAT Logo.svg';
import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Popover,
  PopoverBody,
  PopoverHeader,
  Row,
  Tooltip
} from 'reactstrap';
import {getStyle} from '@coreui/coreui/dist/js/coreui-utilities'

class Login extends Component {
  constructor(props){
    super(props);

    this.state={
      popoverOpen: false,
      loading: false,
      errors: {},
      tooltipOpen: [false, false],
      email: '',
      password: ''
    };

  }

  componentDidMount() {
    // If logged in and user navigates here, take them to the dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }
  componentWillReceiveProps(nextProps) {

    if (nextProps.auth.isAuthenticated) {
      this.props.history.push("/dashboard"); // push user to dashboard when they login
    }
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors, loading: false//when we receive an error, stop the loading animation
      });
    } else this.setState({loading: false});
  }
  onChange=e=>{
    this.setState({[e.target.id]: e.target.value});//edit email and password fields while also storing it in state

  };
  onSubmit = e => {//when login button pressed
    e.preventDefault();
    this.setState({loading: true});//we start the loading animation
    const userData = {
      email: this.state.email,
      password: this.state.password
    };
    this.props.loginUser(userData);//we try login
  };

  toggle = () => {//show popup for password forget
    this.setState({popoverOpen: !this.state.popoverOpen});
  };
  tooltipToggle = (index) => {
    let tooltipOpen = this.state.tooltipOpen.slice(0);
    tooltipOpen[index] = !tooltipOpen[index];
    this.setState({tooltipOpen})
  };

  render() {
    const logoStyle={
      width: '8em'
    };
    const buttonStyle={
      backgroundColor: getStyle('--theme-light'),
      borderColor: getStyle('--theme-bland'),
      color: '#fff'
    };
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
                <Card>
                  <CardBody>
                    <Form noValidate>
                      <img src={wuatLogo} alt="Logo" className="center-art" style={logoStyle}/>
                      <div className="p-4">
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"/>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input onChange={this.onChange}
                               value={this.state.email}
                               id="email" type="text" className={this.state.errors.email ? 'is-invalid' : ''}
                               placeholder="Email" autoComplete="email"/>
                        {/*We are able to add an error tooltip if an error is given from the backend*/}
                        {this.state.errors.email ?
                          <Tooltip placement="right" isOpen={this.state.tooltipOpen[0]} target="email" toggle={() => {
                            this.tooltipToggle(0)
                          }}>

                            {this.state.errors.email}
                          </Tooltip> : null}

                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"/>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input onChange={this.onChange}
                               value={this.state.password}
                               id="password" type="password" className={this.state.errors.password ? 'is-invalid' : ''}
                               placeholder="Password" autoComplete="current-password"/>
                        {this.state.errors.password ?
                          <Tooltip placement="right" isOpen={this.state.tooltipOpen[1]} target="password"
                                   toggle={() => {
                                     this.tooltipToggle(1)
                                   }}>

                            {this.state.errors.password}
                          </Tooltip> : null}
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <Button className="px-4" style={buttonStyle} onClick={this.onSubmit}>{this.state.loading ?
                            <span className="lds-tiny-dual-ring"/> : "Login"}</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button color="link" className="px-0" id="forgotPassword" onClick={this.toggle}>Forgot
                            password?</Button>
                          <div className="fadeIn">
                            <Popover placement="right" isOpen={this.state.popoverOpen} target="forgotPassword">
                            <PopoverHeader>Forgot your Password?</PopoverHeader>
                            <PopoverBody>Make sure to contact an admin in order to reset your password</PopoverBody>
                            </Popover></div>
                        </Col>
                      </Row>
                        </div>
                    </Form>
                  </CardBody>
                </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

Login.propTypes = {//setup props that are needed and what they should be.
  loginUser: PropTypes.func.isRequired,//saying a function is needed for loginUser
  auth: PropTypes.object.isRequired,//saying an object is needed
  errors: PropTypes.object.isRequired//saying an object is needed
};
const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});
export default connect(
  mapStateToProps,
  {loginUser}
)(Login);//don't need to wrap with withRouter() since we direct to dashboard ourselves instead of doing it in the action.
