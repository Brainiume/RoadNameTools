using System.Collections.Generic;
using Colossal.Localization;
using Game.SceneFlow;
using RoadSignsTools.Domain;
using RoadSignsTools.Settings;

namespace RoadSignsTools.L10N
{
    public static class RoadSignsLocalization
    {
        private const string LocaleEnUs = "en-US";
        private const string LocaleEn = "en";
        private const string SettingsId = "RoadSignsTools.RoadSignsTools.Mod";
        private const string SettingsName = nameof(RoadSignsToolSettings);

        private static MemorySource _enUsSource;
        private static MemorySource _enSource;
        private static MemorySource _activeSource;
        private static string _activeLocaleId;

        public static void Register()
        {
            var manager = GameManager.instance?.localizationManager;
            if (manager == null)
            {
                Mod.log.Warn("Localization manager not available; Road Naming: option labels will use fallback keys.");
                return;
            }

            var entries = CreateEntries();
            _enUsSource = new MemorySource(entries);
            _enSource = new MemorySource(new Dictionary<string, string>(entries));
            manager.AddSource(LocaleEnUs, _enUsSource);
            manager.AddSource(LocaleEn, _enSource);

            _activeLocaleId = manager.activeLocaleId;
            if (!string.IsNullOrWhiteSpace(_activeLocaleId) && _activeLocaleId != LocaleEnUs && _activeLocaleId != LocaleEn)
            {
                _activeSource = new MemorySource(new Dictionary<string, string>(entries));
                manager.AddSource(_activeLocaleId, _activeSource);
            }

            Mod.log.Info("Road Naming: localization registered.");
        }

        public static void Unregister()
        {
            var manager = GameManager.instance?.localizationManager;
            if (manager == null)
                return;

            if (_enUsSource != null)
                manager.RemoveSource(LocaleEnUs, _enUsSource);
            if (_enSource != null)
                manager.RemoveSource(LocaleEn, _enSource);
            if (_activeSource != null && !string.IsNullOrWhiteSpace(_activeLocaleId))
                manager.RemoveSource(_activeLocaleId, _activeSource);

            _enUsSource = null;
            _enSource = null;
            _activeSource = null;
            _activeLocaleId = null;
        }

