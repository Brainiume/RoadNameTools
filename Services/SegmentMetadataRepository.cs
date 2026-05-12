using System.Collections.Generic;
using AdvancedRoadNaming.Domain;
using Unity.Entities;

namespace AdvancedRoadNaming.Services
{
    public sealed class SegmentMetadataRepository
    {
        private readonly Dictionary<Entity, SegmentRouteMetadata> _metadata = new Dictionary<Entity, SegmentRouteMetadata>();

        public int Count => _metadata.Count;

        public IEnumerable<SegmentRouteMetadata> All => _metadata.Values;

        public bool TryGet(Entity entity, out SegmentRouteMetadata metadata)
        {
            return _metadata.TryGetValue(entity, out metadata);
        }

        public SegmentRouteMetadata GetOrCreate(Entity entity)
        {
            if (!_metadata.TryGetValue(entity, out var metadata))
            {
                metadata = new SegmentRouteMetadata(entity);
                _metadata.Add(entity, metadata);
            }

            return metadata;
        }

        public bool Remove(Entity entity)
        {
            return _metadata.Remove(entity);
        }

        public void Clear()
        {
            _metadata.Clear();
        }
    }
}
