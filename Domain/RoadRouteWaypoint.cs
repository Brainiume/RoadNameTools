using Colossal.UI.Binding;
using Unity.Entities;
using Unity.Mathematics;

namespace RoadSignsTools.Domain
{
    public readonly struct RoadRouteWaypoint : IJsonWritable
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

        public void Write(IJsonWriter writer)
        {
            writer.TypeBegin(typeof(RoadRouteWaypoint).FullName);
            writer.PropertyName(nameof(Segment));
            writer.Write(Segment);
            writer.PropertyName(nameof(Position));
            writer.Write(Position);
            writer.PropertyName(nameof(CurvePosition));
            writer.Write(CurvePosition);
            writer.TypeEnd();
        }
    }
}
