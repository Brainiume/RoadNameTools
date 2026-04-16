using Game.Modding;
using Game.Settings;
using RoadSignsTools.Domain;

namespace RoadSignsTools.Settings
{
    public sealed class RoadSignsToolSettings : ModSetting
    {
        public const string MainSection = "Main";
        public const string DisplaySection = "Display";
        public const string SafetySection = "Safety";

        public RoadSignsToolSettings(IMod mod) : base(mod)
        {
        }

        [SettingsUISection(DisplaySection)]
        [SettingsUITextInput]
        public string BaseRouteSeparator { get; set; }

        [SettingsUISection(DisplaySection)]
        [SettingsUITextInput]
        public string RouteNumberSeparator { get; set; }

        [SettingsUISection(DisplaySection)]
        public bool AllowMultipleRouteNumbers { get; set; }

        [SettingsUISection(DisplaySection)]
        public RouteNumberOrderingMode OrderingMode { get; set; }

        [SettingsUISection(SafetySection)]
        public bool ConfirmBeforeReplacingExistingCustomName { get; set; }

        [SettingsUISection(SafetySection)]
        public bool ConfirmBeforeRemovingRouteNumber { get; set; }

        [SettingsUISection(SafetySection)]
        public bool EnableAutoPathBetweenConnectedClicks { get; set; }

        [SettingsUISection(MainSection)]
        [SettingsUITextInput]
        public string ActivationHotkeyHint { get; set; }

        [SettingsUISection(MainSection)]
        public bool ShowTopLeftLauncherButton { get; set; }

        [SettingsUISection(MainSection)]
        public bool EnableLogging { get; set; }

        [SettingsUISection(MainSection)]
        [SettingsUIButton]
        public bool ResetSettingsToDefaults
        {
            set
            {
                if (!value)
                    return;

                SetDefaults();
                ApplyAndSave();
                RoadSignsTools.Mod.log.Info("Road Naming: settings reset to defaults and saved.");
            }
        }

        public override void SetDefaults()
        {
            BaseRouteSeparator = " - ";
            RouteNumberSeparator = " / ";
            AllowMultipleRouteNumbers = true;
            OrderingMode = RouteNumberOrderingMode.InsertionOrder;
            ConfirmBeforeReplacingExistingCustomName = true;
            ConfirmBeforeRemovingRouteNumber = true;
            EnableAutoPathBetweenConnectedClicks = true;
            ActivationHotkeyHint = "Ctrl+Q";
            ShowTopLeftLauncherButton = true;
            EnableLogging = false;
        }

        public SegmentDisplaySettings ToDisplaySettings()
        {
            return new SegmentDisplaySettings
            {
                BaseRouteSeparator = string.IsNullOrEmpty(BaseRouteSeparator) ? " - " : BaseRouteSeparator,
                RouteNumberSeparator = string.IsNullOrEmpty(RouteNumberSeparator) ? " / " : RouteNumberSeparator,
                AllowMultipleRouteNumbers = AllowMultipleRouteNumbers,
                OrderingMode = OrderingMode
            };
        }
    }
}


