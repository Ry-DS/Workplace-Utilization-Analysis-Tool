using System;
using System.Linq;
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
            while (true)
            {

                if (!connection.IsConnected())
                {
                    Console.WriteLine("Lost connection to server! Reconnecting...");
                    connection.OpenConnection();//blocks everything else, program useless without server connection
                    
                }
                
                
                Thread.Sleep(1000);//every second we tick the program to check for monitor updates and server disconnects
                
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
            Application.Run(new TeamChooser());
            
        }
        
    }
    
}