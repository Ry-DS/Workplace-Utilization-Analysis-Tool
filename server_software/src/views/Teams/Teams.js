import React, {Component} from 'react';
import $ from 'jquery';
import flatpickr from 'flatpickr/dist/flatpickr.min.js';
import '../../scss/flatpickr-bgis.scss'
import {
  Alert,
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
import {getStyle} from "@coreui/coreui/dist/js/coreui-utilities";
import tutorial from './../../utils/tutorial';
import Pickr from '@simonwep/pickr';
import '@simonwep/pickr/dist/themes/classic.min.css';
//fetch color themes from css
const brandDark = getStyle('--theme-dark');
const brandLight = getStyle('--theme-light');
const brandNorm = getStyle('--theme-norm');
const brandBland = getStyle('--theme-bland');
const editButtons = function () { //plain text value, so we cant use react jsx. Instead, just a plain html button for deletion
  return "<Button class='btn btn-danger' style='width: 100%'><i class='fa fa-trash-o'/></Button>"
};

//https://github.com/olifolkerd/tabulator/issues/640
function flatpickerEditor(cell, onRendered, success, cancel)
{
  let input = $("<input type='text'/>");

  flatpickr(input,{
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: false,
    minDate:cell.getField()==='endTime'?cell.getRow().getData().startTime:undefined,
    maxDate:cell.getField()==='startTime'?cell.getRow().getData().endTime:undefined,
   // locale: "en", // global variable with locale 'en', 'fr', ...
    defaultDate: cell.getValue(),
    onClose: function (selectedDates, dateStr, instance) {
      let evt = window.event;//gotta use it, we can't get the event anyway else
      let isEscape = false;
      if ("key" in evt)
      {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
      } else
      {
        isEscape = (evt.keyCode === 27);
      }
      if (isEscape)
      {
        // user hit escape
        cancel();
      } else
      {
        success(dateStr);
      }
    }
  });

  input.css({
    "border": "1px",
    "background": "transparent",
    "padding": "4px",
    "width": "100%",
    "box-sizing": "border-box",
    "text-align": "center"
  });

  input.val(cell.getValue());


  onRendered(function () {
    input.focus();
  });

  return input.get()[0];
}

function colorPickerEditor(cell, onRendered, success, cancel, ref) {
  let input = ref && ref.current ? ref.current : $(colorFormatter(cell)).get()[0];
  const pickr = new Pickr({
    el: input, // Insert query / element
    default: cell.getValue(),
    useAsButton: true,
    swatches: [brandDark, brandLight, brandBland, brandNorm
    ],

    components: {

      preview: true,
      opacity: false,
      hue: true,

      interaction: {
        input: true,
        save: true
      }
    }
  });
  pickr.on('save', color => {
    success('#' + color.toHEXA().join(''));
    pickr.hide();
  });
  pickr.on('hide', () => cancel());


  onRendered(function () {
    pickr.show();
  });

  return input;
}


//https://stackoverflow.com/questions/13898423/javascript-convert-24-hour-time-of-day-string-to-12-hour-time-with-am-pm-and-no
function timeFormatter(cell) {
  // Check correct time format and split into components
  let time = cell.getValue().toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [cell.getValue()];

  if (time.length > 1) { // If time format correct
    time = time.slice(1);  // Remove full string match value
    time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(''); // return adjusted time or original string
}

function colorFormatter(cell) {
  return `<div style='background-color: ${cell.getValue()};width: 2em;height: 2em;display: block;margin:auto;border-radius: 3px'></div>`
}


const columns = (container) => {
  return [//define columns for the table, we pass the Users component, so we can perform actions on click
    {title: "Name", field: "name", editor: true},
    {title: "Created on", field: "creationDate", align: "center"},
    {title: "Registered", field: "employeeCount", align: "center", width: 120},
    {title: "Start Tracking", field: 'startTime', align: 'center', editor: flatpickerEditor, formatter: timeFormatter},
    {title: "Stop Tracking", field: 'endTime', align: 'center', editor: flatpickerEditor, formatter: timeFormatter},
    {title: '', field: 'color', align: 'center', editor: colorPickerEditor, formatter: colorFormatter, width: 30},
    {
      title: "Del.", sortable: false, width: 70, formatter: editButtons, cellClick: function (e, cell, value, data) {
        if (window.confirm(`You are about to delete ${cell._cell.row.data.name}. This action will permanently delete ALL employee data attached with this team`)) {//on delete button, make sure they want to delete
          if (window.confirm('Valuable data MAY BE DELETED if you perform this action and all affected employees will need to re-choose their team. Select OK if you wish to continue')) {
          container.setState({loading: true});//start loading animation
          axios.post('/api/teams/edit/delete', {id: cell._cell.row.data._id})//start server request for delete
            .finally(() => container.componentDidMount());//TODO maybe error handling?
          //even if it failed, lets just refresh the latest from the db, the user can then decide if the delete was successful.
          }
        }
      }
    }
  ]
};

class Teams extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,//whether the table is loading, initially true, controls loading animation
      data: [],//table data to display
      errors: {},//errors and fields listed for the register form
      name: '',
      color: brandNorm,
      hint: !tutorial.isFinished('edit_team_names'),
      formLoading: false//whether the registration form is processing, disables the submit button
    };
    this.colorRef = React.createRef();

  }

  componentDidMount() {//on component mount, we try fetch data from db
    this.setState({loading: true});//make the loading animation begin
    axios('/api/teams/list').then(dat => {//try fetch user data
      let data = [];
      dat.data.forEach(team => {//for every team given from the backend
        //make sure all the data is pretty for displaying to user
        team.creationDate = new Date(team.creationDate).toDateString();
        team.employeeCount = team.employees ? team.employees.length : 0;
        data.push(team)

      });
      this.setState({data, loading: false});//update table and stop loading animation
    });
    if (this.colorRef.current) {
      colorPickerEditor({getValue: () => this.state.color}, () => {
      }, (color) => this.setState({color}), () => {
      }, this.colorRef);
    }

  }

  editedData(data) {//when a cell is edited
    let type = data.getField();
    let id = data.getRow().getData()._id;
    let value = data.getValue();
    axios.post('/api/teams/edit', {id, type,value}).catch(err => {//try update the relevant permission
      this.componentDidMount();//if we failed, try refresh the table instead of showing false success
    });
  }

  register = (e) => {//when the user tries to register a new user
    e.preventDefault();//prevent the default HTML form submit
    this.setState({formLoading: true, errors: {}});//start loading animation
    axios.post('/api/teams/edit/create', {//try register team with form data form state
      name: this.state.name,
      color: this.state.color
    }).then(res => {//success?
      this.setState({formLoading: false});//remove loading animation
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
    const colorPickerStyle = {
      backgroundColor: this.state.color,
      width: '2em',
      height: '2em',
      display: 'block',
      borderRadius: '3px',
      cursor: 'pointer'
    };

    //render html page to user, comments cannot be inserted within a html document when using JSX
    return (
      <div className="animated fadeIn">
        <Row>
          <Col xs="12" sm="12">
            <Card>
              <CardHeader>
                <i className="fa fa-user"/> Teams
              </CardHeader>
              <CardBody>
                {this.state.loading ? <LoadingAnimation/> :
                  this.state.data.length === 0 ?
                    <div className="text-center text-muted">Add a team to get started</div> :
                    <div>
                      <ReactTabulator
                        data={this.state.data}
                        columns={columns(this)}
                        tooltips={true}
                        layout={"fitData"}
                        cellEdited={(data) => this.editedData(data)}
                      />
                      <Alert color="primary" isOpen={this.state.hint}
                             toggle={() => {
                               this.setState({hint: false});
                               tutorial.addFinished("edit_team_names")
                             }}>
                        <h6>Did you know?</h6>
                        You can rename teams, change their tracking times and color by clicking the respective cells.
                        Try it out!<br/><br/>
                        <i>The tracking times define when WUAT should actively track data from employees</i>
                      </Alert>
                    </div>
                }

              </CardBody>
            </Card>


          </Col>
        </Row>
        <Row>
          <Col xs="12" sm="5">
            <Card>
              <CardHeader>
                <i className="fa fa-plus"/> Add a Team
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
                        <InputGroupText><i className="fa fa-paint-brush"/></InputGroupText>
                      </InputGroupAddon>
                      <div ref={this.colorRef} style={colorPickerStyle}/>
                      <FormFeedback>{this.state.errors.color}</FormFeedback>
                    </InputGroup>
                  </FormGroup>
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

      </div>);
  }
}

export default Teams;
