//https://blog.bitsrc.io/build-a-login-auth-app-with-the-mern-stack-part-3-react-components-88190f8db718
//link above assisted in the construction of this component
import React from 'react';
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {loginUser} from "../../../redux/actions/authActions";
import wuatLogo from '../../../assets/img/brand/wuat/WUAT Logo.svg';
import {Button, Card, CardBody, Col, Container, Form, Popover, PopoverBody, PopoverHeader, Row} from 'reactstrap';
import {getStyle} from '@coreui/coreui/dist/js/coreui-utilities'
import {FormFieldWithError as FormField} from "../../../utils/FormField";


function Login(props) {
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');


  React.useEffect(() => {
    if (props.auth.isAuthenticated) {
      props.history.push("/dashboard"); // push user to dashboard when they login
    }
    if (props.errors) {
      setErrors(props.errors);
      setLoading(false);
    } else setLoading(false);//likely won't happen since if there are no errors, they should be in the dashboard by now.

  }, [props.auth, props.errors]);
  const onSubmit = e => {//when login button pressed
    e.preventDefault();
    //we start the loading animation
    setLoading(true);
    setErrors({});

    const userLogin = {email, password};
    props.loginUser(userLogin);//we try login
  };

  const toggle = () => {//show popup for password forget
    setPopoverOpen(!popoverOpen)
  };


  //custom button style
  const buttonStyle = {
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
                <Form noValidate onSubmit={onSubmit}>
                  <img src={wuatLogo} alt="Logo" className="center-art animated fadeIn" style={{width: '8em'}}/>
                  <div className="p-4">
                    <h1>Login</h1>
                    <p className="text-muted">Sign into your account</p>
                    <FormField onChange={setEmail} name='Email' value={email} errors={errors} setErrors={setErrors}
                               field='email'>
                      <i className="icon-user"/>
                    </FormField>

                    <FormField type='password' onChange={setPassword} value={password} name='Password' errors={errors}
                               setErrors={setErrors} field='password'>
                      <i className="icon-lock"/>
                    </FormField>

                    <Row>
                      <Col xs="6">
                        <Button className="px-4" style={buttonStyle} type='submit'
                                disabled={loading}>{loading ?
                          <span className="lds-tiny-dual-ring"/> : "Login"}</Button>
                      </Col>
                      <Col xs="6" className="text-right">
                        <Button color="link" className="px-0" id="forgotPassword" onClick={toggle}>Forgot
                          password?</Button>
                        <div className="fadeIn">
                          <Popover placement="right" isOpen={popoverOpen} target="forgotPassword"
                                   className="animated fadeIn">
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
