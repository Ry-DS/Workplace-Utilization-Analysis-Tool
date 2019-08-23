//individual chart edit menu
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
import toast from 'toasted-notes'
import 'toasted-notes/src/styles.css';


class Monitor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      errors: [],//form stuff
      teams: [],
      data: null,
      selectedOptions: []
    }
  }

  componentDidMount() {//on component mount, we try fetch data from db
    this.setState({loading: true});//make the loading animation begin
    //we'll hope they finish ok in the event loop since idk about waiting for one to finish to start the next
    axios('/api/teams/list').then(data => {//fetch teams.
      let teamIndex = {};
      data.data.forEach(team => teamIndex[team._id] = team.name);
      this.setState({
        teams: data.data.map(team => {
          return {label: team.name, value: team._id};
        }),
        teamIndex//helps find name of team from ID
      });
      axios.get('/api/monitors/edit/list', {params: {id: this.props.match.params.id}}).then(data => {//try fetch user data
        data.data.quota.forEach(floor => {
          if (Array.isArray(floor.sharedWith)) {
            floor.sharedWith = floor.sharedWith.filter(value => {
              return !!this.state.teamIndex[value];//only keep if id is in teams index

            });
          } else floor.sharedWith = [];
        });
        this.setState({data: data.data, loading: false});//update and stop loading animation
      }).catch(err => {
        console.log(err);
        this.props.history.push('/404');//go back, invalid ID to show
      });

    });


  }

  componentWillUnmount() {
    this.update();
  }


  onChange = e => {
    this.setState({data: {...this.state.data, [e.target.id]: e.target.value}});//edit fields while also storing it in state

  };
  update = (e) => {
    //we want to check if the update was called while the component was still in use.
    if (e) {
      e.preventDefault();
      this.setState({formLoading: true});
    }
    axios.post('/api/monitors/edit/replace', this.state.data).then(() => {
      toast.notify("Successfully Saved!");
      if (e)
        this.setState({formLoading: false});

    }).catch(err => {
      toast.notify("There was an issue saving.");
      if (e) {
        this.setState({formLoading: false});
        this.componentDidMount();
      }

    });
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
    MONITOR_TYPE.forEach(type => {
      options.push({value: type, label: type});
    });
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
                        onChange={(selected) => this.onChange({target: {id: 'type', value: selected.value}})}
                        options={options}
                        styles={customStyles}
                      />
                    </FormGroup>


                  </Form>

                }
              </CardBody>
              <CardFooter>
                <Button type="submit" onClick={this.update} style={buttonStyle}
                        disabled={this.state.formLoading || this.state.loading}>
                  {this.state.formLoading ? <span className="lds-tiny-dual-ring"/> : 'Save'}
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

                  <ListGroup>
                    {this.state.data.quota && this.state.data.quota.length > 0 ? this.state.data.quota.map((floor, index) => {
                      return (<ListGroupItem key={index} className="animated fadeIn">
                        <span className="close" onClick={(e) => {
                          e.preventDefault();
                          let quota = [...this.state.data.quota];
                          quota.splice(quota.indexOf(floor), 1);
                          this.setState({data: {...this.state.data, quota}});
                        }
                        }><i className="cui-circle-x"/></span>
                        <FormGroup>
                          <Label>Name</Label>
                          <Input
                            type="text"
                            name="name"
                            value={floor.name}
                            onChange={(e) => {
                              floor.name = e.target.value;
                              this.setState({...this.state})
                            }}
                          />

                        </FormGroup>
                        <FormGroup>
                          <Label>Teams</Label>
                          <Select
                            options={this.state.teams}
                            styles={customStyles}
                            isMulti={true}
                            value={floor.sharedWith.map(team => {
                              return {value: team, label: this.state.teamIndex[team]}
                            })}
                            onChange={(options) => {
                              floor.sharedWith = options ? options.map(v => v.value) : [];
                              this.setState({...this.state})
                            }}
                          />

                        </FormGroup>
                        <FormGroup>
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            name="amount"
                            value={floor.amount ? floor.amount : ''}
                            onChange={(e) => {
                              if (e.target.value < 0 || isNaN(e.target.value)) {
                                e.preventDefault();
                                return;
                              }
                              floor.amount = parseInt(e.target.value);
                              this.setState({...this.state})
                            }}
                          />

                        </FormGroup>

                      </ListGroupItem>);
                    }) : <div className="text-center text-muted">Add a floor to get started</div>}


                  </ListGroup>


                }
              </CardBody>
              <CardFooter>
                <Button type="add" style={addButtonStyle} onClick={(e) => {
                  e.preventDefault();
                  let quota = this.state.data.quota.slice(0);
                  quota.push({name: "Floor " + (quota.length + 1), sharedWith: [], amount: 0});
                  this.setState({data: {...this.state.data, quota}});

                }}
                        disabled={this.state.formLoading || this.state.loading}>
                  <i className="fa fa-plus"/> Add Floor
                </Button>
                <Button type="submit" onClick={this.update} style={buttonStyle}
                        disabled={this.state.formLoading || this.state.loading}>
                  {this.state.formLoading ? <span className="lds-tiny-dual-ring"/> : 'Save'}
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
