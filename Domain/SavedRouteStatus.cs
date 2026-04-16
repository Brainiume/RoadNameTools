namespace RoadSignsTools.Domain
{
    public enum SavedRouteStatus
    {
        Valid = 0,
        PartiallyValid = 1,
        MissingSegments = 2,
        RebuildNeeded = 3,
        Deleted = 4
    }
}
