import React from 'react';
import {Button, ButtonGroup, ButtonToolbar, CardBody, CardTitle, Col, Row} from "reactstrap";
import Flatpickr from "react-flatpickr";
import {createDateString, mainChartOpts, times} from "./data-processing-utils";
import {Line} from "react-chartjs-2";


class BigLineChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mainChartData: {
        labels: [],
        datasets: [],
      },
      date: [new Date()],
      radioSelected: 1

    }
  }

  onRadioBtnClick = (radioSelected) => {
    this.setState({
      radioSelected: radioSelected,
      date: [this.state.date[0]]
    });
    this.dateChange(this.state.date);
  };
  dateChange = (dates) => {
    let datasets = [];
    let mainChartData = {...this.state.mainChartData};
    mainChartData.labels = dates.length === 1 ? times : dates.sort((a, b) => a - b).map(d => {
      return createDateString(d)

    });
    if (this.props.dataset) {
      datasets = this.props.dataset(dates);
      mainChartData.datasets = datasets;
    }
    this.setState({date: dates, mainChartData});
  };

  render() {
    let dateStyle = {
      width: '40%'
    };
    return (<CardBody>
      <Row>
        <Col sm="5">
          <CardTitle className="mb-0">{this.props.title}</CardTitle>
          <div className="small text-muted">{this.props.subtext}</div>
        </Col>
        <Col sm="7" className="d-none d-sm-inline-block">
          <Button color="primary" className="float-right"><i className="icon-cloud-download"></i></Button>
          <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
            <ButtonGroup className="mr-3" aria-label="First group">
              <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(1)}
                      active={this.state.radioSelected === 1}>Day</Button>
              <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(2)}
                      active={this.state.radioSelected === 2}>Dates</Button>
            </ButtonGroup>

          </ButtonToolbar>
          <Flatpickr
            className="form-control"
            style={dateStyle}
            value={this.state.date}
            options={{
              mode: this.state.radioSelected === 1 ? "multiple" : "range",
              dateFormat: "Y-m-d",
              disable: [
                (date) => {
                  // return true to disable
                  return this.props.disableDate(date);

                }
              ]
            }}
            onChange={date => {
              this.dateChange(date)
            }}/>
        </Col>
      </Row>
      <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
        <Line data={this.state.mainChartData} options={mainChartOpts} height={300}/>
      </div>
    </CardBody>);
  }
}

export default BigLineChart;
