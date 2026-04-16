using Unity.Entities;
using Unity.Mathematics;

namespace RoadSignsTools.Domain
{
    public readonly struct RoadRouteWaypoint
    {
        public RoadRouteWaypoint(Entity segment, float3 position, float curvePosition)
        {
            Segment = segment;
            Position = position;
            CurvePosition = curvePosition;
        }

        public Entity Segment { get; }

        public float3 Position { get; }

        public float CurvePosition { get; }
    }
}