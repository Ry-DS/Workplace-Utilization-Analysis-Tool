using System;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows.Forms;
using WindowsDisplayAPI;
using WindowsDisplayAPI.DisplayConfig;
using WUAT.Properties;

namespace WUAT {
    internal class Program
    {
        private readonly ServerConnection _connection;
        private MonitorState state,oldState;
        private bool _active;//default false, says whether the software is authorised by the server to start sending requests. 
        Program()
        {
            Console.WriteLine("WUAT: Employee Software. By Ryan Samarakoon");
            Console.WriteLine("Displaying current monitors:");
            state = CaptureState();
            PrintDisplayInfo();
            Console.WriteLine("Attempting to connect to server...");
            _connection=new ServerConnection();
            _connection.OpenConnection();
            while (true)//main app loop
            {
                //make sure connection remains active
                if (!_connection.IsConnected())
                {
                    Console.WriteLine("Lost connection to server! Reconnecting...");
                    _active = false;
                    _connection.OpenConnection();//blocks everything else, program useless without server connection
                    
                }
                //parse any response from the server
                var ns = _connection.GetClient().GetStream();
                var bufferSize = _connection.GetClient().ReceiveBufferSize;
                if(bufferSize> 0&&ns.DataAvailable){
                    var bytes = new byte[bufferSize];
                    ns.Read(bytes, 0, bufferSize);             
                    var msg = Encoding.ASCII.GetString(bytes).Replace("\0",""); //the message incoming, also remove null char from empty buffer
                    foreach (string cmd in msg.Split('\r'))//\r sent at end of every command in case we get multiple
                    {
                        if(cmd.Length!=0)//check valid command, sometimes it splits with an empty line
                            ExecuteServerInstruction(cmd);
                    }
                    
                }
                if (!state.Equals(oldState)&&state.IsValid()&&_active)
                {
                    oldState = state;
                    _connection.SendData("UPDATE"+state);
                     PrintDisplayInfo();
                }

                if (DateTimeOffset.Now.ToUnixTimeMilliseconds() - state.CaptureTime > Resources.monitor_check_delay_ms&&_active)//check for monitor changes every 10 seconds
                {
                    state = CaptureState();
                    
                    
                }

                
                

                
                
                
                Thread.Sleep(Resources.main_tick_speed_ms);//every second we tick the program to check for monitor updates and server disconnects
                
            }


        }

            private void ExecuteServerInstruction(string msg)
            {    Console.WriteLine("Executing Instruction: "+msg);
                string[] cmds = msg.Split(':');
                
                switch (cmds[0])
                {
                    case "INIT"://called when the server can't recognise the computer and is requesting for it to send over a team name to register with
                        Application.Run(new TeamChooser(cmds.Skip(1).ToArray(),_connection));
                        break;
                    case "SUCCESS":
                        _active = true;
                        break;

                }
            }

            private MonitorState CaptureState()
            {
                string name="", mCode="";
                int code=0, mid=0;
                var list = PathDisplayTarget.GetDisplayTargets().Reverse();
                foreach (var target in list)
                {
                    name = target.FriendlyName;
                    mCode = target.EDIDManufactureCode;
                    mid = target.EDIDManufactureId;
                    code = target.EDIDProductCode;
                    


                }
                return new MonitorState(name,mCode,code,mid,DateTimeOffset.Now.ToUnixTimeMilliseconds());
            }
            private void PrintDisplayInfo()
        {
                Console.WriteLine("Friendly Name: "+state.FriendlyName);
                Console.WriteLine("Manufacture ID: "+state.MId);
                Console.WriteLine("Manufacture Code: "+state.MCode);
                Console.WriteLine("Product Code: "+state.ProductId);
                Console.WriteLine("Display Amount: "+ PathDisplayTarget.GetDisplayTargets().Count());
        }

        public static void Main()
        {
            Application.EnableVisualStyles();
            new Program();

        }
        
        
    }
    
}