using System.Collections.Generic;
using Colossal.Mathematics;
using Unity.Mathematics;

namespace RoadSignsTools.Domain
{
    public sealed class RouteOverlayStateGeometry
    {
        public readonly List<Bezier4x3> Curves = new List<Bezier4x3>();
        public readonly List<float3> Waypoints = new List<float3>();

        public void Clear()
        {
            Curves.Clear();
            Waypoints.Clear();
        }
    }
}
