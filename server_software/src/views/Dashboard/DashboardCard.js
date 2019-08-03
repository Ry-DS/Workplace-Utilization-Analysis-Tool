import {Card, CardBody} from 'reactstrap';
import React, {Component} from 'react';
import axios from 'axios';

//This special card automatically updates from the database server
class DashboardCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: <span className="lds-tiny-dual-ring"/>,//we set the state to an initial spinning ring as we are about to fetch data from server
      isOpen: false,
    };
    this.active = true;

  }
  componentDidMount() {//run on component init
    if (this.props.request != null) {//if the card actually has a request to check from
      let doFetch = () =>
        axios(`/api/${this.props.request}`).then(dat => {
          if (!this.active) {//we check if we are still on the dashboard, therefore still updating
            return;
          }
          this.setState({value: dat.data});//set the state to the new value
          this.task = setTimeout(doFetch, 3000);//do it again in 2 seconds, provides live updating

        });
      doFetch();//initial call to start the loop
    }
  }

  componentWillUnmount() {//called when we leave the dash page
    this.active = false;//stop loop above so we aren't causing any leaks or errors
    if (this.task)
      clearTimeout(this.task);
  }

  render() {
    let content = this.props.content;
    if (isNaN(content) && content !== undefined) {
      content = 'None';
    }
    return <Card className={this.props.className}>{/*Card design, pass css styles from parent for background colors*/}
      <CardBody className="pb-0">
        <div
          className="text-value animated fadeIn">{content !== undefined && content !== null ? content : this.state.value}</div>
        {/*We set the value and title based on what is given from the constructor and server*/}
        <div>{this.props.title}</div>
      </CardBody>
      {this.props.children}{/*Paste children given from dash, normally a graph or something, displayed below content in card with no paddings*/}
    </Card>;

  }


}

export default DashboardCard;
