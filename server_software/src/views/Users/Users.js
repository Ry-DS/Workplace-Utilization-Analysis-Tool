import React, {Component} from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row
} from 'reactstrap';
import axios from 'axios';
import 'react-tabulator/css/tabulator_simple.min.css'
import {ReactTabulator} from 'react-tabulator';
import LoadingAnimation from "../../utils/LoadingAnimation";
import {connect} from "react-redux";
import PropTypes from "prop-types";

const columns = [//define columns for the table
  {title: "Name", field: "name"},
  {title: "Email", field: "email"},
  {title: "Last Login", field: "lastLogin", align: "center"},
  {title: "Created on", field: "creationDate", align: "center"},
  {title: "Edit Users", field: "editUsers", align: "center", formatter: "tickCross", editor: true},
  {title: "Edit Settings", field: "editSettings", align: "center", formatter: "tickCross", editor: true},
  {title: "Edit Monitors", field: "editMonitors", align: "center", formatter: "tickCross", editor: true}
];



class Users extends Component {
  constructor(props){
    super(props);
    this.state={
      loading: true,
      data: [],
      errors: {},
      name: '',
      email: '',
      password: '',
      passwordRetype: '',
      formLoading: false
    }

  }
  componentDidMount() {//on component mount, we try fetch data from db
    this.setState({loading: true});
    axios('/api/users/edit/list').then(dat => {
      let data = [];
      dat.data.forEach(user => {
        if (user._id === this.props.auth.user.id)//don't include the currently logged in user, no point
          return;
        //make sure all the data is pretty for displaying to user
        user.lastLogin = new Date(user.lastLogin).toDateString();
        user.creationDate = new Date(user.creationDate).toDateString();
        user.editUsers = user.permissions.editUsers;
        user.editSettings = user.permissions.editSettings;
        user.editMonitors = user.permissions.editMonitors;
        if (user.lastLogin.includes('1970'))//invalid date, means they never logged in
          user.lastLogin = 'Never';
        data.push(user)

      });
      this.setState({data, loading: false});
    });
  }

  editedData(data) {
    let cell = data._cell;
    let type = cell.column.field;
    let id = cell.row.data._id;
    let value = cell.value;
    axios.post('/api/users/edit/permission', {id, type, value}).catch(err => {
      console.log(err);
      this.componentDidMount();
    });
  }

  register = (e) => {
    e.preventDefault();
    this.setState({formLoading: true, errors: {}});
    axios.post('/api/users/register', {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      passwordRetype: this.state.passwordRetype
    }).then(res => {
      console.log(res);
      this.setState({formLoading: false});
      this.componentDidMount();
    }).catch(err => {
      this.setState({errors: err.response.data, formLoading: false});
    });


  };
  onChange = e => {
    this.setState({[e.target.id]: e.target.value});//edit email and password fields while also storing it in state

  };
  render() {


    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="12">
            <Card>
              <CardHeader>
                <i className="fa fa-user"/> Users
              </CardHeader>
              <CardBody>
                {this.state.loading ? <LoadingAnimation/> :
                  this.state.data.length === 0 ?
                    <div className="text-center text-muted">Add a user to get started</div> :
                    <ReactTabulator
                      data={this.state.data}
                      columns={columns}
                      tooltips={true}
                      layout={"fitData"}
                      cellEdited={(data) => this.editedData(data)}
                    />
                }

              </CardBody>
            </Card>


          </Col>
          <Col xs="12" sm="4">
            <Card>
              <CardHeader>
                <i className="fa fa-plus"/> Add a User
              </CardHeader>
              <CardBody>
                <Form noValidate>
                  <FormGroup>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="icon-user"/></InputGroupText>
                      </InputGroupAddon>
                      <Input value={this.state.name} onChange={this.onChange}
                             className={this.state.errors.name ? 'is-invalid' : ''} type="text" id="name" name="name"
                             placeholder="Name"/>
                      <FormFeedback>{this.state.errors.name}</FormFeedback>
                    </InputGroup>
                  </FormGroup>
                  <FormGroup>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="icon-envelope"/></InputGroupText>
                      </InputGroupAddon>
                      <Input value={this.state.email} onChange={this.onChange}
                             className={this.state.errors.email ? 'is-invalid' : ''} type="email" id="email"
                             name="email" placeholder="Email"/>
                      <FormFeedback>{this.state.errors.email}</FormFeedback>
                    </InputGroup>

                  </FormGroup>
                  <FormGroup>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="icon-lock"/></InputGroupText>
                      </InputGroupAddon>
                      <Input value={this.state.password} onChange={this.onChange}
                             className={this.state.errors.password ? 'is-invalid' : ''} type="password" id="password"
                             name="password" placeholder="Password"/>
                      <FormFeedback>{this.state.errors.password}</FormFeedback>
                    </InputGroup>
                  </FormGroup>
                  <FormGroup>
                    <InputGroup>
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText><i className="icon-lock"/></InputGroupText>
                      </InputGroupAddon>
                      <Input value={this.state.passwordRetype} onChange={this.onChange}
                             className={this.state.errors.passwordRetype ? 'is-invalid' : ''} type="password"
                             id="passwordRetype" name="passwordRetype" placeholder="Confirm"/>
                      <FormFeedback>{this.state.errors.passwordRetype}</FormFeedback>
                    </InputGroup>
                  </FormGroup>
                  <FormGroup>
                    <Button type="submit" color="success" onClick={this.register} disabled={this.state.formLoading}>
                      {this.state.formLoading ? <span className="lds-tiny-dual-ring"/> : 'Submit'}
                    </Button>
                  </FormGroup>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>

      </div>
    )
  }
}

Users.propTypes = {
  auth: PropTypes.object.isRequired
};
const mapStateToProps = state => ({
  auth: state.auth//1st is prop, second is global state
});
export default connect(mapStateToProps)(Users);
