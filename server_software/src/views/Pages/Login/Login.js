import React, { Component } from 'react';
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
  InputGroupText, Popover, PopoverBody,
  PopoverHeader,
  Row
} from 'reactstrap';
import {getStyle} from '@coreui/coreui/dist/js/coreui-utilities'
class Login extends Component {
  constructor(props){
    super(props);
    this.state={
      popoverOpen: false,
      errors: {email: 'No'},
      email: '',
      password: ''
    };
  }
  onChange=e=>{
    this.setState({[e.target.id]: e.target.value});
  };
  onSubmit=e=>{
    e.preventDefault();
    const userData = {
      email: this.state.email,
      password: this.state.password
    };
    console.log(userData);
  };

  toggle=()=>{
    this.setState({popoverOpen: !this.state.popoverOpen});
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
                    <Form noValidate onSubmit={this.onSubmit}>
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
                               error={this.state.errors.email} id="email" type="text" placeholder="Email" autoComplete="email" />
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"/>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input onChange={this.onChange}
                               value={this.state.password}
                               error={this.state.errors.password} id="password" type="password" placeholder="Password" autoComplete="current-password" />
                      </InputGroup>
                      <Row>
                        <Col xs="6">
                          <Button className="px-4" style={buttonStyle}>Login</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Button color="link" className="px-0" id="forgotPassword">Forgot password?</Button>
                          <Popover placement="right" isOpen={this.state.popoverOpen} target="forgotPassword" toggle={this.toggle}>
                            <PopoverHeader>Forgot your Password?</PopoverHeader>
                            <PopoverBody>Make sure to contact an admin in order to reset your password</PopoverBody>
                          </Popover>
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

export default Login;
