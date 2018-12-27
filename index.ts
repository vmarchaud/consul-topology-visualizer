
import * as express from 'express'
import { request, Node, transformNodes } from './utils'
import { consulURI } from './conf'
import * as async from 'async'

const app = express()
app.set('view engine', 'pug')
app.use(express.static('public'))

app.get('/', (req, res) => res.render('index'))

app.get('/data', async (req, res) => {
  let data = await request(consulURI, '/v1/coordinate/nodes') as Array<any>
  const graphData = transformNodes(data)
  const nodes = await async.map(graphData.nodes, async (node: Node, next) => {
    const healthchecks = await request(consulURI, `/v1/health/node/${node.id}`) as Array<any>
    node.metadata = {}
    node.metadata.healthchecks = healthchecks
    node.metadata.offline = healthchecks.find(check => check.CheckID === 'serfHealth').Status !== 'passing'
    return next(null, node)
  })
  res.send({
    nodes,
    edges: graphData.edges
  })
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`App listening on port ${port}!`))