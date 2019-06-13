using System;
using System.Linq;
using System.Windows.Forms;
using WindowsDisplayAPI;
using WindowsDisplayAPI.DisplayConfig;
using InTheHand.Graphics.Display;

namespace WUAT {
    internal class Program
    {
        Program()
        {
            Console.WriteLine("Hello World!");
            foreach (var target in PathDisplayTarget.GetDisplayTargets())
            {
                Console.WriteLine("Path: "+target.DevicePath);
                Console.WriteLine("Friendly Name: "+target.FriendlyName);
                Console.WriteLine("Target ID: "+target.TargetId);
                Console.WriteLine("Manufacture ID: "+target.EDIDManufactureId);
                Console.WriteLine("Manufacture Code: "+target.EDIDManufactureCode);
                Console.WriteLine("Product Code: "+target.EDIDProductCode);
            }


            Console.WriteLine("Display Amount: "+ PathDisplayTarget.GetDisplayTargets().Count());
            Console.ReadLine();


        }
        public static void Main(string[] args)
        {
            new Program();
        }
        
    }
    
}