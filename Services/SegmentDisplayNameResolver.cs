using System;
using System.Collections.Generic;
using System.Linq;
using RoadSignsTools.Domain;

namespace RoadSignsTools.Services
{
    public sealed class SegmentDisplayNameResolver
    {
        public string Resolve(string gameOrGeneratedBaseName, SegmentRouteMetadata metadata, SegmentDisplaySettings settings)
        {
            if (metadata == null)
                return SafeBaseName(gameOrGeneratedBaseName);

            var baseName = !string.IsNullOrWhiteSpace(metadata.OptionalCustomRoadName)
                ? metadata.OptionalCustomRoadName.Trim()
                : !string.IsNullOrWhiteSpace(metadata.BaseNameSnapshot)
                    ? metadata.BaseNameSnapshot.Trim()
                    : SafeBaseName(gameOrGeneratedBaseName);

            var routeNumbers = GetOrderedRouteNumbers(metadata.RouteNumbers, settings).ToList();
            if (routeNumbers.Count == 0)
                return baseName;

            var routeNumberDisplay = string.Join(settings.RouteNumberSeparator, routeNumbers);
            return metadata.RouteNumberPlacement == RouteNumberPlacement.BeforeBaseName
                ? routeNumberDisplay + settings.BaseRouteSeparator + baseName
                : baseName + settings.BaseRouteSeparator + routeNumberDisplay;
        }

        private static string SafeBaseName(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? "Unnamed Road Segment" : value.Trim();
        }

        private static IEnumerable<string> GetOrderedRouteNumbers(IEnumerable<string> routeNumbers, SegmentDisplaySettings settings)
        {
            var distinct = routeNumbers
                .Where(route => !string.IsNullOrWhiteSpace(route))
                .Select(route => route.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase);

            return settings.OrderingMode == RouteNumberOrderingMode.Sorted
                ? distinct.OrderBy(route => route, StringComparer.OrdinalIgnoreCase)
                : distinct;
        }
    }
}
