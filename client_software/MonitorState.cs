namespace WUAT
{
    public class MonitorState
    {
        private string friendlyName, mCode;
        private int productId, mId;
        private long captureTime;

        public MonitorState(string friendlyName, string mCode, int productId, int mId, long captureTime)
        {
            this.friendlyName = friendlyName;
            this.mCode = mCode;
            this.productId = productId;
            this.mId = mId;
            this.captureTime = captureTime;
        }

        public string FriendlyName => friendlyName;

        public string MCode => mCode;

        public int ProductId => productId;

        public int MId => mId;

        public long CaptureTime => captureTime;
        public override string ToString()
        {
            return friendlyName+":"+mCode+":"+mId+":"+productId;
        }

        protected bool Equals(MonitorState other)
        {
            return string.Equals(friendlyName, other.friendlyName) && string.Equals(mCode, other.mCode) && productId == other.productId && mId == other.mId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((MonitorState) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = (friendlyName != null ? friendlyName.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ (mCode != null ? mCode.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ productId;
                hashCode = (hashCode * 397) ^ mId;
                return hashCode;
            }
        }

        public bool IsValid()
        {
            return productId != 0 && mId != 0;
        }
    }
}