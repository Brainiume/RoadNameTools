using Colossal.UI.Binding;
using Game;
using Game.Common;
using Game.Net;
using Game.Prefabs;
using Game.UI;
using Game.UI.InGame;
using Unity.Entities;

namespace AdvancedRoadNaming.Systems
{
    public sealed partial class RoadSelectionInfoSectionSystem : InfoSectionBase
    {
        private SegmentMetadataSystem _metadataSystem;
        private NameSystem _nameSystem;

        public override GameMode gameMode => GameMode.Game;

        protected override string group => nameof(AdvancedRoadNaming);

        protected override void OnCreate()
        {
            base.OnCreate();
            _metadataSystem = World.GetOrCreateSystemManaged<SegmentMetadataSystem>();
            _nameSystem = World.GetOrCreateSystemManaged<NameSystem>();
            m_InfoUISystem.AddMiddleSection(this);

            AddBinding(new TriggerBinding<string>(
                Mod.Id,
                "SelectedRoadInfoButtonClicked",
                SelectedRoadInfoButtonClicked,
                ValueReaders.Create<string>()));

            Enabled = false;
            Mod.log.Info("RoadSelectionInfoSectionSystem created");
        }

        protected override void OnUpdate()
        {
            base.OnUpdate();
            visible = IsSelectedRoadSegment();
        }

        protected override void Reset()
        {
        }

        protected override void OnProcess()
        {
        }

        public override void OnWriteProperties(IJsonWriter writer)
        {
            var segment = GetRepresentativeRoadSegment(selectedEntity);
            var roadName = string.Empty;
            var routeNumbers = string.Empty;
            var hasAdvancedRoadNamingData = false;

            if (segment != Entity.Null)
            {
                roadName = GetRenderedRoadName(segment);
                if (_metadataSystem.Repository.TryGet(segment, out var metadata))
                {
                    hasAdvancedRoadNamingData = true;
                    if (!string.IsNullOrWhiteSpace(metadata.OptionalCustomRoadName))
                        roadName = metadata.OptionalCustomRoadName.Trim();
                    routeNumbers = metadata.RouteNumbers.Count > 0
                        ? string.Join(", ", metadata.RouteNumbers.ToArray())
                        : string.Empty;
                }
            }

            writer.PropertyName("segmentIndex");
            writer.Write(segment != Entity.Null ? segment.Index : selectedEntity.Index);
            writer.PropertyName("roadName");
            writer.Write(roadName ?? string.Empty);
            writer.PropertyName("routeNumbers");
            writer.Write(routeNumbers);
            writer.PropertyName("hasAdvancedRoadNamingData");
            writer.Write(hasAdvancedRoadNamingData);
        }

        private bool IsSelectedRoadSegment()
        {
            return IsRoadSelection(selectedEntity);
        }

        private bool IsRoadSelection(Entity entity)
        {
            return GetRepresentativeRoadSegment(entity) != Entity.Null;
        }

        private bool IsRoadEdge(Entity entity)
        {
            return entity != Entity.Null
                && EntityManager.Exists(entity)
                && EntityManager.HasComponent<Edge>(entity)
                && EntityManager.HasComponent<Road>(entity)
                && !EntityManager.HasComponent<Deleted>(entity)
                && !EntityManager.HasComponent<Game.Tools.Temp>(entity);
        }

        private bool IsRoadAggregate(Entity entity)
        {
            return TryGetAggregateRoadSegment(entity, out _);
        }

        private Entity GetRepresentativeRoadSegment(Entity entity)
        {
            return GetRepresentativeRoadSegment(entity, 0);
        }

        private Entity GetRepresentativeRoadSegment(Entity entity, int depth)
        {
            if (IsRoadEdge(entity))
                return entity;

            if (entity == Entity.Null || !EntityManager.Exists(entity) || depth > 4)
                return Entity.Null;

            if (TryGetAggregateRoadSegment(entity, out var aggregateRoadSegment))
                return aggregateRoadSegment;

            if (EntityManager.HasComponent<Aggregated>(entity))
            {
                var aggregate = EntityManager.GetComponentData<Aggregated>(entity).m_Aggregate;
                if (aggregate != Entity.Null && aggregate != entity)
                {
                    var aggregatedRoadSegment = GetRepresentativeRoadSegment(aggregate, depth + 1);
                    if (aggregatedRoadSegment != Entity.Null)
                        return aggregatedRoadSegment;
                }
            }

            if (EntityManager.HasComponent<Owner>(entity))
            {
                var owner = EntityManager.GetComponentData<Owner>(entity).m_Owner;
                if (owner != Entity.Null && owner != entity)
                    return GetRepresentativeRoadSegment(owner, depth + 1);
            }

            return Entity.Null;
        }

        private bool TryGetAggregateRoadSegment(Entity entity, out Entity segment)
        {
            segment = Entity.Null;

            if (entity == Entity.Null
                || !EntityManager.Exists(entity)
                || !EntityManager.HasComponent<Aggregate>(entity)
                || !EntityManager.HasBuffer<AggregateElement>(entity)
                || EntityManager.HasComponent<Deleted>(entity)
                || EntityManager.HasComponent<Game.Tools.Temp>(entity))
            {
                return false;
            }

            var elements = EntityManager.GetBuffer<AggregateElement>(entity, true);
            for (var i = 0; i < elements.Length; i++)
            {
                var edge = elements[i].m_Edge;
                if (IsRoadEdge(edge))
                {
                    segment = edge;
                    return true;
                }
            }

            return false;
        }

        private string GetRenderedRoadName(Entity segment)
        {
            if (_nameSystem == null || segment == Entity.Null || !EntityManager.Exists(segment))
                return string.Empty;

            if (EntityManager.HasComponent<Aggregated>(segment))
            {
                var aggregate = EntityManager.GetComponentData<Aggregated>(segment).m_Aggregate;
                if (aggregate != Entity.Null && EntityManager.Exists(aggregate))
                {
                    if (_nameSystem.TryGetCustomName(aggregate, out var aggregateCustomName) && !string.IsNullOrWhiteSpace(aggregateCustomName))
                        return aggregateCustomName.Trim();

                    var aggregateLabel = _nameSystem.GetRenderedLabelName(aggregate);
                    if (!string.IsNullOrWhiteSpace(aggregateLabel))
                        return aggregateLabel.Trim();
                }
            }

            if (_nameSystem.TryGetCustomName(segment, out var customName) && !string.IsNullOrWhiteSpace(customName))
                return customName.Trim();

            var renderedName = _nameSystem.GetRenderedLabelName(segment);
            if (!string.IsNullOrWhiteSpace(renderedName))
                return renderedName.Trim();

            if (EntityManager.HasComponent<PrefabRef>(segment))
            {
                var prefab = EntityManager.GetComponentData<PrefabRef>(segment).m_Prefab;
                if (prefab != Entity.Null && EntityManager.Exists(prefab))
                {
                    var prefabName = _nameSystem.GetRenderedLabelName(prefab);
                    if (!string.IsNullOrWhiteSpace(prefabName))
                        return prefabName.Trim();
                }
            }

            return $"Road Segment {segment.Index}";
        }

        private void SelectedRoadInfoButtonClicked(string action)
        {
            Mod.log.Info(() => $"Road Naming: selected info panel button clicked. Action='{action ?? string.Empty}', Selection={selectedEntity.Index}, RepresentativeRoad={GetRepresentativeRoadSegment(selectedEntity).Index}.");
            RequestUpdate();
            m_InfoUISystem.RequestUpdate();
        }
    }
}
