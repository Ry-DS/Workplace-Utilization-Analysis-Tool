import React from 'react';
import {Button, ButtonGroup, ButtonToolbar, CardBody, CardTitle, Col, Row} from "reactstrap";
import Flatpickr from "react-flatpickr";
import {createDateString, mainChartOpts, times} from "./data-processing-utils";
import LoadingAnimation from "./LoadingAnimation";
import {Line} from "react-chartjs-2";
import '../scss/flatpickr-bgis.scss'

//makes a fancy chart to display data easily based on date
//props:
//title: Title of the graph to show
//subtitle: text to show below title
//disableDate: function(Date): lets you tell graph what dates to not allow user to select
//dataset: function(Dates): Lets you pass in a dataset based on a given date range to show to user. Changes as new dates are selected
//Recommended to use a ref if you are fetching updated data and call dateChange(date) in order to update graph
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
    });
    if (this.state.date.length > 0)
      this.dateChange([this.state.date[0]]);
  };
  dateChange = (dates) => {
    let datasets = [];
    let dataDates;
    if (this.state.radioSelected === 2 && dates.length === 2) {
      dataDates = getDatesRange(dates[0], dates[1]);
    } else dataDates = dates.slice(0);
    let mainChartData = {...this.state.mainChartData};
    mainChartData.labels = dataDates.length === 1 ? times : dataDates.sort((a, b) => a - b).map(d => {
      return createDateString(d)

    });
    if (this.props.dataset) {
      datasets = this.props.dataset(dataDates);
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
          <div className="small text-muted">{this.props.subtitle}</div>
        </Col>
        <Col sm="7" className="d-none d-sm-inline-block">
          <ButtonToolbar className="float-right" aria-label="Toolbar with button groups">
            <ButtonGroup className="mr-3" aria-label="First group">
              <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(1)}
                      active={this.state.radioSelected === 1}>Day</Button>
              <Button color="outline-secondary" onClick={() => this.onRadioBtnClick(2)}
                      active={this.state.radioSelected === 2}>Dates</Button>
            </ButtonGroup>

          </ButtonToolbar>
          <span>Select Date:
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
                  if (!this.props.disableDate)
                    return false;
                  return this.props.disableDate(date);

                }
              ]
            }}
            onChange={date => {
              this.dateChange(date)
            }}/>
          </span>
        </Col>
      </Row>
      <div className="chart-wrapper" style={{height: 300 + 'px', marginTop: 40 + 'px'}}>
        {
          this.state.mainChartData.datasets.length > 0 ?
            <Line data={this.state.mainChartData} options={mainChartOpts} height={300}/> : <LoadingAnimation/>
        }

      </div>
    </CardBody>);
  }
}

function getDatesRange(start, end) {
  let arr, dt;
  for (arr = [], dt = new Date(start.getTime()); dt <= end; dt.setDate(dt.getDate() + 1)) {
    arr.push(new Date(dt));
  }
  return arr;
}

export default BigLineChart;
