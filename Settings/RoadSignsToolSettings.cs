using Colossal.IO.AssetDatabase;
using Game.Input;
using Game.Modding;
using Game.Settings;
using Game.UI.Widgets;
using RoadSignsTools.Domain;

namespace RoadSignsTools.Settings
{
    [FileLocation("RoadSignsTools")]
    [SettingsUITabOrder(GeneralTab, KeybindingsTab)]
    [SettingsUIGroupOrder(DisplayGroup, InterfaceGroup, AdvancedGroup, AboutGroup, ResetGroup, ControlsGroup, KeybindingResetGroup)]
    [SettingsUIShowGroupName(DisplayGroup, InterfaceGroup, AdvancedGroup, AboutGroup, ResetGroup, ControlsGroup, KeybindingResetGroup)]
    [SettingsUIKeyboardAction(KeyBinding.ToggleTool, Usages.kDefaultUsage, Usages.kToolUsage)]
    public sealed partial class RoadSignsToolSettings : ModSetting
    {
        internal const string SettingsAssetName = "Road Signs Tools Settings";

        public const string GeneralTab = "General";
        public const string KeybindingsTab = "Keybindings";

        public const string DisplayGroup = "Display";
        public const string InterfaceGroup = "Interface";
        public const string AdvancedGroup = "Advanced";
        public const string AboutGroup = "About";
        public const string ResetGroup = "Reset";
        public const string ControlsGroup = "Controls";
        public const string KeybindingResetGroup = "KeybindingReset";

        public RoadSignsToolSettings(IMod mod)
            : base(mod)
        {
            SetDefaults();
        }

        [SettingsUISection(GeneralTab, DisplayGroup)]
        [SettingsUITextInput]
        public string BaseRouteSeparator { get; set; }

        [SettingsUISection(GeneralTab, DisplayGroup)]
        [SettingsUITextInput]
        public string RouteNumberSeparator { get; set; }

        [SettingsUISection(GeneralTab, DisplayGroup)]
        public bool AllowMultipleRouteNumbers { get; set; }

        [SettingsUISection(GeneralTab, DisplayGroup)]
        [SettingsUIDropdown(typeof(RoadSignsToolSettings), nameof(GetOrderingModeOptions))]
        public RouteNumberOrderingMode OrderingMode { get; set; }

        [SettingsUISection(GeneralTab, InterfaceGroup)]
        public bool ShowTopLeftLauncherButton { get; set; }

        [SettingsUISection(GeneralTab, AdvancedGroup)]
        public bool EnableLogging { get; set; }

        [SettingsUISection(GeneralTab, AboutGroup)]
        public string Version => Mod.Instance?.Version ?? string.Empty;

        [SettingsUISection(GeneralTab, ResetGroup)]
        [SettingsUIButton]
        [SettingsUIConfirmation]
        public bool ResetGeneralSettings
        {
            set
            {
                SetDefaults();
                ApplyAndSave();
            }
        }

        public override void SetDefaults()
        {
            BaseRouteSeparator = " - ";
            RouteNumberSeparator = " / ";
            AllowMultipleRouteNumbers = true;
            OrderingMode = RouteNumberOrderingMode.InsertionOrder;
            ShowTopLeftLauncherButton = true;
            EnableLogging = false;
        }

        public DropdownItem<RouteNumberOrderingMode>[] GetOrderingModeOptions()
        {
            return new[]
            {
                new DropdownItem<RouteNumberOrderingMode>
                {
                    value = RouteNumberOrderingMode.InsertionOrder,
                    displayName = GetOrderingModeLocaleID(RouteNumberOrderingMode.InsertionOrder),
                },
                new DropdownItem<RouteNumberOrderingMode>
                {
                    value = RouteNumberOrderingMode.Sorted,
                    displayName = GetOrderingModeLocaleID(RouteNumberOrderingMode.Sorted),
                },
            };
        }

        public string GetOrderingModeLocaleID(RouteNumberOrderingMode mode)
        {
            return $"{Mod.Id}.Options.OrderingMode[{mode}]";
        }

        public SegmentDisplaySettings ToDisplaySettings()
        {
            return new SegmentDisplaySettings
            {
                BaseRouteSeparator = string.IsNullOrEmpty(BaseRouteSeparator) ? " - " : BaseRouteSeparator,
                RouteNumberSeparator = string.IsNullOrEmpty(RouteNumberSeparator) ? " / " : RouteNumberSeparator,
                AllowMultipleRouteNumbers = AllowMultipleRouteNumbers,
                OrderingMode = OrderingMode,
            };
        }

        internal static class KeyBinding
        {
            internal const string ToggleTool = "ToggleRoadSignsTools";
        }
    }
}
