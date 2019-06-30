using System;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace WUAT
{
    public class ServerConnection//we manage the connection to the WUAT server here. Only the connection however. 
    {
        
        
        //Location of server on the network
        private const string HOST = "localhost";
        private const int PORT = 7250;
        
        
        
        //client instance
        private TcpClient client;
            
        //used to tell the server to try connecting to the server when the computer connects to a new network
        private AutoResetEvent connectionUpdater =new AutoResetEvent(false);
        
        

        public ServerConnection()
        {
            //setup network listener so we can see when the employee connects to a new network
            NetworkChange.NetworkAddressChanged += new 
                NetworkAddressChangedEventHandler((sender, args) => { connectionUpdater.Set(); });//notify the client thread to try connecting again since we're on a new network
            
            
            
            //on init, we make the client and try connecting to the server
            client = new TcpClient();
            
            
        }

        //Blocking method that tries to connect to the server. Will not return unless it does. 
        internal void OpenConnection()
        {
            try
            {//try connecting, if we fail, print error and try connecting again 
                client.Connect(HOST, PORT);
                Console.WriteLine("Connected");
                SendData("ID:"+NetworkInterface.GetAllNetworkInterfaces()[0].GetPhysicalAddress());//send computer's unique ID

                

            }
            catch (Exception e)
            {
                Console.WriteLine(e.StackTrace);
                Console.WriteLine("Failed to Connect");
                Console.WriteLine("Retrying in 10 min");
                if(connectionUpdater.WaitOne(/*10 * 60 * 1000*/1000))//wait for 10 min or when the network state changes
                    Console.WriteLine("Network change detected! Retrying...");
                
                OpenConnection();
                
            }
        }
        private void CloseConnection(){
            client.Close();
            Console.WriteLine("Connection Closed");
            //TODO prob wanna quit here
        }

        internal void SendData(string data)
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

        public bool IsConnected()
        {
            return client.Connected;
        }

        internal TcpClient GetClient()
        {
            return client;
        }
    }
   
}