
// @ts-ignore
import * as nodes from './dataset.json'
import {distanceTo, coordinateFromNode} from './coordinate'
import * as express from 'express'

const edges = []
for (let i = 0; i < nodes.length; i++) {
  const currentNode = nodes[i]
  for (let j = 0; j < nodes.length; j++) {
    if (i === j) continue
    const node = nodes[j]
    edges.push({
      source: i,
      target: j,
      distance: distanceTo(coordinateFromNode(currentNode), coordinateFromNode(node)) / 100
    })
  }
}


const data = {
  nodes: nodes.map(node => {
    return { name: node.Node }
  }),
  edges
}

const app = express()
app.set('view engine', 'pug')
app.use(express.static('public'))
app.get('/', (req, res) => res.render('index', { data }))

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`App listening on port ${port}!`))