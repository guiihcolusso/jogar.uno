/**
 * Wraps `value` into the [min, max) range. Ported as-is from the original
 * implementation - used to keep player-index math wrapping around the
 * table regardless of direction.
 */
export function getSanitizedValueWithBoundaries (value: number, max: number, min: number): number {
	if (value >= max) {
		return value % max
	}

	if (value <= min) {
		return Math.abs(max - Math.abs(value)) % max
	}

	return value
}
