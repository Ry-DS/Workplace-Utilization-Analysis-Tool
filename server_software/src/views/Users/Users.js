import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table, Button} from 'reactstrap';


function UserRow(props) {
  const user = props.user;

  return (
    <tr key={props.id}>
      <th scope="row">{user.name}</th>
      <td>{user.email}</td>
      <td>{user.registered}</td>
      <td>{user.lastLogin}</td>
      <td><Button onClick={console.log("TODO pop modal")}>Change Password</Button></td>
    </tr>
  )
}

class Users extends Component {
  constructor(props){
    super(props);
    this.state={
      loading: true
    }

  }
  componentDidMount() {//on component mount, we try fetch data from db

  }

  render() {


    return (
      <div className="animated fadeIn">
        <Row>
          <Col xl={6}>
            <Card>
              <CardHeader>
                <i className="fa fa-align-justify"></i> Users <small className="text-muted">example</small>
              </CardHeader>
              <CardBody>
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th scope="col">id</th>
                      <th scope="col">name</th>
                      <th scope="col">registered</th>
                      <th scope="col">role</th>
                      <th scope="col">status</th>
                    </tr>
                  </thead>
                  <tbody>

                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default Users;
