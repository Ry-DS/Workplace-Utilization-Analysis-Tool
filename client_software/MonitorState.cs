namespace WUAT
{
    //a Plain Old Object to store the monitor state. Has some equals and hash methods to help compare old monitor states

    public class MonitorState
    {
        public MonitorState(string friendlyName, string mCode, int productId, int mId, long captureTime)
        {
            FriendlyName = friendlyName;
            MCode = mCode;
            ProductId = productId;
            MId = mId;
            CaptureTime = captureTime;
        }

        public string FriendlyName { get; }

        public string MCode { get; }

        public int ProductId { get; }

        public int MId { get; }

        public long CaptureTime { get; }

        public override string ToString()
        {
            return FriendlyName + ":" + MCode + ":" + MId + ":" + ProductId;
        }

        protected bool Equals(MonitorState other)
        {
            return string.Equals(FriendlyName, other.FriendlyName) && string.Equals(MCode, other.MCode) &&
                   ProductId == other.ProductId && MId == other.MId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != GetType()) return false;
            return Equals((MonitorState) obj);
        }

        public override int GetHashCode()
        {
            unchecked
            {
                var hashCode = FriendlyName != null ? FriendlyName.GetHashCode() : 0;
                hashCode = (hashCode * 397) ^ (MCode != null ? MCode.GetHashCode() : 0);
                hashCode = (hashCode * 397) ^ ProductId;
                hashCode = (hashCode * 397) ^ MId;
                return hashCode;
            }
        }

        public bool IsValid()
        {
            return ProductId != 0 || MId != 0;
        }
    }
}