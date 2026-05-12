namespace AdvancedRoadNaming.Domain
{
    public sealed class SegmentDisplaySettings
    {
        public string BaseRouteSeparator { get; set; } = " - ";

        public string RouteNumberSeparator { get; set; } = " / ";

        public bool AllowMultipleRouteNumbers { get; set; } = true;

        public RouteNumberOrderingMode OrderingMode { get; set; } = RouteNumberOrderingMode.InsertionOrder;
    }
}
