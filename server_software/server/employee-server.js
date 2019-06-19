//this server accepts connections from the employees in order to store usage data and allow the other server to access.
const Net = require('net');
//server test

const port = 7250;
module.exports = class EmployeeServer {
  constructor() {
    this.server = Net.createServer();
    this.connectionCount = 0;
    this.server.listen(port, () => {
      console.log("Server Listening on port: " + port);
    });
    this.server.on('connection', socket => {
      console.log('A new connection has been established.');

      // Now that a TCP connection has been established, the server can send data to
      // the client by writing to its socket.
      socket.write('Hello, client.');
      this.connectionCount++;

      // The server can also receive data from the client by reading from its socket.
      socket.on('data', function (chunk) {
        console.log(`Data received from client: ${chunk.toString()}`);
      });

      // When the client requests to end the TCP connection with the server, the server
      // ends the connection.

      socket.on('end', () => {
        console.log('Closing connection with the client');
        this.connectionCount--;
      });

      // Don't forget to catch error, for your own sake.

      socket.on('error', err => {
        console.log(`Error: ${err}`);
        this.connectionCount--;
      });
    });
  }

};


