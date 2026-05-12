using System;
using System.Linq;
using System.Reflection;
using Game.Net;
using AdvancedRoadNaming.Components;
using Unity.Entities;

namespace AdvancedRoadNaming.Systems
{
    internal static class RoadAggregateSystemQueryPatcher
    {
        private const string ModifiedQueryFieldName = "m_ModifiedQuery";

        public static void Patch(AggregateSystem aggregateSystem)
        {
            if (aggregateSystem == null)
            {
                Mod.log.Warn("Road Naming: AggregateSystem query patch skipped because AggregateSystem is unavailable.");
                return;
            }

            var queryField = typeof(AggregateSystem).GetField(ModifiedQueryFieldName, BindingFlags.Instance | BindingFlags.NonPublic);
            if (queryField == null)
            {
                Mod.log.Warn(() => $"Road Naming: AggregateSystem query patch skipped because {ModifiedQueryFieldName} was not found.");
                return;
            }

            var originalQuery = (EntityQuery)queryField.GetValue(aggregateSystem);
            if (originalQuery.GetHashCode() == 0)
            {
                Mod.log.Warn("Road Naming: AggregateSystem query patch skipped because the original query was not initialized.");
                return;
            }

            var queryDescs = originalQuery.GetEntityQueryDescs();
            var markerType = ComponentType.ReadOnly<AdvancedRoadNamingAggregateMember>();
            var changed = false;
            for (var i = 0; i < queryDescs.Length; i++)
            {
                var none = queryDescs[i].None ?? Array.Empty<ComponentType>();
                if (none.Contains(markerType))
                    continue;

                queryDescs[i].None = none.Append(markerType).ToArray();
                changed = true;
            }

            if (!changed)
            {
                Mod.log.Info("Road Naming: AggregateSystem query already excludes Advanced Road Naming managed aggregate edges.");
                return;
            }

            var getQueryMethod = typeof(ComponentSystemBase).GetMethod(
                "GetEntityQuery",
                BindingFlags.Instance | BindingFlags.NonPublic,
                null,
                CallingConventions.Any,
                new[] { typeof(EntityQueryDesc[]) },
                Array.Empty<ParameterModifier>());

            if (getQueryMethod == null)
            {
                Mod.log.Warn("Road Naming: AggregateSystem query patch skipped because ComponentSystemBase.GetEntityQuery(EntityQueryDesc[]) was not found.");
                return;
            }

            var modifiedQuery = (EntityQuery)getQueryMethod.Invoke(aggregateSystem, new object[] { queryDescs });
            queryField.SetValue(aggregateSystem, modifiedQuery);
            aggregateSystem.RequireForUpdate(modifiedQuery);
            Mod.log.Info("Road Naming: AggregateSystem query patched to ignore Advanced Road Naming managed aggregate edges.");
        }
    }
}
