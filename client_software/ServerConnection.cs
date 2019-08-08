using System;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using WUAT.Properties;

namespace WUAT
{
    public class ServerConnection //we manage the connection to the WUAT server here. Only the connection however. 
    {
        //used as a sleep function to either wait to reconnect to the server or retry immediately if a network change is detected
        public readonly AutoResetEvent connectionUpdater = new AutoResetEvent(false);


        //client instance
        private TcpClient client;


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
                Console.WriteLine("Retrying in " + Resources.server_failed_connection_retry_delay_ms / 1000 + " sec");
                if (connectionUpdater.WaitOne(Resources.server_failed_connection_retry_delay_ms)
                ) //wait for 10 min or when the network state changes
                    Console.WriteLine("Network change detected! Retrying...");

                OpenConnection();
            }
        }

        private void CloseConnection()
        {
            client.Close();
            Console.WriteLine("Connection Closed");
            //TODO may want to quit here, but for now this method is never used
        }

        internal void SendData(string data) //send data to backend
        {
            if (client == null || !client.Connected) throw new InvalidOperationException("Server isn't connected to!");


            try
            {
                var nwStream = client.GetStream();
                var bytes = Encoding.ASCII.GetBytes(data);
                nwStream.Write(bytes, 0, bytes.Length);
                if (data.Length != 0 && !data.Equals("PING")
                ) //no point logging a ping command for debugging, pollutes console
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

        public void Ping() //ping the server. Keeps connection active and lets program be alerted on disconnects
        {
            SendData("PING");
        }
    }
}