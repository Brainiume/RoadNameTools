using Colossal.Mathematics;
using Game;
using Game.Rendering;
using Unity.Entities;
using Unity.Mathematics;
using UnityEngine;

namespace AdvancedRoadNaming.Systems
{
    public sealed partial class RoadRouteHighlightSystem : GameSystemBase
    {
        private static readonly float2 RoundedLine = new float2(0f, 1f);

        private const float RouteWidth = 4.8f;
        private const float SavedRouteWidth = 4.4f;
        private const float PreviewWidth = 4.1f;
        private const float HoverWidth = 3.8f;
        private const float WaypointRadius = 8.6f;
        private const float SavedWaypointRadius = 7.8f;
        private const float WaypointHaloRadius = 13.8f;
        private const float SavedWaypointHaloRadius = 12.4f;

        private static readonly Color RouteColor = new Color(0.22f, 0.86f, 0.12f, 0.78f);
        private static readonly Color SavedRouteColor = new Color(0.22f, 0.86f, 0.12f, 0.64f);
        private static readonly Color PreviewColor = new Color(0.32f, 0.9f, 0.18f, 0.46f);
        private static readonly Color HoverColor = new Color(0.42f, 0.94f, 0.28f, 0.28f);
        private static readonly Color WaypointColor = new Color(0.18f, 0.84f, 0.1f, 0.9f);
        private static readonly Color SavedWaypointColor = new Color(0.18f, 0.84f, 0.1f, 0.74f);
        private static readonly Color WaypointHaloColor = new Color(0.92f, 1f, 0.9f, 0.24f);
        private static readonly Color SavedWaypointHaloColor = new Color(0.92f, 1f, 0.9f, 0.16f);

        private RoadRouteToolSystem _toolSystem;
        private RoadRouteOverlayGeometrySystem _geometrySystem;
        private OverlayRenderSystem _overlayRenderSystem;

        protected override void OnCreate()
        {
            base.OnCreate();
            _toolSystem = World.GetOrCreateSystemManaged<RoadRouteToolSystem>();
            _geometrySystem = World.GetOrCreateSystemManaged<RoadRouteOverlayGeometrySystem>();
            _overlayRenderSystem = World.GetOrCreateSystemManaged<OverlayRenderSystem>();
        }

        protected override void OnUpdate()
        {
            if (_toolSystem == null || !_toolSystem.IsRunning || _overlayRenderSystem == null || _geometrySystem == null)
                return;

            var buffer = _overlayRenderSystem.GetBuffer(out var renderBufferJobHandle);
            renderBufferJobHandle.Complete();

            DrawGeometry(buffer, _geometrySystem.SavedRouteCurves, SavedRouteColor, SavedRouteWidth);
            DrawNodes(buffer, _geometrySystem.SavedRouteNodes, SavedWaypointHaloColor, SavedWaypointHaloRadius);
            DrawNodes(buffer, _geometrySystem.SavedRouteNodes, SavedWaypointColor, SavedWaypointRadius);
            DrawGeometry(buffer, _geometrySystem.ActiveCurves, RouteColor, RouteWidth);
            DrawNodes(buffer, _geometrySystem.ActiveNodes, WaypointHaloColor, WaypointHaloRadius);
            DrawNodes(buffer, _geometrySystem.ActiveNodes, WaypointColor, WaypointRadius);
            DrawGeometry(buffer, _geometrySystem.PreviewCurves, PreviewColor, PreviewWidth);
            DrawNodes(buffer, _geometrySystem.PreviewNodes, WaypointHaloColor, WaypointHaloRadius);
            DrawNodes(buffer, _geometrySystem.PreviewNodes, WaypointColor, WaypointRadius);
            DrawGeometry(buffer, _geometrySystem.HoverCurves, HoverColor, HoverWidth);
        }

        private static void DrawGeometry(OverlayRenderSystem.Buffer buffer, System.Collections.Generic.IReadOnlyList<Bezier4x3> curves, Color lineColor, float lineWidth)
        {
            if (curves == null)
                return;

            for (var i = 0; i < curves.Count; i++)
                buffer.DrawCurve(lineColor, curves[i], lineWidth, RoundedLine);
        }

        private static void DrawNodes(OverlayRenderSystem.Buffer buffer, System.Collections.Generic.IReadOnlyList<float3> nodes, Color color, float radius)
        {
            if (nodes == null)
                return;

            for (var i = 0; i < nodes.Count; i++)
                buffer.DrawCircle(color, nodes[i], radius);
        }
    }
}
