import React, {Component} from 'react';
import {Alert, Card, CardBody, CardHeader, Col, Row} from 'reactstrap';
import axios from 'axios';
import 'react-tabulator/css/tabulator_simple.min.css'
import {ReactTabulator} from 'react-tabulator';
import LoadingAnimation from "../../utils/LoadingAnimation";
import tutorial from './../../utils/tutorial';
import MONITOR_TYPES from '../../utils/monitorTypes';


const monitorTypeDropdown = {};
MONITOR_TYPES.forEach(type => {
  monitorTypeDropdown[type] = type;
});
const editButtons = function () { //plain text value, so we cant use react jsx. Instead, just a plain html button for deletion
  return "<Button class='btn btn-primary' style='width: 100%'><i class='fa fa-pencil-square-o'/></Button>"
};
const columns = (container) => {
  return [
    {
      title: "Name", field: "friendlyName", editor: 'input', formatter: (cell) => {
        return cell.getValue() + (cell.getRow().getData().new ? " <span class='mr-1 badge badge-info'>NEW</span>" : "");
      }
    },
    {title: "Type", field: "type", editor: "select", align: "center", editorParams: {values: monitorTypeDropdown}},
    {title: "Created on", field: "creationDate", align: "center"},
    {title: "Model", field: "name", align: "center"},
    {
      title: "Edit", sortable: false, width: 70, formatter: editButtons, cellClick: function (e, cell, value, data) {
        container.props.history.push(`/monitor-groups/${cell.getData()._id}`)
      }
    }
  ]
};

class MonitorGroups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,//whether the table is loading, initially true, controls loading animation
      data: [],//table data to display
      errors: {},//errors and fields listed for the register form
      name: '',
      hint: !tutorial.isFinished('edit_monitor_groups'),
      formLoading: false,//whether the registration form is processing, disables the submit button
    }

  }

  componentDidMount() {

    //on component mount, we try fetch data from db
    this.setState({loading: true});//make the loading animation begin
    axios('/api/monitors/edit/list').then(dat => {//try fetch user data
      let data = [];
      dat.data.forEach(monitor => {//for every monitor given from the backend
        //make sure all the data is pretty for displaying to user
        monitor.creationDate = new Date(monitor.creationDate).toDateString();
        data.push(monitor)

      });
      this.setState({data, loading: false});//update table and stop loading animation
    });
  }

  editedData(data) {//when a cell is edited
    let cell = data._cell;
    let type = cell.column.field;
    let id = cell.row.data._id;
    let value = cell.value;
    axios.post('/api/monitors/edit', {id, value, type}).catch(err => {//try update the relevant permission
      this.componentDidMount();//if we failed, try refresh the table instead of showing false success
    });
  }

  monitorSelected(row) {
    console.log(row.getData().name);
    this.setState({selected: row});

  }


  render() {


    //render html page to user, comments cannot be inserted within a html document when using JSX
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="12">
            <Card>
              <CardHeader>
                <i className="fa fa-user"/> Monitor Groups
              </CardHeader>
              <CardBody>
                {this.state.loading ? <LoadingAnimation/> :
                  this.state.data.length === 0 ?
                    <div className="text-center text-muted">Connect some monitors to a registered laptop to get
                      started</div> :
                    <div>
                      <ReactTabulator
                        data={this.state.data}
                        columns={columns(this)}
                        tooltips={true}
                        cellEdited={(data) => this.editedData(data)}
                        rowSelected={(row) => this.monitorSelected(row)}
                      />
                      <Alert color="primary" isOpen={this.state.hint}
                             toggle={() => {
                               this.setState({hint: false});
                               tutorial.addFinished("edit_monitor_groups")
                             }}>
                        <h6>Did you know?</h6>
                        You can rename monitors by clicking on its name. Try it out! You may also select a monitor in order to edit it.
                      </Alert>
                    </div>
                }

              </CardBody>
            </Card>


          </Col>
        </Row>

      </div>);
  }
}

export default MonitorGroups;
