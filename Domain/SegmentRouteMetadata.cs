using System;
using System.Collections.Generic;
using Unity.Entities;

namespace AdvancedRoadNaming.Domain
{
    public sealed class SegmentRouteMetadata
    {
        public SegmentRouteMetadata(Entity segmentEntity)
        {
            SegmentEntity = segmentEntity;
            RouteNumbers = new List<string>();
            LastModifiedUtcTicks = DateTime.UtcNow.Ticks;
        }

        public Entity SegmentEntity { get; }

        public string BaseNameSnapshot { get; set; }

        public string OptionalCustomRoadName { get; set; }

        public List<string> RouteNumbers { get; }

        public RouteNumberPlacement RouteNumberPlacement { get; set; } = RouteNumberPlacement.AfterBaseName;

        public long LastModifiedUtcTicks { get; set; }

        public int Flags { get; set; }

        public void Touch()
        {
            LastModifiedUtcTicks = DateTime.UtcNow.Ticks;
        }
    }
}
