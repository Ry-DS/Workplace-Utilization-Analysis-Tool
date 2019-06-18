using System;
using System.Net.Sockets;
using System.Text;
using System.Threading;

namespace WUAT
{
    public class ServerConnection//we manage the connection to the WUAT server here
    {
        //Location of server on the network
        private const string HOST = "localhost";
        private const int PORT = 7250;
        //client instance
        private TcpClient client;


        public ServerConnection()
        {
            //on init, we make the client and try connecting to the server
            client = new TcpClient();
            OpenConnection(client);
            
        }

        private void OpenConnection(TcpClient client)
        {
            if (client == null)
            {
                throw new NullReferenceException("Need to give initialized client");
                
            }

            try
            {//try connecting, if we fail, print error and try connecting after a second. 
                client.Connect(HOST, PORT);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace);
                Console.WriteLine("Failed to Connect");
                Console.WriteLine("Retrying...");
                Thread.Sleep(1000);
                OpenConnection(client);
                
                
            }
            Console.WriteLine("Connected");
        }
        private void CloseConnection(TcpClient client){
            client.Close();
            Console.WriteLine("Connection Closed");
            //TODO prob wanna quit here
        }

        private void SendData(string data)
        {
            if (client == null || !client.Connected)
            {
                throw new InvalidOperationException("Server isn't connected to!");
            }


            try
            {
                NetworkStream nwStream = client.GetStream();
                byte[] bytes = ASCIIEncoding.ASCII.GetBytes(data);
                nwStream.Write(bytes, 0, bytes.Length);
                Console.WriteLine("Sent data: " + data);
            }
            catch (Exception e)
            {
                Console.WriteLine("Failed to send Data!");
                Console.WriteLine(e.StackTrace);
            }

        }
    }
   
}