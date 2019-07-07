import React, {Component} from 'react';
import {Card, CardBody, CardHeader, Col, Row} from 'reactstrap';
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
      data: []
    }

  }
  componentDidMount() {//on component mount, we try fetch data from db
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
    console.log("s");
    axios.post('/api/users/edit/permission', {id, type, value}).catch(err => {
      console.log(err);
      this.componentDidMount();
    });
  }
  render() {


    return (
      <div className="animated fadeIn">
        <Row>
          <Col>
            <Card>
              <CardHeader>
                <i className="fa fa-user"/> Users
              </CardHeader>
              <CardBody>
                {this.state.loading ? <LoadingAnimation/> :
                  this.state.data.length === 0 ?
                    <div className="text-center text-muted">Add a user below to get started</div> :
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
