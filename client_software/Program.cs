using System;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows.Forms;
using WindowsDisplayAPI;
using WindowsDisplayAPI.DisplayConfig;

namespace WUAT {
    internal class Program
    {
        private ServerConnection connection;
            Program()
        {
            Console.WriteLine("WUAT: Employee Software. By Ryan Samarakoon");
            Console.WriteLine("Displaying current monitors:");
            PrintDisplayInfo();
            Console.WriteLine("Attempting to connect to server...");
            connection=new ServerConnection();
            connection.OpenConnection();
            while (true)//main app loop
            {
                //make sure connection remains active
                if (!connection.IsConnected())
                {
                    Console.WriteLine("Lost connection to server! Reconnecting...");
                    connection.OpenConnection();//blocks everything else, program useless without server connection
                    
                }
                //parse any response from the server
                var ns = connection.GetClient().GetStream();
                var bufferSize = connection.GetClient().ReceiveBufferSize;
                if(bufferSize> 0&&ns.DataAvailable){
                    var bytes = new byte[bufferSize];
                    ns.Read(bytes, 0, bufferSize);             
                    var msg = Encoding.ASCII.GetString(bytes).Replace("\0",""); //the message incoming, also remove null char from empty buffer
                    
                    MessageBox.Show(msg);//TODO testing remove
                    ExecuteServerInstruction(msg);
                    
                }

                
                
                
                Thread.Sleep(100);//every second we tick the program to check for monitor updates and server disconnects
                
            }


        }

            private void ExecuteServerInstruction(string msg)
            {
                switch (msg.Contains(":")?msg.Split(':')[0]:msg)
                {
                    case "INIT"://called when the server can't recognise the computer and is requesting for it to send over a team name to register with
                        Application.Run(new TeamChooser());
                        break;

                }
            }

            private void PrintDisplayInfo()
        {
            foreach (var target in PathDisplayTarget.GetDisplayTargets())
            {
                Console.WriteLine("Path: "+target.DevicePath);
                Console.WriteLine("Friendly Name: "+target.FriendlyName);
                Console.WriteLine("Target ID: "+target.TargetId);
                Console.WriteLine("Manufacture ID: "+target.EDIDManufactureId);
                Console.WriteLine("Manufacture Code: "+target.EDIDManufactureCode);
                Console.WriteLine("Product Code: "+target.EDIDProductCode);
                Console.WriteLine();
            }


            Console.WriteLine("Display Amount: "+ PathDisplayTarget.GetDisplayTargets().Count());
        }

        public static void Main()
        {
            Application.EnableVisualStyles();
            new Program();

        }
        
    }
    
}