

export class Coordinate {
  // Vec is the Euclidean portion of the coordinate. This is used along
	// with the other fields to provide an overall distance estimate. The
	// units here are seconds.
  vec: number[] = []
  // Err reflects the confidence in the given coordinate and is updated
	// dynamically by the Vivaldi Client. This is dimensionless.
  err: number = 0
  // Adjustment is a distance offset computed based on a calculation over
	// observations from all other nodes over a fixed window and is updated
	// dynamically by the Vivaldi Client. The units here are seconds.
  adjustment: number = 0
  // Height is a distance offset that accounts for non-Euclidean effects
	// which model the access links from nodes to the core Internet. The access
	// links are usually set by bandwidth and congestion, and the core links
	// usually follow distance based on geography.
  height: number = 0
}

export const distanceTo = (source: Coordinate, target: Coordinate): number => {
  let distance = this.magnitude(this.diff(source.vec, target.vec)) + source.height + target.height
  const adjustedDist = distance + source.adjustment + target.adjustment
	if (adjustedDist > 0.0) {
		distance = adjustedDist
  }
  return Math.round((distance * 1.0e9 / 1000))
}

export const diff = (vectors1: number[], vectors2: number[]): number[] => {
  return vectors1.map((_, index) => {
    return vectors1[index] - vectors2[index]
  })
}

export const magnitude = (vectors: number[]): number => {
  let sum = 0.0
  for (let vector of vectors) {
    sum += (vector * vector)
  }
  return Math.sqrt(sum)
}

export const coordinateFromNode = (node): Coordinate => {
  return {
    vec: node.Coord.Vec,
    err: node.Coord.Error,
    adjustment: node.Coord.Adjustment,
    height: node.Coord.Height
  }
}