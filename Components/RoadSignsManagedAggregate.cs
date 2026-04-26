using Colossal.Serialization.Entities;
using Unity.Entities;

namespace RoadSignsTools.Components
{
    public struct RoadSignsManagedAggregate : IComponentData, IQueryTypeParameter, IEmptySerializable
    {
    }
}
