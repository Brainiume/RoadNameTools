using System.Collections.Generic;
using Colossal.Mathematics;
using Game;
using AdvancedRoadNaming.Domain;
using AdvancedRoadNaming.Services;
using Unity.Entities;
using Unity.Mathematics;

namespace AdvancedRoadNaming.Systems
{
    public sealed partial class RoadRouteOverlayGeometrySystem : GameSystemBase
    {
        private readonly List<Bezier4x3> _activeCurves = new List<Bezier4x3>();
        private readonly List<float3> _activeNodes = new List<float3>();
        private readonly List<Bezier4x3> _previewCurves = new List<Bezier4x3>();
        private readonly List<float3> _previewNodes = new List<float3>();
        private readonly List<Bezier4x3> _savedRouteCurves = new List<Bezier4x3>();
        private readonly List<float3> _savedRouteNodes = new List<float3>();
        private readonly List<Bezier4x3> _hoverCurves = new List<Bezier4x3>();

        private RoadRouteToolSystem _toolSystem;

        public IReadOnlyList<Bezier4x3> ActiveCurves => _activeCurves;
        public IReadOnlyList<float3> ActiveNodes => _activeNodes;
        public IReadOnlyList<Bezier4x3> PreviewCurves => _previewCurves;
        public IReadOnlyList<float3> PreviewNodes => _previewNodes;
        public IReadOnlyList<Bezier4x3> SavedRouteCurves => _savedRouteCurves;
        public IReadOnlyList<float3> SavedRouteNodes => _savedRouteNodes;
        public IReadOnlyList<Bezier4x3> HoverCurves => _hoverCurves;

        protected override void OnCreate()
        {
            base.OnCreate();
            _toolSystem = World.GetOrCreateSystemManaged<RoadRouteToolSystem>();
        }

        protected override void OnUpdate()
        {
            if (_toolSystem == null || !_toolSystem.IsRunning)
            {
                ClearAll();
                return;
            }

            RouteOverlayGeometryBuilder.BuildRouteGeometry(EntityManager, _toolSystem.SavedRoutePreviewSegments, _toolSystem.SavedRoutePreviewWaypoints, _savedRouteCurves, _savedRouteNodes);
            RouteOverlayGeometryBuilder.BuildRouteGeometry(EntityManager, _toolSystem.SelectedSegments, _toolSystem.Waypoints, _activeCurves, _activeNodes);
            HideActiveWaypointBeingMoved();

            BuildPreviewGeometry();
            BuildHoverGeometry();
        }

        private void HideActiveWaypointBeingMoved()
        {
            if (!_toolSystem.HasActiveMoveEdit)
                return;

            var activeEditIndex = _toolSystem.ActiveEditIndex;
            if (activeEditIndex < 0 || activeEditIndex >= _activeNodes.Count)
                return;

            _activeNodes.RemoveAt(activeEditIndex);
        }

        private void BuildPreviewGeometry()
        {
            _previewCurves.Clear();
            _previewNodes.Clear();

            var previewSegments = _toolSystem.PreviewSegments;
            if (previewSegments == null || previewSegments.Count == 0)
                return;

            RouteOverlayGeometryBuilder.BuildRouteGeometry(EntityManager, previewSegments, _toolSystem.PreviewWaypoints, _previewCurves, _previewNodes);
        }

        private void BuildHoverGeometry()
        {
            _hoverCurves.Clear();
            if (_toolSystem.HoveredSegment == Entity.Null)
                return;

            var previewSegments = _toolSystem.PreviewSegments;
            if (previewSegments != null && previewSegments.Count > 0)
                return;

            RouteOverlayGeometryBuilder.BuildHoverGeometry(EntityManager, _toolSystem.HoveredSegment, _hoverCurves);
        }

        private void ClearAll()
        {
            _activeCurves.Clear();
            _activeNodes.Clear();
            _previewCurves.Clear();
            _previewNodes.Clear();
            _savedRouteCurves.Clear();
            _savedRouteNodes.Clear();
            _hoverCurves.Clear();
        }
    }
}
