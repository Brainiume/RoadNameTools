using System.Collections.Generic;
using Unity.Entities;

namespace RoadSignsTools.Domain
{
    public sealed class SavedRouteRecord
    {
        public long RouteId { get; set; }
        public string DisplayTitle { get; set; }
        public RoadRouteToolMode Mode { get; set; }
        public string BaseInputValue { get; set; }
        public string RouteCode { get; set; }
        public string RoutePrefixType { get; set; }
        public RouteNumberPlacement RouteNumberPlacement { get; set; } = RouteNumberPlacement.AfterBaseName;
        public long CreatedAtUtcTicks { get; set; }
        public long UpdatedAtUtcTicks { get; set; }
        public long LastAppliedUtcTicks { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsUserDefinedTitle { get; set; }
        public string Notes { get; set; }
        public string StartDistrictName { get; set; }
        public string EndDistrictName { get; set; }
        public string StartRoadName { get; set; }
        public string EndRoadName { get; set; }
        public string DerivedDisplayCorridor { get; set; }
        public string DistrictSummary { get; set; }
        public Entity StartAnchorSegment { get; set; }
        public Entity EndAnchorSegment { get; set; }
        public float StartAnchorCurvePosition { get; set; }
        public float EndAnchorCurvePosition { get; set; }
        public float StartAnchorPositionX { get; set; }
        public float StartAnchorPositionY { get; set; }
        public float StartAnchorPositionZ { get; set; }
        public float EndAnchorPositionX { get; set; }
        public float EndAnchorPositionY { get; set; }
        public float EndAnchorPositionZ { get; set; }
        public int LastKnownResolvedSegmentCount { get; set; }
        public readonly List<RoadRouteWaypoint> Waypoints = new List<RoadRouteWaypoint>();
        public readonly List<Entity> OrderedSegmentIds = new List<Entity>();
        public readonly List<string> OriginalStreetNamesSnapshot = new List<string>();

        public int SegmentCount => OrderedSegmentIds.Count;

        public int WaypointCount => Waypoints.Count;
    }
}
