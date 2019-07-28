using System;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using WUAT.Properties;

namespace WUAT
{
    public class ServerConnection //we manage the connection to the WUAT server here. Only the connection however. 
    {
        //Location of server on the network


        //client instance
        private TcpClient client;

        //used to tell the server to try connecting to the server when the computer connects to a new network
        public readonly AutoResetEvent connectionUpdater = new AutoResetEvent(false);


        public ServerConnection()
        {
            //setup network listener so we can see when the employee connects to a new network
            NetworkChange.NetworkAddressChanged +=
                (sender, args) =>
                {
                    connectionUpdater.Set();
                }; //notify the client thread to try connecting again since we're on a new network


            //on init, we make the client and try connecting to the server
            client = new TcpClient();
        }

        //Blocking method that tries to connect to the server. Will not return unless it does. 
        internal void OpenConnection()
        {
            try
            {
                //try connecting, if we fail, print error and try connecting again 
                client = new TcpClient();
                client.Connect(Resources.server_ip, 7250);
                Console.WriteLine("Connected");
                SendData("ID:" + NetworkInterface.GetAllNetworkInterfaces()[0]
                             .GetPhysicalAddress()); //send computer's unique ID
            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace);
                Console.WriteLine("Failed to Connect");
                Console.WriteLine("Retrying in "+Resources.server_failed_connection_retry_delay_ms/1000+" sec");
                if (connectionUpdater.WaitOne( /*10 * 60 * 1000*/Resources.server_failed_connection_retry_delay_ms)
                ) //wait for 10 min or when the network state changes TODO change to 10 min after testing 
                    Console.WriteLine("Network change detected! Retrying...");

                OpenConnection();
            }
        }

        private void CloseConnection()
        {
            client.Close();
            Console.WriteLine("Connection Closed");
            //TODO prob wanna quit here
        }

        internal void SendData(string data)
        {
            if (client == null || !client.Connected) throw new InvalidOperationException("Server isn't connected to!");


            try
            {
                var nwStream = client.GetStream();
                var bytes = Encoding.ASCII.GetBytes(data);
                nwStream.Write(bytes, 0, bytes.Length);
                if(data.Length!=0)
                Console.WriteLine("Sent data: " + data);
            }
            catch (Exception e)
            {
                Console.WriteLine("Failed to send Data!");
                Console.WriteLine(e.StackTrace);
            }
        }

        public bool IsConnected()
        {
            return client.Connected;
        }

        internal TcpClient GetClient()
        {
            return client;
        }

        public void ping()
        {
           SendData("PING");
        }
    }
}