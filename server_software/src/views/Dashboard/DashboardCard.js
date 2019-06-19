import {ButtonDropdown, ButtonGroup, Card, CardBody, DropdownItem, DropdownMenu, DropdownToggle} from 'reactstrap';
import React, {Component} from 'react';

class DashboardCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: <span className="lds-tiny-dual-ring"/>,
      isOpen: false,
    };
    this.active = true;
  }

  componentDidMount() {
    if (this.props.request != null) {
      let doFetch = () =>
        fetch(`/api/${this.props.request}`).then(req => req.text()).then(dat => {
          if (!this.active) {
            return;
          }
          this.setState({value: dat});
          setTimeout(doFetch, 2000);

        });
      doFetch();
    }
  }

  componentWillUnmount() {
    this.active = false;

  }

  render() {
    return <Card className={this.props.className}>
      <CardBody className="pb-0">
        <ButtonGroup className="float-right">
          <ButtonDropdown isOpen={this.state.isOpen} toggle={() => {
            this.setState({isOpen: !this.state.isOpen});
          }}>
            <DropdownToggle caret className="p-0" color="transparent">
              <i className="icon-settings"></i>
            </DropdownToggle>
            <DropdownMenu right>
              <DropdownItem>Action</DropdownItem>
              <DropdownItem>Another action</DropdownItem>
              <DropdownItem disabled>Disabled action</DropdownItem>
              <DropdownItem>Something else here</DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        </ButtonGroup>
        <div className="text-value fadeIn">{this.state.value}</div>
        <div>{this.props.title}</div>
      </CardBody>
      {this.props.children}
    </Card>;

  }


}

export default DashboardCard;
