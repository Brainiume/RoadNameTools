using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Colossal;
using Colossal.Json;
using Colossal.Localization;
using Game.SceneFlow;
using AdvancedRoadNaming.Settings;

namespace AdvancedRoadNaming.L10N
{
    public static partial class AdvancedRoadNamingLocalization
    {
        private static readonly Dictionary<string, IDictionarySource> RegisteredSources = new Dictionary<string, IDictionarySource>(StringComparer.OrdinalIgnoreCase);

        public static void Register(Mod mod, AdvancedRoadNamingSettings settings)
        {
            if (settings == null)
            {
                return;
            }

            var manager = GameManager.instance.localizationManager;
            if (manager == null)
            {
                return;
            }

            Unregister();

            var englishSource = new LocaleEN(settings);
            RegisterSource(manager, "en-US", englishSource);
            LoadExternalLocales(mod, manager, englishSource);
        }

        public static void Unregister()
        {
            var manager = GameManager.instance.localizationManager;
            if (manager == null)
            {
                RegisteredSources.Clear();
                return;
            }

            foreach (var source in RegisteredSources)
            {
                manager.RemoveSource(source.Key, source.Value);
            }

            RegisteredSources.Clear();
        }

        private static void RegisterSource(LocalizationManager manager, string localeId, IDictionarySource source)
        {
            manager.AddSource(localeId, source);
            RegisteredSources[localeId] = source;
        }

        private static void LoadExternalLocales(Mod mod, LocalizationManager manager, LocaleEN englishSource)
        {
            if (!GameManager.instance.modManager.TryGetExecutableAsset(mod, out var asset))
            {
                return;
            }

            var modRoot = File.Exists(asset.path) ? Path.GetDirectoryName(asset.path) : asset.path;
            if (string.IsNullOrWhiteSpace(modRoot))
            {
                return;
            }

            var localizationDirectory = Path.Combine(modRoot, "L10N");
            if (!Directory.Exists(localizationDirectory))
            {
                return;
            }

            var englishEntries = englishSource.ReadEntries(null, null).ToDictionary(pair => pair.Key, pair => pair.Value);
            foreach (var localePath in Directory.EnumerateFiles(localizationDirectory, "*.json"))
            {
                var localeId = Path.GetFileNameWithoutExtension(localePath);
                if (string.Equals(localeId, "en-US", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (TryLoadLocale(localePath, englishEntries, out var localizedEntries))
                {
                    RegisterSource(manager, localeId, new MemorySource(localizedEntries));
                }
            }
        }

        private static bool TryLoadLocale(string localePath, IReadOnlyDictionary<string, string> englishEntries, out Dictionary<string, string> localizedEntries)
        {
            localizedEntries = null;

            try
            {
                var variant = JSON.Load(File.ReadAllText(localePath));
                localizedEntries = variant.Make<Dictionary<string, string>>() ?? new Dictionary<string, string>();
                foreach (var englishEntry in englishEntries)
                {
                    localizedEntries.TryAdd(englishEntry.Key, englishEntry.Value);
                }

                return true;
            }
            catch (Exception exception)
            {
                Mod.log.Warn(exception, () => $"Advanced Road Naming localization load failed for '{localePath}'.");
                return false;
            }
        }
    }
}
