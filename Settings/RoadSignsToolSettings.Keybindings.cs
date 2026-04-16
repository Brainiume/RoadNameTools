using Game.Input;
using Game.Settings;

namespace RoadSignsTools.Settings
{
    public sealed partial class RoadSignsToolSettings
    {
        [SettingsUISection(KeybindingsTab, ControlsGroup)]
        [SettingsUIKeyboardBinding(BindingKeyboard.Q, KeyBinding.ToggleTool, ctrl: true)]
        public ProxyBinding ToggleToolBinding { get; set; }

        [SettingsUISection(KeybindingsTab, KeybindingResetGroup)]
        [SettingsUIButton]
        [SettingsUIConfirmation]
        public bool ResetKeyBindingsToDefaults
        {
            set
            {
                ResetKeyBindings();
                ApplyAndSave();
            }
        }
    }
}
