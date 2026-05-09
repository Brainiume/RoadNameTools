using Colossal.UI.Binding;
using Game;
using Game.Common;
using Game.Net;
using Game.Prefabs;
using Game.UI;
using Game.UI.InGame;
using Unity.Entities;

namespace RoadSignsTools.Systems
{
    public sealed partial class RoadSelectionInfoSectionSystem : InfoSectionBase
    {
        private SegmentMetadataSystem _metadataSystem;
        private NameSystem _nameSystem;

        public override GameMode gameMode => GameMode.Game;

        protected override string group => nameof(RoadSignsTools);

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
            var segment = selectedEntity;
            var roadName = string.Empty;
            var routeNumbers = string.Empty;
            var hasRoadSignsData = false;

            if (IsRoadSelection(segment))
            {
                roadName = GetRenderedRoadName(segment);
                var metadataEntity = GetRepresentativeRoadSegment(segment);
                if (metadataEntity != Entity.Null && _metadataSystem.Repository.TryGet(metadataEntity, out var metadata))
                {
                    hasRoadSignsData = true;
                    if (!string.IsNullOrWhiteSpace(metadata.OptionalCustomRoadName))
                        roadName = metadata.OptionalCustomRoadName.Trim();
                    routeNumbers = metadata.RouteNumbers.Count > 0
                        ? string.Join(", ", metadata.RouteNumbers.ToArray())
                        : string.Empty;
                }
            }

            writer.PropertyName("segmentIndex");
            writer.Write(segment.Index);
            writer.PropertyName("roadName");
            writer.Write(roadName ?? string.Empty);
            writer.PropertyName("routeNumbers");
            writer.Write(routeNumbers);
            writer.PropertyName("hasRoadSignsData");
            writer.Write(hasRoadSignsData);
        }

        private bool IsSelectedRoadSegment()
        {
            return IsRoadSelection(selectedEntity);
        }

        private bool IsRoadSelection(Entity entity)
        {
            return IsRoadEdge(entity) || IsRoadAggregate(entity);
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
            if (entity == Entity.Null
                || !EntityManager.Exists(entity)
                || !EntityManager.HasComponent<Aggregate>(entity)
                || !EntityManager.HasBuffer<AggregateElement>(entity)
                || EntityManager.HasComponent<Deleted>(entity)
                || EntityManager.HasComponent<Game.Tools.Temp>(entity))
            {
                return false;
            }

            return GetRepresentativeRoadSegment(entity) != Entity.Null;
        }

        private Entity GetRepresentativeRoadSegment(Entity entity)
        {
            if (IsRoadEdge(entity))
                return entity;

            if (entity == Entity.Null || !EntityManager.Exists(entity) || !EntityManager.HasBuffer<AggregateElement>(entity))
                return Entity.Null;

            var elements = EntityManager.GetBuffer<AggregateElement>(entity, true);
            for (var i = 0; i < elements.Length; i++)
            {
                var edge = elements[i].m_Edge;
                if (IsRoadEdge(edge))
                    return edge;
            }

            return Entity.Null;
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
