using System;
using System.Linq;
using System.Windows.Forms;
using Windows.Devices.Bluetooth.Advertisement;
using WindowsDisplayAPI;
using WindowsDisplayAPI.DisplayConfig;
using InTheHand.Graphics.Display;

namespace WUAT {
    internal class Program
    {
        Program()
        {

            foreach (var target in PathDisplayTarget.GetDisplayTargets())
            {
                Console.WriteLine(target.DevicePath);
                Console.WriteLine(target.FriendlyName);
                Console.WriteLine(target.TargetId);
                
            }
            Console.WriteLine("Hello World!");
            Console.WriteLine(PathDisplayTarget.GetDisplayTargets().Count());
           
        }
        public static void Main(string[] args)
        {
            new Program();
        }
        
    }
    
}