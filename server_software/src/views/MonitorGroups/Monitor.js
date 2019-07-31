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
  Label,
  ListGroup,
  ListGroupItem,
  Row
} from 'reactstrap';
import axios from "axios";
import LoadingAnimation from "../../utils/LoadingAnimation";
import {getStyle} from "@coreui/coreui/dist/js/coreui-utilities";
import Select from 'react-select';
import MONITOR_TYPE from '../../utils/monitorTypes';
import CardFooter from "reactstrap/es/CardFooter";


class Monitor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      errors: [],
      teams: [],
      data: null,
      selectedOptions: []
    }
  }

  componentDidMount() {//on component mount, we try fetch data from db
    this.setState({loading: true});//make the loading animation begin
    axios.get('/api/monitors/edit/list', {params: {id: this.props.match.params.id}}).then(data => {//try fetch user data
      this.setState({data: data.data, loading: false});//update and stop loading animation
    }).catch(err => {
      this.props.history.push('/404');//go back, invalid ID to show
    });
    axios('/api/teams/list').then(data => {//fetch teams.

      this.setState({
        teams: data.data.map(team => {
          return {label: team.name, value: team._id};
        })
      });
    });
  }

  onChange = e => {
    this.setState({data: {...this.state.data, [e.target.id]: e.target.value}});//edit fields while also storing it in state

  };
  update = (e) => {//TODO should update the monitor in the DB
    e.preventDefault();
  };
  handleChange = (selectedOptions) => {
    this.setState({selectedOptions});
  };

  render() {
    const buttonStyle = {//submit button style, with better colors to match theme
      backgroundColor: getStyle('--theme-light'),
      borderColor: getStyle('--theme-bland'),
      color: '#fff'
    };
    const addButtonStyle = {//submit button style, with better colors to match theme
      backgroundColor: getStyle('--theme-bland'),
      borderColor: getStyle('--theme-dark'),
      color: '#fff',
      marginRight: '1em'
    };
    const options = [];
    for (let type in MONITOR_TYPE) {
      options.push({value: MONITOR_TYPE[type], label: MONITOR_TYPE[type]});
    }
    const customStyles = {
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? getStyle('--theme-light') : provided.backgroundColor,
      }),
    };


    return (
      <div className="animated fadeIn">
        <Row>
          <Col lg={6}>
            <Card>
              <CardHeader>
                <strong><i className="icon-pencil pr-1"/>Edit Monitor</strong>
              </CardHeader>
              <CardBody>
                {this.state.loading ? <LoadingAnimation/> :
                  <Form noValidate className="animated fadeIn">
                    <FormGroup>
                      <Label>Name</Label>
                      <InputGroup>
                        <Input value={this.state.data.friendlyName} onChange={this.onChange}
                               className={this.state.errors.friendlyName ? 'is-invalid' : ''} type="text"
                               id="friendlyName" name="friendlyName"
                               placeholder="Name"/>
                        <FormFeedback>{this.state.errors.friendlyName}</FormFeedback>
                      </InputGroup>
                    </FormGroup>
                    <FormGroup>
                      <Label>Type</Label>
                      <Select
                        value={{label: this.state.data.type, value: this.state.data.type}}
                        onChange={(selected) => this.onChange({target: {id: 'type', value: selected}})}
                        options={options}
                        styles={customStyles}
                      />
                    </FormGroup>


                  </Form>

                }
              </CardBody>
              <CardFooter>
                <Button type="submit" onClick={this.update} style={buttonStyle}
                        disabled={this.state.formLoading}>
                  {this.state.formLoading ? <span className="lds-tiny-dual-ring"/> : 'Submit'}
                </Button>
              </CardFooter>
            </Card>
          </Col>
          <Col>
            <Card>
              <CardHeader>
                <strong><i className="icon-pencil pr-1"/>Edit Floors</strong>
              </CardHeader>
              <CardBody>
                {this.state.loading ? <LoadingAnimation/> :

                  <ListGroup className="animated fadeIn">
                    <ListGroupItem>
                      <FormGroup>
                        <Label>Teams</Label>
                        <Select
                          options={this.state.teams}
                          styles={customStyles}
                          isMulti={true}
                          value={this.state.selectedOptions}
                          onChange={this.handleChange}
                        />

                      </FormGroup>
                    </ListGroupItem>
                    <ListGroupItem>
                      <span className="close"><i className="cui-circle-x"/></span>
                      <FormGroup>
                        <Label>Teams</Label>
                        <Select
                          options={this.state.teams}
                          styles={customStyles}
                          isMulti={true}
                          value={this.state.selectedOptions}
                          onChange={this.handleChange}
                        />

                      </FormGroup>
                    </ListGroupItem>
                  </ListGroup>



                }
              </CardBody>
              <CardFooter>
                <Button type="add" style={addButtonStyle} onClick={(e) => e.preventDefault()}
                        disabled={this.state.formLoading}>
                  <i className="fa fa-plus"/> Add Floor
                </Button>
                <Button type="submit" onClick={this.update} style={buttonStyle}
                        disabled={this.state.formLoading}>
                  {this.state.formLoading ? <span className="lds-tiny-dual-ring"/> : 'Submit'}
                </Button>
              </CardFooter>
            </Card>
          </Col>


        </Row>
        <Row><Col><Card>
          <CardHeader>
            <strong><i className="icon-info pr-1"/>Monitor Details</strong>
          </CardHeader>
          <CardBody>
            {this.state.loading ? <LoadingAnimation/> :
              <Form noValidate className="animated fadeIn">


                <FormGroup>
                  <Label>Created By</Label>
                  <ListGroup><ListGroupItem>{this.state.data.createdBy ? this.state.data.createdBy : "Unknown"}</ListGroupItem></ListGroup>

                </FormGroup>
                <FormGroup>
                  <Label>Created on</Label>
                  <ListGroup><ListGroupItem>{new Date(this.state.data.creationDate).toDateString()}</ListGroupItem></ListGroup>

                </FormGroup>
                <FormGroup>
                  <Label>Model</Label>
                  <ListGroup><ListGroupItem>{this.state.data.name}</ListGroupItem></ListGroup>

                </FormGroup>
                <FormGroup>
                  <Label>ID</Label>
                  <ListGroup><ListGroupItem>{this.state.data._id}</ListGroupItem></ListGroup>

                </FormGroup>

              </Form>

            }
          </CardBody>
        </Card>
        </Col>
        </Row>
      </div>
    )
  }
}

export default Monitor;
