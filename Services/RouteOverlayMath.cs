using Colossal.Mathematics;
using Unity.Mathematics;

namespace AdvancedRoadNaming.Services
{
    public static class RouteOverlayMath
    {
        private const int LengthSamples = 16;

        public static Bezier4x3 Cut(Bezier4x3 curve, float t)
        {
            var q0 = math.lerp(curve.a, curve.b, t);
            var q1 = math.lerp(curve.b, curve.c, t);
            var q2 = math.lerp(curve.c, curve.d, t);
            var r0 = math.lerp(q0, q1, t);
            var r1 = math.lerp(q1, q2, t);
            var s = math.lerp(r0, r1, t);
            return new Bezier4x3(s, r1, q2, curve.d);
        }

        public static Bezier4x3 Cut(Bezier4x3 curve, float2 range)
        {
            var clamped = math.clamp(range, 0f, 1f);
            if (clamped.y <= clamped.x + 0.0001f)
                return curve;

            var startToEnd = Cut(curve, clamped.x);
            var denominator = 1f - clamped.x;
            if (denominator < 0.0001f)
                return startToEnd;

            var newEndT = (clamped.y - clamped.x) / denominator;
            return CutFromZero(startToEnd, newEndT);
        }

        public static float ApproximateLength(Bezier4x3 curve)
        {
            var length = 0f;
            var previous = curve.a;
            for (var i = 1; i <= LengthSamples; i++)
            {
                var t = i / (float)LengthSamples;
                var point = MathUtils.Position(curve, t);
                length += math.distance(previous, point);
                previous = point;
            }

            return length;
        }

        public static float ParameterAtDistance(Bezier4x3 curve, float distance)
        {
            if (distance <= 0f)
                return 0f;

            var total = 0f;
            var previous = curve.a;
            for (var i = 1; i <= LengthSamples; i++)
            {
                var t = i / (float)LengthSamples;
                var point = MathUtils.Position(curve, t);
                var step = math.distance(previous, point);
                if (total + step >= distance && step > 0.0001f)
                {
                    var alpha = (distance - total) / step;
                    var previousT = (i - 1) / (float)LengthSamples;
                    return math.lerp(previousT, t, alpha);
                }

                total += step;
                previous = point;
            }

            return 1f;
        }

        public static float ParameterAtDistanceReversed(Bezier4x3 curve, float distance)
        {
            if (distance <= 0f)
                return 0f;

            var total = 0f;
            var previous = curve.d;
            for (var i = 1; i <= LengthSamples; i++)
            {
                var t = 1f - i / (float)LengthSamples;
                var point = MathUtils.Position(curve, t);
                var step = math.distance(previous, point);
                if (total + step >= distance && step > 0.0001f)
                {
                    var alpha = (distance - total) / step;
                    var previousT = 1f - (i - 1) / (float)LengthSamples;
                    return math.lerp(previousT, t, alpha);
                }

                total += step;
                previous = point;
            }

            return 1f;
        }

        private static Bezier4x3 CutFromZero(Bezier4x3 curve, float t)
        {
            var q0 = math.lerp(curve.a, curve.b, t);
            var q1 = math.lerp(curve.b, curve.c, t);
            var q2 = math.lerp(curve.c, curve.d, t);
            var r0 = math.lerp(q0, q1, t);
            var r1 = math.lerp(q1, q2, t);
            var s = math.lerp(r0, r1, t);
            return new Bezier4x3(curve.a, q0, r0, s);
        }
    }
}
