using Game.Tools;
using Game.UI.Localization;
using Game.UI.Tooltip;
using RoadSignsTools.Domain;
using RoadSignsTools.L10N;

namespace RoadSignsTools.Systems
{
    public sealed partial class RoadRouteToolTooltipSystem : TooltipSystemBase
    {
        private ToolSystem _toolSystem;
        private RoadRouteToolSystem _routeTool;
        private StringTooltip _addWaypointTooltip;
        private StringTooltip _moveWaypointTooltip;

        protected override void OnCreate()
        {
            base.OnCreate();
            _toolSystem = World.GetOrCreateSystemManaged<ToolSystem>();
            _routeTool = World.GetOrCreateSystemManaged<RoadRouteToolSystem>();
            _addWaypointTooltip = new StringTooltip
            {
                path = "roadSignsToolsRenameAddWaypoint",
                value = LocalizedString.IdWithFallback(RoadSignsLocalization.UIKeys.RenameToolClickAddWaypointTooltip, "Click to add waypoint"),
                color = TooltipColor.Info
            };
            _moveWaypointTooltip = new StringTooltip
            {
                path = "roadSignsToolsRenameMoveWaypoint",
                value = LocalizedString.IdWithFallback(RoadSignsLocalization.UIKeys.RenameToolDragMoveWaypointTooltip, "Drag to move waypoint"),
                color = TooltipColor.Info
            };
        }

        protected override void OnUpdate()
        {
            if (_toolSystem.activeTool != _routeTool
                || !_routeTool.IsRunning
                || _routeTool.Mode != RoadRouteToolMode.RenameSelectedSegments
                || !_routeTool.HoveredWaypoint.HasValue)
            {
                return;
            }

            AddMouseTooltip(_routeTool.HasHoveredRouteWaypoint || _routeTool.HasActiveMoveEdit
                ? _moveWaypointTooltip
                : _addWaypointTooltip);
        }
    }
}
