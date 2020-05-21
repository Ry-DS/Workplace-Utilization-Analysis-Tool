import React, {Component} from 'react';
import {Alert, Button, Card, CardBody, CardHeader, Col, Form, FormGroup, Row} from 'reactstrap';
import axios from 'axios';
import 'react-tabulator/css/tabulator_simple.min.css'
import {ReactTabulator} from 'react-tabulator';
import LoadingAnimation from "../../utils/LoadingAnimation";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {getStyle} from "@coreui/coreui/dist/js/coreui-utilities";
import tutorial from './../../utils/tutorial';
import FormField from "../../utils/FormField";

const editButtons = function (value, data, cell, row, options) { //plain text value, so we cant use react jsx. Instead, just a plain html button for deletion
  return "<Button class='btn btn-danger' style='width: 100%'><i class='fa fa-trash-o'/></Button>"
};

const columns = (container) => {
  return [//define columns for the table, we pass the Users component, so we can perform actions on click
  {title: "Name", field: "name"},
  {title: "Email", field: "email"},
  {title: "Last Login", field: "lastLogin", align: "center"},
  {title: "Created on", field: "creationDate", align: "center"},
  {title: "Edit Users", field: "editUsers", align: "center", formatter: "tickCross", editor: true},
    {title: "Edit Teams", field: "editSettings", align: "center", formatter: "tickCross", editor: true},
    {title: "Edit Monitors", field: "editMonitors", align: "center", formatter: "tickCross", editor: true},
    {
      title: "Del.", sortable: false, width: 70, formatter: editButtons, cellClick: function (e, cell, value, data) {
        if (window.confirm(`You are about to delete ${cell._cell.row.data.name}'s account`)) {//on delete button, make sure they want to delete
          container.setState({loading: true});//start loading animation
          axios.post('/api/users/edit/delete', {id: cell._cell.row.data._id})//start server request for delete
            .finally(() => container.componentDidMount());//TODO maybe error handling?
          //even if it failed, lets just refresh the latest from the db, the user can then decide if the delete was successful.
        }
      }
    }
  ]
};



class Users extends Component {
  constructor(props){
    super(props);
    this.state={
      loading: true,//whether the table is loading, initially true, controls loading animation
      data: [],//table data to display
      errors: {},//errors and fields listed for the register form
      name: '',
      email: '',
      password: '',
      passwordRetype: '',
      hint: !tutorial.isFinished("edit_permissions"),
      formLoading: false//whether the registration form is processing, disables the submit button
    }


  }
  componentDidMount() {//on component mount, we try fetch data from db
    this.setState({loading: true});//make the loading animation begin

    axios('/api/users/edit/list').then(dat => {//try fetch user data
      let data = [];
      dat.data.forEach(user => {//for every user given from the backend
        if (user._id === this.props.auth.user.id)//don't include the currently logged in user, no point
          return;
        //make sure all the data is pretty for displaying to user
        user.lastLogin = new Date(user.lastLogin).toDateString();
        user.creationDate = new Date(user.creationDate).toDateString();
        user.editUsers = user.permissions.editUsers;
        user.editSettings = user.permissions.editSettings;
        user.editMonitors = user.permissions.editMonitors;
        if (user.lastLogin.includes('1970'))//invalid date, means they never logged in
          user.lastLogin = 'Never';//so we tell that to the user, instead of showing the date 1970
        data.push(user)

      });
      this.setState({data, loading: false});//update table and stop loading animation
      setTimeout(() => {
        this.setState({popoverOpen: true})
      }, 3000)
    });
  }

  editedData(data) {//when a cell is edited
    let type = data.getField();
    let id = data.getRow().getData()._id;
    let value = data.getValue();
    axios.post('/api/users/edit/permission', {id, type, value}).catch(err => {//try update the relevant permission
      this.componentDidMount();//if we failed, try refresh the table instead of showing false success
    });
  }

  register = (e) => {//when the user tries to register a new user
    e.preventDefault();//prevent the default HTML form submit
    this.setState({formLoading: true, errors: {}});//start loading animation
    axios.post('/api/users/register', {//try register user with form data form state
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      passwordRetype: this.state.passwordRetype
    }).then(res => {//success?
      this.setState({formLoading: false, name: '', email: '', password: '', passwordRetype: ''});//remove loading animation and clear form
      this.componentDidMount();//reload table with new user
    }).catch(err => {//failed?
      this.setState({errors: err.response.data, formLoading: false});//stop loading animation and show why it failed to user
    });


  };
  onChange = e => {
    this.setState({[e.target.id]: e.target.value});//edit fields while also storing it in state

  };
  render() {
    const buttonStyle = {//submit button style, with better colors to match theme
      backgroundColor: getStyle('--theme-light'),
      borderColor: getStyle('--theme-bland'),
      color: '#fff'
    };

    //render html page to user, comments cannot be inserted within a html document when using JSX
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
                    <div>
                      <ReactTabulator
                        data={this.state.data}
                        className="animated fadeIn"
                        columns={columns(this)}
                        tooltips={true}
                        layout={"fitData"}
                        cellEdited={(data) => this.editedData(data)}
                      />
                      <Alert color="primary" isOpen={this.state.hint}
                             toggle={() => {
                               this.setState({hint: false});
                               tutorial.addFinished("edit_permissions")
                             }}>
                        <h6>Did you know?</h6>
                        You can change user permissions by clicking the check marks. Try it out!
                      </Alert>
                    </div>




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
                  <FormField id='name' onChange={this.onChange} value={this.state.name} name='Name'
                             error={this.state.errors.name}>
                    <i className='icon-user'/>
                  </FormField>
                  <FormField id='email' onChange={this.onChange} value={this.state.email} name='Email'
                             error={this.state.errors.email}>
                    <i className="icon-envelope"/>
                  </FormField>
                  <FormField type='password' id='password' onChange={this.onChange} value={this.state.password}
                             name='Password' error={this.state.errors.password}>
                    <i className="icon-lock"/>
                  </FormField>
                  <FormField type='password' id='passwordRetype' onChange={this.onChange}
                             value={this.state.passwordRetype} name='Confirm' error={this.state.errors.passwordRetype}>
                    <i className="icon-lock"/>
                  </FormField>
                  <FormGroup>
                    <Button type="submit" color="success" onClick={this.register} style={buttonStyle}
                            disabled={this.state.formLoading}>
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
