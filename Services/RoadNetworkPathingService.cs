using System.Collections.Generic;
using Game.Net;
using Unity.Entities;

namespace RoadSignsTools.Services
{
    public sealed class RoadNetworkPathingService
    {
        private readonly EntityManager _entityManager;
        private readonly SegmentValidationService _validation;

        public RoadNetworkPathingService(EntityManager entityManager, SegmentValidationService validation)
        {
            _entityManager = entityManager;
            _validation = validation;
        }

        public bool AreConnected(Entity left, Entity right)
        {
            if (!_validation.IsValidRoadSegment(left) || !_validation.IsValidRoadSegment(right))
                return false;

            var leftEdge = _entityManager.GetComponentData<Edge>(left);
            var rightEdge = _entityManager.GetComponentData<Edge>(right);

            return leftEdge.m_Start == rightEdge.m_Start
                || leftEdge.m_Start == rightEdge.m_End
                || leftEdge.m_End == rightEdge.m_Start
                || leftEdge.m_End == rightEdge.m_End;
        }

        public IReadOnlyList<Entity> FindPath(Entity start, Entity target, int maxDepth)
        {
            var empty = new List<Entity>();
            if (!_validation.IsValidRoadSegment(start) || !_validation.IsValidRoadSegment(target))
                return empty;

            if (start == target)
                return new List<Entity> { start };

            var queue = new List<Entity>();
            var readIndex = 0;
            var previous = new Dictionary<Entity, Entity>();
            var depth = new Dictionary<Entity, int>();

            queue.Add(start);
            previous[start] = Entity.Null;
            depth[start] = 0;

            while (readIndex < queue.Count)
            {
                var current = queue[readIndex++];
                if (depth[current] >= maxDepth)
                    continue;

                foreach (var neighbor in GetNeighborRoadSegments(current))
                {
                    if (previous.ContainsKey(neighbor))
                        continue;

                    previous[neighbor] = current;
                    depth[neighbor] = depth[current] + 1;

                    if (neighbor == target)
                        return ReconstructPath(previous, target);

                    queue.Add(neighbor);
                }
            }

            return empty;
        }

        private IEnumerable<Entity> GetNeighborRoadSegments(Entity segment)
        {
            var edge = _entityManager.GetComponentData<Edge>(segment);
            foreach (var neighbor in GetSegmentsFromNode(edge.m_Start))
            {
                if (neighbor != segment)
                    yield return neighbor;
            }

            foreach (var neighbor in GetSegmentsFromNode(edge.m_End))
            {
                if (neighbor != segment)
                    yield return neighbor;
            }
        }

        private IEnumerable<Entity> GetSegmentsFromNode(Entity node)
        {
            if (node == Entity.Null || !_entityManager.Exists(node) || !_entityManager.HasBuffer<ConnectedEdge>(node))
                yield break;

            var connectedEdges = _entityManager.GetBuffer<ConnectedEdge>(node);
            for (var i = 0; i < connectedEdges.Length; i++)
            {
                var edge = connectedEdges[i].m_Edge;
                if (_validation.IsValidRoadSegment(edge))
                    yield return edge;
            }
        }

        private static IReadOnlyList<Entity> ReconstructPath(Dictionary<Entity, Entity> previous, Entity target)
        {
            var path = new List<Entity>();
            var cursor = target;

            while (cursor != Entity.Null)
            {
                path.Add(cursor);
                cursor = previous[cursor];
            }

            path.Reverse();
            return path;
        }
    }
}



