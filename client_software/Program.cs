using System;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using WindowsDisplayAPI.DisplayConfig;
using WUAT.Properties;

namespace WUAT
{
    //main class
    internal class Program
    {
        private readonly ServerConnection _connection;

        private readonly bool
            _loggedIn = true; //whether we have authenticated with server

        private readonly long lastPing = DateTimeOffset.Now.ToUnixTimeMilliseconds(); //last ping sent to server
        private readonly MonitorState oldState;
        private readonly MonitorState state;

        private bool
            _active; //whether the server is open to receiving data from us

        private Program()
        {
            //all console writes for debugging, will not appear for final program. 
            Console.WriteLine("WUAT: Employee Software. By Ryan Samarakoon");
            Console.WriteLine("Displaying current monitors:");
            state = CaptureState();
            PrintDisplayInfo();
            Console.WriteLine("Attempting to connect to server...");
            _connection = new ServerConnection();
            _connection.OpenConnection();
            while (true) //main app loop
            {
                //make sure connection remains active
                if (!_connection.IsConnected() && _loggedIn)
                {
                    Console.WriteLine("Lost connection to server!");
                    Console.WriteLine(
                        "Retrying in " + Resources.server_failed_connection_retry_delay_ms / 1000 + " sec");
                    if (!_active) //skip the wait counter if the connection was lost prematurely. 
                        _connection.connectionUpdater.WaitOne(Resources.server_failed_connection_retry_delay_ms);
                    _active = false; //reset to false as we are making a new connection
                    _connection.OpenConnection(); //blocks everything else, program useless without server connection
                }

                if (DateTimeOffset.Now.ToUnixTimeMilliseconds() - lastPing > 3000 && _loggedIn
                ) //ping every 3 sec if logged in
                {
                    _connection.Ping();
                    lastPing = DateTimeOffset.Now.ToUnixTimeMilliseconds();
                }

                //parse any response from the server
                if (_loggedIn && _connection.IsConnected())
                {
                    var ns = _connection.GetClient().GetStream();
                    var bufferSize = _connection.GetClient().ReceiveBufferSize;
                    if (bufferSize > 0 && ns.DataAvailable)
                    {
                        var bytes = new byte[bufferSize];
                        ns.Read(bytes, 0, bufferSize);
                        var msg = Encoding.ASCII.GetString(bytes)
                            .Replace("\0", ""); //the message incoming, also remove null char from empty buffer
                        foreach (var cmd in msg.Split('\r')
                        ) //\r sent at end of every command so we know when a new command starts
                            if (cmd.Length != 0) //check valid command, sometimes it splits with an empty line
                                ExecuteServerInstruction(cmd);
                    }
                }

                //update the state once in awhile, dont' wanna check too fast.
                if (DateTimeOffset.Now.ToUnixTimeMilliseconds() - state.CaptureTime >
                    Resources.monitor_check_delay_ms && _active) //check for monitor changes every 10 seconds
                    state = CaptureState();

                //if the state changed from last time, and the server gave the go, 
                if (!state.Equals(oldState) && state.IsValid() && _active && _loggedIn)
                {
                    //we store the state as the new old
                    oldState = state;
                    //send update to the server
                    _connection.SendData("UPDATE:" + state);
                    PrintDisplayInfo(); //debug print
                }


                if (IdleTimeFinder.GetIdleTime() > Resources.inactivity_delay_ms && _loggedIn) //user is idle
                {
                    Console.WriteLine("Inactivity detected, logging off");
                    _loggedIn = false;
                    oldState = null;
                    //close connection, will put a logout event on server. 
                    _connection.GetClient().Close();
                }
                else if (!_loggedIn && IdleTimeFinder.GetIdleTime() < 5000) //Then we reconnect once we detect activity
                {
                    Console.WriteLine("User returned");
                    _loggedIn = true;
                    //next loop we try connect again
                }


                Thread.Sleep(Resources
                    .main_tick_speed_ms); //every second we tick the program to check for monitor updates and server disconnects
            }
        }

        private void ExecuteServerInstruction(string msg)
        {
            Console.WriteLine("Executing Instruction: " + msg);
            var cmds = msg.Split(':');

            switch (cmds[0])
            {
                case "INIT"
                    : //called when the server can't recognise the computer and is requesting for it to send over a team name to register with
                    Application.Run(new TeamChooser(cmds.Skip(1).ToArray(),
                        _connection)); //open gui so we can ask the employee what team they are in. Backend also provides team names with INIT command
                    break;
                case "SUCCESS"
                    : //called when the server recognises the employee and authorises them to send monitor updates. Also sent after a successful register
                    _active = true;
                    break;
            }
        }

        private MonitorState CaptureState() //returns the monitor currently in use
        {
            string name = "", mCode = "";
            int code = 0, mid = 0;
            var list = PathDisplayTarget.GetDisplayTargets();
            var target = list[list.Length - 1]; //last monitor is the one in use

            name = target.FriendlyName;
            mCode = target.EDIDManufactureCode;
            mid = target.EDIDManufactureId;
            code = target.EDIDProductCode;
            //we also attach the time the snapshot was taken so we know if we need to recheck
            return new MonitorState(name, mCode, code, mid, DateTimeOffset.Now.ToUnixTimeMilliseconds());
        }

        private void PrintDisplayInfo() //debugging print method
        {
            Console.WriteLine("Friendly Name: " + state.FriendlyName);
            Console.WriteLine("Manufacture ID: " + state.MId);
            Console.WriteLine("Manufacture Code: " + state.MCode);
            Console.WriteLine("Product Code: " + state.ProductId);
            Console.WriteLine("Display Amount: " + PathDisplayTarget.GetDisplayTargets().Count());
        }

        public static void Main(string[] args)
        {
            //check if this program is already running
            var lprcTestApp = Process.GetProcessesByName("WUAT");

            if (lprcTestApp.Length > 1) //counting itself
                return; //already running, lets not run
            if (args.Length == 1 && args[0] == "INSTALLER")
            {
                Process.Start(Application.ExecutablePath);
                return;
            } //if the program is starting from the installer, we don't want to halt the thread

            Application.EnableVisualStyles(); //enable GUI support
            new Program();
        }
    }
}