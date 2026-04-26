using Colossal.IO.AssetDatabase;
using Colossal.Logging;
using Colossal.UI;
using Game;
using Game.Modding;
using Game.Net;
using Game.SceneFlow;
using RoadSignsTools.L10N;
using RoadSignsTools.Settings;
using RoadSignsTools.Systems;
using System.Reflection;

namespace RoadSignsTools
{
    public class Mod : IMod
    {
        public static readonly string Id = nameof(RoadSignsTools);
        private static readonly ILog BaseLog = LogManager.GetLogger($"{nameof(RoadSignsTools)}.{nameof(Mod)}").SetShowsErrorsInUI(false);

        public static readonly ConditionalLog log = new ConditionalLog(BaseLog);

        public static Mod Instance { get; private set; }

        public static RoadSignsToolSettings Settings { get; private set; }

        public static string ModRootPath { get; private set; }

        public string Version => Assembly.GetExecutingAssembly().GetName().Version?.ToString(4) ?? "0.0.0.0";

        public static bool IsLoggingEnabled => Settings?.EnableLogging == true;

        public void OnLoad(UpdateSystem updateSystem)
        {
            Instance = this;
            log.Info(nameof(OnLoad));

            if (GameManager.instance.modManager.TryGetExecutableAsset(this, out var asset))
            {
                log.Info($"Current mod asset at {asset.path}");
                ModRootPath = System.IO.File.Exists(asset.path) ? System.IO.Path.GetDirectoryName(asset.path) : asset.path;
            }

            RegisterUiAssetHost();

            Settings = new RoadSignsToolSettings(this);
            RoadSignsLocalization.Register(this, Settings);
            Settings.RegisterKeyBindings();
            Settings.RegisterInOptionsUI();
            AssetDatabase.global.LoadSettings(RoadSignsToolSettings.SettingsAssetName, Settings, new RoadSignsToolSettings(this));

            updateSystem.UpdateAt<SegmentMetadataSystem>(SystemUpdatePhase.Deserialize);
            updateSystem.UpdateAt<SegmentMetadataSystem>(SystemUpdatePhase.Serialize);
            updateSystem.UpdateAt<RoadRouteToolSystem>(SystemUpdatePhase.ToolUpdate);
            updateSystem.UpdateAt<RoadRouteToolUISystem>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAfter<RoadSelectionInfoSectionSystem>(SystemUpdatePhase.UIUpdate);
            updateSystem.UpdateAt<RoadRouteOverlayGeometrySystem>(SystemUpdatePhase.Rendering);
            updateSystem.UpdateAt<RoadRouteHighlightSystem>(SystemUpdatePhase.Rendering);
            RoadAggregateSystemQueryPatcher.Patch(updateSystem.World.GetOrCreateSystemManaged<AggregateSystem>());

            log.Info("Road Naming: systems registered");
        }

        private static void RegisterUiAssetHost()
        {
            if (string.IsNullOrWhiteSpace(ModRootPath))
            {
                log.Warn("Road Naming: UI asset host was not registered because the mod root path is unavailable.");
                return;
            }

            if (UIManager.defaultUISystem == null)
            {
                log.Warn("Road Naming: UI asset host was not registered because the default UI system is unavailable.");
                return;
            }

            var assetRoot = System.IO.Path.Combine(ModRootPath, "Assets").Replace('\\', '/') + "/";
            UIManager.defaultUISystem.AddHostLocation("rst", assetRoot);
            log.Info($"Road Naming: UI asset host registered at coui://rst/ -> {assetRoot}");
        }

        public void OnDispose()
        {
            log.Info(nameof(OnDispose));
            RoadSignsLocalization.Unregister();
            Settings?.UnregisterInOptionsUI();
            Settings = null;
            ModRootPath = null;
            Instance = null;
        }

        public sealed class ConditionalLog
        {
            private readonly ILog _inner;

            public ConditionalLog(ILog inner)
            {
                _inner = inner;
            }

            private static bool Enabled => Mod.IsLoggingEnabled;

            public void Info(object message)
            {
                if (Enabled)
                    _inner.Info(message);
            }

            public void Warn(object message)
            {
                if (Enabled)
                    _inner.Warn(message);
            }

            public void Warn(System.Exception exception, object message)
            {
                if (Enabled)
                    _inner.Warn(exception, message);
            }

            public void Error(object message)
            {
                if (Enabled)
                    _inner.Error(message);
            }

            public void Error(System.Exception exception, object message)
            {
                if (Enabled)
                    _inner.Error(exception, message);
            }
        }
    }
}