        private static Dictionary<string, string> CreateEntries()
        {
            var entries = new Dictionary<string, string>
            {
                [$"Options.SECTION[{SettingsId}]"] = "Road Signs Tools",
                [$"Options.TAB[{SettingsId}.General]"] = "Road Signs Tools",
                [$"Options.TAB[{SettingsId}.{RoadSignsToolSettings.MainSection}]"] = "Road Signs Tools",
                [$"Options.GROUP[{SettingsId}.{RoadSignsToolSettings.MainSection}]"] = "Road Signs Tools",
                [$"Options.GROUP[{SettingsId}.{RoadSignsToolSettings.DisplaySection}]"] = "Display",
                [$"Options.GROUP[{SettingsId}.{RoadSignsToolSettings.SafetySection}]"] = "Safety",
                [$"Options.GROUP[{SettingsId}.RoadSignsTool.Main]"] = "Road Signs Tools",
                [$"Options.GROUP[{SettingsId}.RoadSignsTool.Display]"] = "Display",
                [$"Options.GROUP[{SettingsId}.RoadSignsTool.Safety]"] = "Safety",

                [Option(nameof(RoadSignsToolSettings.BaseRouteSeparator))] = "Base Route Separator",
                [Description(nameof(RoadSignsToolSettings.BaseRouteSeparator))] = "Text placed between the base street name and the route number list.",
                [Option(nameof(RoadSignsToolSettings.RouteNumberSeparator))] = "Route Number Separator",
                [Description(nameof(RoadSignsToolSettings.RouteNumberSeparator))] = "Text used between multiple route numbers on the same selected segment.",
                [Option(nameof(RoadSignsToolSettings.AllowMultipleRouteNumbers))] = "Allow Multiple Route Numbers",
                [Description(nameof(RoadSignsToolSettings.AllowMultipleRouteNumbers))] = "Allow a segment to display more than one route number, such as A1 / M2.",
                [Option(nameof(RoadSignsToolSettings.OrderingMode))] = "Ordering Mode",
                [Description(nameof(RoadSignsToolSettings.OrderingMode))] = "Controls whether route numbers keep insertion order or are sorted for display.",
                [Option(nameof(RoadSignsToolSettings.ConfirmBeforeReplacingExistingCustomName))] = "Confirm Before Replacing Existing Custom Name",
                [Description(nameof(RoadSignsToolSettings.ConfirmBeforeReplacingExistingCustomName))] = "Reserved safety option for prompting before an existing custom name is replaced.",
                [Option(nameof(RoadSignsToolSettings.ConfirmBeforeRemovingRouteNumber))] = "Confirm Before Removing Route Number",
                [Description(nameof(RoadSignsToolSettings.ConfirmBeforeRemovingRouteNumber))] = "Reserved safety option for prompting before a route number is removed.",
                [Option(nameof(RoadSignsToolSettings.EnableAutoPathBetweenConnectedClicks))] = "Enable Auto Path Between Connected Clicks",
                [Description(nameof(RoadSignsToolSettings.EnableAutoPathBetweenConnectedClicks))] = "When enabled, the tool can compute a connected road path between the current route end and a later clicked segment.",
                [Option(nameof(RoadSignsToolSettings.ActivationHotkeyHint))] = "Activation Hotkey",
                [Description(nameof(RoadSignsToolSettings.ActivationHotkeyHint))] = "Recovery shortcut hint for toggling the Road Signs Tools panel.",
                [Option(nameof(RoadSignsToolSettings.ShowTopLeftLauncherButton))] = "Show Top-Left Launcher Button",
                [Description(nameof(RoadSignsToolSettings.ShowTopLeftLauncherButton))] = "Show the compact Road Signs Tool button in the top-left gameplay HUD.",
                [Option(nameof(RoadSignsToolSettings.EnableLogging))] = "Enable Logging",
                [Description(nameof(RoadSignsToolSettings.EnableLogging))] = "Enable Road Signs Tools diagnostic logging. Disabled by default to keep the mod quiet unless debugging is needed.",
                [Option(nameof(RoadSignsToolSettings.ResetSettingsToDefaults))] = "Reset Settings to Defaults",
                [Description(nameof(RoadSignsToolSettings.ResetSettingsToDefaults))] = "Restore all Road Signs Tools options to their default values and save the settings file.",
                [OrderingEnumValue(RouteNumberOrderingMode.InsertionOrder)] = "Insertion Order",
                [OrderingEnumValue(RouteNumberOrderingMode.Sorted)] = "Sorted"
            };

            // Compatibility with the pluralized class key shown by earlier builds or cached option metadata.
            entries[$"Options.OPTION[{SettingsId}.RoadSignsToolsSettings.BaseRouteSeparator]"] = "Base Route Separator";
            entries[$"Options.OPTION[{SettingsId}.RoadSignsToolsSettings.RouteNumberSeparator]"] = "Route Number Separator";
            entries[$"Options.OPTION[{SettingsId}.RoadSignsToolsSettings.ResetSettingsToDefaults]"] = "Reset Settings to Defaults";

            return entries;
        }

        private static string Option(string propertyName)
        {
            return $"Options.OPTION[{SettingsId}.{SettingsName}.{propertyName}]";
        }

        private static string Description(string propertyName)
        {
            return $"Options.OPTION_DESCRIPTION[{SettingsId}.{SettingsName}.{propertyName}]";
        }

        private static string OrderingEnumValue(RouteNumberOrderingMode value)
        {
            return $"Options.{SettingsId}.{nameof(RouteNumberOrderingMode).ToUpper()}[{value}]";
        }
    }
}

