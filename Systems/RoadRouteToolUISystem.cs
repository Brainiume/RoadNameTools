using System;
using Colossal.UI.Binding;
using Game;
using Game.SceneFlow;
using Game.Tools;
using Game.UI;
using RoadSignsTools.Domain;

namespace RoadSignsTools.Systems
{
    public sealed partial class RoadRouteToolUISystem : UISystemBase
    {
        private const string PanelBindingGroup = "roadSignsTools";
        private const string NativeUiGroup = "RoadSignsTools";

        private RoadRouteToolSystem _toolSystem;
        private ToolSystem _gameToolSystem;
        private DefaultToolSystem _defaultToolSystem;
        private ValueBinding<string> _stateBinding;
        private ValueBinding<bool> _panelOpenBinding;
        private ValueBinding<bool> _inGameBinding;
        private ValueBinding<bool> _showLauncherBinding;
        private string _lastState;
        private bool _panelVisible;
        private bool _lastGameplayAvailable;
        private bool _lastPanelOpen;
        private bool _lastInGameBinding;
        private bool _lastShowLauncher;
        private bool _launcherSettingSuppressedLogShown;

        protected override void OnCreate()
        {
            base.OnCreate();
            _toolSystem = World.GetOrCreateSystemManaged<RoadRouteToolSystem>();
            _gameToolSystem = World.GetOrCreateSystemManaged<ToolSystem>();
            _defaultToolSystem = World.GetOrCreateSystemManaged<DefaultToolSystem>();

            _lastState = BuildClosedState(false, true);
            _stateBinding = new ValueBinding<string>(PanelBindingGroup, "state", _lastState, ValueWriters.Create<string>(), System.Collections.Generic.EqualityComparer<string>.Default);
            _panelOpenBinding = new ValueBinding<bool>(NativeUiGroup, "BINDING:PANEL_OPEN", false, ValueWriters.Create<bool>(), System.Collections.Generic.EqualityComparer<bool>.Default);
            _inGameBinding = new ValueBinding<bool>(NativeUiGroup, "BINDING:IN_GAME", false, ValueWriters.Create<bool>(), System.Collections.Generic.EqualityComparer<bool>.Default);
            _showLauncherBinding = new ValueBinding<bool>(NativeUiGroup, "BINDING:SHOW_LAUNCHER", true, ValueWriters.Create<bool>(), System.Collections.Generic.EqualityComparer<bool>.Default);

            AddBinding(_stateBinding);
            AddBinding(_panelOpenBinding);
            AddBinding(_inGameBinding);
            AddBinding(_showLauncherBinding);
            AddBinding(new TriggerBinding<bool>(NativeUiGroup, "TRIGGER:PANEL_OPEN", SetPanelOpen, ValueReaders.Create<bool>()));

            AddBinding(new TriggerBinding(PanelBindingGroup, "togglePanel", TogglePanel));
            AddBinding(new TriggerBinding(PanelBindingGroup, "activate", ActivateTool));
            AddBinding(new TriggerBinding(PanelBindingGroup, "showSavedRoutes", ShowSavedRoutes));
            AddBinding(new TriggerBinding(PanelBindingGroup, "cancel", CancelTool));
            AddBinding(new TriggerBinding(PanelBindingGroup, "apply", Apply));
            AddBinding(new TriggerBinding(PanelBindingGroup, "clear", Clear));
            AddBinding(new TriggerBinding(PanelBindingGroup, "removeLast", RemoveLast));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "previewRoute", PreviewRoute, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "reapplyRoute", ReapplyRoute, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "deleteRoute", DeleteRoute, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "rebuildRoute", RebuildRoute, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "modifyRoute", ModifyRoute, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "editRouteRoadNames", EditRouteRoadNames, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding(PanelBindingGroup, "returnToSavedRoutes", ReturnToSavedRoutes));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "acceptRouteReview", AcceptRouteReview, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "cancelRouteReview", CancelRouteReview, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "renameRoute", RenameRoute, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "updateRouteInput", UpdateRouteInput, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "setMode", SetMode, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "setInput", SetInput, ValueReaders.Create<string>()));
            AddBinding(new TriggerBinding<string>(PanelBindingGroup, "setRouteNumberPlacement", SetRouteNumberPlacement, ValueReaders.Create<string>()));
            Mod.log.Info("RoadRouteToolUISystem bindings registered");
        }

        protected override void OnUpdate()
        {
            var gameplayAvailable = IsGameplayUiContextAvailable();

            if (_lastGameplayAvailable != gameplayAvailable)
            {
                Mod.log.Info(gameplayAvailable
                    ? "Road Naming: gameplay UI context detected."
                    : "Road Naming: gameplay UI context lost.");
                _lastGameplayAvailable = gameplayAvailable;
            }

            var showLauncher = gameplayAvailable && ShouldShowLauncher();
            SyncNativeLauncherBindings(gameplayAvailable, showLauncher);

            var state = gameplayAvailable && _panelVisible
                ? BuildState(gameplayAvailable, showLauncher)
                : BuildClosedState(gameplayAvailable, showLauncher);
            if (state != _lastState)
            {
                _lastState = state;
                _stateBinding.Update(state);
            }
        }

        private void SetPanelOpen(bool value)
        {
            Mod.log.Info($"Road Naming: native launcher requested panel open={value}.");
            if (value)
                ActivateTool();
            else
                CancelTool();
        }

        private void TogglePanel()
        {
            if (!IsGameplayUiContextAvailable())
            {
                Mod.log.Warn("Road Naming: launcher click ignored because gameplay context is not available.");
                return;
            }

            Mod.log.Info("Road Naming: launcher clicked.");
            if (_panelVisible)
                CancelTool();
            else
                ActivateTool();
        }

        private void ActivateTool()
        {
            if (!CanUseRouteTool())
            {
                Mod.log.Warn("Road Naming: activation skipped because the gameplay tool systems are not available.");
                return;
            }

            try
            {
                _gameToolSystem.activeTool = _toolSystem;
                _toolSystem?.SetSavedRoutesViewActive(false);
                _panelVisible = true;
                _panelOpenBinding.Update(true);
                _lastPanelOpen = true;
                Mod.log.Info("Road Naming: panel/tool opened from launcher.");
            }
            catch (Exception ex)
            {
                Mod.log.Error(ex, "Failed to activate Road Naming: route tool.");
            }
        }

        private void ShowSavedRoutes()
        {
            if (!CanUseRouteTool())
            {
                Mod.log.Warn("Road Naming: saved routes view skipped because the gameplay tool systems are not available.");
                return;
            }

            try
            {
                _gameToolSystem.activeTool = _toolSystem;
                _toolSystem?.SetSavedRoutesViewActive(true);
                _panelVisible = true;
                _panelOpenBinding.Update(true);
                _lastPanelOpen = true;
                Mod.log.Info("Road Naming: saved routes panel opened with route creation input suspended.");
            }
            catch (Exception ex)
            {
                Mod.log.Error(ex, "Failed to show Saved Routes while keeping the gameplay route tool available.");
            }
        }

        private void CancelTool()
        {
            try
            {
                _toolSystem?.SetSavedRoutesViewActive(false);
                _toolSystem?.ClearSelection();

                if (_gameToolSystem != null && _defaultToolSystem != null && IsToolOpen())
                    _gameToolSystem.activeTool = _defaultToolSystem;

                _panelVisible = false;
                _panelOpenBinding.Update(false);
                _lastPanelOpen = false;
                Mod.log.Info("Road Naming: panel/tool closed.");
            }
            catch (Exception ex)
            {
                Mod.log.Error(ex, "Failed to cancel Road Naming: route tool.");
            }
        }

        private void Apply()
        {
            if (!IsGameplayContextAvailable())
            {
                Mod.log.Warn("Road Naming: Apply ignored because gameplay context is unavailable.");
                return;
            }

            var segmentCount = _toolSystem?.SelectedSegments?.Count ?? 0;
            Mod.log.Info($"Road Naming: Apply clicked. Mode={_toolSystem?.Mode}, Input='{_toolSystem?.InputText ?? string.Empty}', CommittedSegments={segmentCount}.");
            _toolSystem?.Apply();
        }

        private void Clear()
        {
            Mod.log.Info("Road Naming: Clear clicked.");
            _toolSystem?.ClearSelection();
        }

        private void RemoveLast()
        {
            Mod.log.Info("Road Naming: Undo Waypoint clicked.");
            _toolSystem?.RemoveLastSegment();
        }

        private void PreviewRoute(string routeId)
        {
            Mod.log.Info($"Road Naming: saved route Preview clicked. RouteId={routeId}.");
            if (TryParseRouteId(routeId, out var id))
                _toolSystem?.PreviewSavedRoute(id);
        }

        private void ReapplyRoute(string routeId)
        {
            Mod.log.Info($"Road Naming: saved route Reapply clicked. RouteId={routeId}.");
            if (TryParseRouteId(routeId, out var id))
                _toolSystem?.ReapplySavedRoute(id);
        }

        private void DeleteRoute(string routeId)
        {
            Mod.log.Info($"Road Naming: saved route Delete clicked. RouteId={routeId}.");
            if (TryParseRouteId(routeId, out var id))
                _toolSystem?.DeleteSavedRoute(id);
        }

        private void RebuildRoute(string routeId)
        {
            Mod.log.Info($"Road Naming: saved route Rebuild clicked. RouteId={routeId}.");
            if (TryParseRouteId(routeId, out var id))
                _toolSystem?.BeginRebuildSavedRoute(id);
        }

        private void ModifyRoute(string routeId)
        {
            Mod.log.Info($"Road Naming: saved route Modify clicked. RouteId={routeId}.");
            if (TryParseRouteId(routeId, out var id))
                _toolSystem?.BeginModifySavedRoute(id);
        }

        private void EditRouteRoadNames(string routeId)
        {
            Mod.log.Info($"Road Naming: saved route Edit Roads clicked. RouteId={routeId}.");
            if (TryParseRouteId(routeId, out var id))
            {
                if (_toolSystem?.BeginSavedRouteRoadNameEdit(id) == true && _gameToolSystem != null && _defaultToolSystem != null)
                    _gameToolSystem.activeTool = _defaultToolSystem;
            }
        }

        private void ReturnToSavedRoutes()
        {
            Mod.log.Info("Road Naming: Return To Saved Routes clicked.");
            if (_toolSystem?.ReturnToSavedRoutesFromRoadNameEdit() == true && _gameToolSystem != null)
                _gameToolSystem.activeTool = _toolSystem;
        }

        private void AcceptRouteReview(string routeId)
        {
            Mod.log.Info($"Road Naming: saved route review Accept clicked. RouteId={routeId}.");
            if (TryParseRouteId(routeId, out var id))
                _toolSystem?.AcceptSavedRouteReview(id);
        }

        private void CancelRouteReview(string routeId)
        {
            Mod.log.Info($"Road Naming: saved route review Cancel clicked. RouteId={routeId}.");
            if (TryParseRouteId(routeId, out var id))
                _toolSystem?.CancelSavedRouteReview(id);
        }

        private void RenameRoute(string payload)
        {
            Mod.log.Info($"Road Naming: saved route Rename clicked. Payload='{payload ?? string.Empty}'.");
            var separator = (payload ?? string.Empty).IndexOf('|');
            if (separator <= 0)
                return;

            if (TryParseRouteId(payload.Substring(0, separator), out var id))
                _toolSystem?.RenameSavedRoute(id, payload.Substring(separator + 1));
        }

        private void UpdateRouteInput(string payload)
        {
            Mod.log.Info($"Road Naming: saved route Update Input clicked. Payload='{payload ?? string.Empty}'.");
            var separator = (payload ?? string.Empty).IndexOf('|');
            if (separator <= 0)
                return;

            if (TryParseRouteId(payload.Substring(0, separator), out var id))
                _toolSystem?.UpdateSavedRouteInput(id, payload.Substring(separator + 1));
        }

        private static bool TryParseRouteId(string value, out long routeId)
        {
            return long.TryParse(value ?? string.Empty, System.Globalization.NumberStyles.Integer, System.Globalization.CultureInfo.InvariantCulture, out routeId);
        }

        private void SetMode(string mode)
        {
            Mod.log.Info($"Road Naming: SetMode received. Mode='{mode ?? string.Empty}'.");
            if (_toolSystem == null)
                return;

            if (string.Equals(mode, "rename", StringComparison.OrdinalIgnoreCase))
                _toolSystem.SetMode(RoadRouteToolMode.RenameSelectedSegments);
            else if (string.Equals(mode, "remove", StringComparison.OrdinalIgnoreCase))
                _toolSystem.SetMode(RoadRouteToolMode.RemoveMajorRouteNumber);
            else
                _toolSystem.SetMode(RoadRouteToolMode.AssignMajorRouteNumber);
        }

        private void SetInput(string value)
        {
            Mod.log.Info($"Road Naming: SetInput received. Value='{value ?? string.Empty}'.");
            _toolSystem?.SetInputText(value);
        }

        private void SetRouteNumberPlacement(string value)
        {
            Mod.log.Info($"Road Naming: SetRouteNumberPlacement received. Value='{value ?? string.Empty}'.");
            var placement = string.Equals(value, RouteNumberPlacement.BeforeBaseName.ToString(), StringComparison.OrdinalIgnoreCase)
                ? RouteNumberPlacement.BeforeBaseName
                : RouteNumberPlacement.AfterBaseName;
            _toolSystem?.SetRouteNumberPlacement(placement);
        }

        private string BuildState(bool gameplayAvailable, bool showLauncher)
        {
            try
            {
                var selectedCount = _toolSystem?.SelectedSegments?.Count ?? 0;
                var waypointCount = _toolSystem?.WaypointCount ?? 0;
                var hover = _toolSystem == null || _toolSystem.HoveredSegment == Unity.Entities.Entity.Null
                    ? "none"
                    : _toolSystem.HoveredSegment.Index.ToString(System.Globalization.CultureInfo.InvariantCulture);
                var savedRoutesJson = "[]";

                try
                {
                    savedRoutesJson = _toolSystem?.SavedRoutesJson ?? "[]";
                }
                catch (Exception ex)
                {
                    Mod.log.Warn($"Road Naming: Saved Routes JSON build failed during UI state update. Error='{ex.Message}'.");
                }

                return string.Join("|", new[]
                {
                    Escape("1"),
                    Escape((_toolSystem?.Mode ?? RoadRouteToolMode.AssignMajorRouteNumber).ToString()),
                    Escape(_toolSystem?.InputText ?? string.Empty),
                    Escape(selectedCount.ToString(System.Globalization.CultureInfo.InvariantCulture)),
                    Escape(hover),
                    Escape(gameplayAvailable ? _toolSystem?.BuildPreviewText() ?? string.Empty : string.Empty),
                    Escape(gameplayAvailable ? _toolSystem?.StatusMessage ?? string.Empty : string.Empty),
                    Escape(showLauncher ? "1" : "0"),
                    Escape(gameplayAvailable ? "1" : "0"),
                    Escape(waypointCount.ToString(System.Globalization.CultureInfo.InvariantCulture)),
                    Escape(savedRoutesJson),
                    Escape(_toolSystem?.SavedRouteReview != null ? _toolSystem.SavedRouteReview.RouteId.ToString(System.Globalization.CultureInfo.InvariantCulture) : "0"),
                    Escape(_toolSystem?.SavedRouteReview != null ? _toolSystem.SavedRouteReview.Mode.ToString() : "None"),
                    Escape(_toolSystem?.SavedRouteReview != null && _toolSystem.SavedRouteReview.IsDirty ? "1" : "0"),
                    Escape((_toolSystem?.ReviewSegmentCount ?? 0).ToString(System.Globalization.CultureInfo.InvariantCulture)),
                    Escape((_toolSystem?.ReviewWaypointCount ?? 0).ToString(System.Globalization.CultureInfo.InvariantCulture)),
                    Escape(_toolSystem?.SavedRouteReview != null ? _toolSystem.SavedRouteReview.Message ?? string.Empty : string.Empty),
                    Escape((_toolSystem?.RouteNumberPlacement ?? RouteNumberPlacement.AfterBaseName).ToString()),
                    Escape((_toolSystem?.RoadNameEditRouteId ?? 0).ToString(System.Globalization.CultureInfo.InvariantCulture))
                });
            }
            catch (Exception ex)
            {
                Mod.log.Warn($"Road Naming: UI state build failed; using last known state. Error='{ex.Message}'.");
                return _lastState ?? BuildClosedState(false, true);
            }
        }

        private static string BuildClosedState(bool gameplayAvailable, bool showLauncher)
        {
            return string.Join("|", new[]
            {
                Escape("0"),
                Escape(RoadRouteToolMode.AssignMajorRouteNumber.ToString()),
                Escape(string.Empty),
                Escape("0"),
                Escape("none"),
                Escape(string.Empty),
                Escape(string.Empty),
                Escape(showLauncher ? "1" : "0"),
                Escape(gameplayAvailable ? "1" : "0"),
                Escape("0"),
                Escape("[]"),
                Escape("0"),
                Escape("None"),
                Escape("0"),
                Escape("0"),
                Escape("0"),
                Escape(string.Empty),
                Escape(RouteNumberPlacement.AfterBaseName.ToString()),
                Escape("0")
            });
        }

        private void SyncNativeLauncherBindings(bool gameplayAvailable, bool showLauncher)
        {
            var panelOpen = gameplayAvailable && _panelVisible;

            if (panelOpen != _lastPanelOpen)
            {
                _panelOpenBinding.Update(panelOpen);
                _lastPanelOpen = panelOpen;
            }

            if (gameplayAvailable != _lastInGameBinding)
            {
                _inGameBinding.Update(gameplayAvailable);
                _lastInGameBinding = gameplayAvailable;
                Mod.log.Info($"Road Naming: native launcher IN_GAME binding updated to {gameplayAvailable}.");
            }

            if (showLauncher != _lastShowLauncher)
            {
                _showLauncherBinding.Update(showLauncher);
                _lastShowLauncher = showLauncher;
                Mod.log.Info($"Road Naming: native launcher SHOW_LAUNCHER binding updated to {showLauncher}.");
            }
        }

        private bool IsToolOpen()
        {
            try
            {
                return _gameToolSystem != null && _toolSystem != null && ReferenceEquals(_gameToolSystem.activeTool, _toolSystem);
            }
            catch (Exception ex)
            {
                Mod.log.Warn(ex, "Road Naming: could not read the active tool state; treating panel as closed.");
                return false;
            }
        }

        private bool ShouldShowLauncher()
        {
            if (Mod.Settings == null || Mod.Settings.ShowTopLeftLauncherButton)
                return true;

            if (!_launcherSettingSuppressedLogShown)
            {
                _launcherSettingSuppressedLogShown = true;
                Mod.log.Warn("Road Naming: launcher setting is disabled, but the native launcher is being shown for the recovery build so the panel is not stranded.");
            }

            return true;
        }

        private bool IsGameplayContextAvailable()
        {
            return IsGameplayUiContextAvailable() && CanUseRouteTool();
        }

        private bool CanUseRouteTool()
        {
            try
            {
                if (!IsGameplayUiContextAvailable())
                    return false;

                if (_toolSystem == null || _gameToolSystem == null || _defaultToolSystem == null)
                {
                    Mod.log.Warn("Road Naming: route tool systems are not ready.");
                    return false;
                }

                return true;
            }
            catch (Exception ex)
            {
                Mod.log.Warn(ex, "Road Naming: route tool availability check failed.");
                return false;
            }
        }

        private bool IsGameplayUiContextAvailable()
        {
            try
            {
                var gameManager = GameManager.instance;
                if (gameManager == null)
                    return false;

                if (gameManager.gameMode != GameMode.Game || gameManager.isGameLoading)
                    return false;

                return gameManager.userInterface?.view?.View != null;
            }
            catch (Exception ex)
            {
                Mod.log.Warn(ex, "Road Naming: gameplay UI context check failed.");
                return false;
            }
        }

        private static string Escape(string value)
        {
            return (value ?? string.Empty).Replace("\\", "\\\\").Replace("|", "\\p").Replace("\n", "\\n").Replace("\r", string.Empty);
        }
    }
}


