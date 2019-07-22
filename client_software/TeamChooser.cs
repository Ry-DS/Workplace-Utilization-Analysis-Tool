using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace WUAT
{
    public partial class TeamChooser : Form
    {
        public TeamChooser()
        {
            InitializeComponent();
            teamBox.Items.Add("hello");
            teamBox.Items.Add("world");
        }

        private void SubmitBtn_Click(object sender, System.EventArgs e)
        {

        }
    }
}