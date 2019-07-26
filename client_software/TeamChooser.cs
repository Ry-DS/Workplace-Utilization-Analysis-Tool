using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace WUAT
{
    public partial class TeamChooser : Form
    {
        private readonly ServerConnection _connection;
        private string response;
        public TeamChooser(string[] teams, ServerConnection connection)
        {
            _connection = connection;
            InitializeComponent();
            foreach (string teamName in teams)
            {
                
                teamBox.Items.Add(teamName);
            }
           
           
        }


        private void SubmitBtn_Click(object sender, System.EventArgs e)
        {
            response = (string) teamBox.SelectedItem;
            Close();
            
            
        }

        protected override void OnFormClosing(FormClosingEventArgs e)
        {

            if (response != null)
            {
                _connection.SendData("REGISTER:"+response);
                return;
            }
            e.Cancel = true;
            base.OnFormClosing(e);
            
        }

        
    }
}