import React, {Component} from 'react';
import {Card, CardBody, CardHeader, Col, Row} from 'reactstrap';
import axios from "axios";
import LoadingAnimation from "../../utils/LoadingAnimation";


class Monitor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {//on component mount, we try fetch data from db
    this.setState({loading: true});//make the loading animation begin
    axios.get('/api/monitors/edit/list', {params: {id: this.props.match.params.id}}).then(data => {//try fetch user data
      this.setState({data: data.data, loading: false});//update and stop loading animation
    }).catch(err => {
      this.props.history.push('/404');//go back, invalid ID to show
    });
  }


  render() {


    return (
      <div className="animated fadeIn">
        <Row>
          <Col lg={6}>
            <Card>
              <CardHeader>
                <strong><i className="icon-info pr-1"/>Monitor ID: {this.props.match.params.id}</strong>
              </CardHeader>
              <CardBody>
                {this.state.loading ? <LoadingAnimation/> :
                  <div>
                    eoifwmefwiomioefwimoefwmioewfimoewimoewfioefw
                    <Card>
                      <CardHeader>
                        {this.state.data.name}</CardHeader>
                      ioefwimoewfimoefwimoewfmo
                      ewfimoefwmoiomewif
                      efwomimo
                    </Card>
                    awdwoefimewfoimefwimioefwimoefwimoewfimoefw
                  </div>

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
