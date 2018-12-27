
import * as https from 'https'
import * as http from 'http'
import { parse } from 'url'
import { httpsKey, httpsCert, consulURI, httpsCa } from './conf'

export interface Node {
  id: string
  label: string
  metadata: any
}

export interface Edge {
  source: string
  target: string
  metadata: object
}

export interface GraphData {
  nodes: Node[]
  edges: Edge[]
}

// most of this code is ported direclty from the Go implementation of serf
// https://github.com/hashicorp/serf/blob/master/coordinate/coordinate.go

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

export const transformNodes = (nodes: Array<any>): GraphData => {
  const edges: Edge[] = []
  for (let i = 0; i < nodes.length; i++) {
    const currentNode = nodes[i]
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue
      const node = nodes[j]
      edges.push({
        source: currentNode.Node,
        target: node.Node,
        metadata: {
          distance: distanceTo(coordinateFromNode(currentNode), coordinateFromNode(node)) / 100
        }
      })
    }
  }
  return {
    nodes: nodes.map(node => {
      return {
        id: node.Node,
        label: node.Mode,
        metadata: {
          offline: false
        }
      } as Node
    }),
    edges
  }
}

export const request = async (url: string, path: string) => {
  return new Promise((resolve, reject) => {
    const get = url.match(/https/) ? https.get : http.get
    const request = get(Object.assign(parse(consulURI), {
      key: httpsKey,
      cert: httpsCert,
      ca: httpsCa,
      path,
      rejectUnauthorized: false
    }), (response) => {
      let body = ''
      response.on('data', (chunk) => body += chunk)
      response.on('end', _ => {
        resolve(JSON.parse(body))
      })
    })
    request.on('error', reject)
    request.end()
  })
}