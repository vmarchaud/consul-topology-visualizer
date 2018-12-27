'use strict'

const fetchJSON = async (url) => {
  const res = await fetch(url)
  return res.json()
};

const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const interpolateColor = (color1, color2, weight) => {
  var w1 = weight;
  var w2 = 1 - w1;
  return rgbToHex(Math.round(color1[0] * w1 + color2[0] * w2),
    Math.round(color1[1] * w1 + color2[1] * w2),
    Math.round(color1[2] * w1 + color2[2] * w2));
}

const isSameEdge = (edge1, edge2) => {
  return edge1.target === edge2.target && edge1.source === edge2.source
}

const prepareJSON = (subject) => {
  return "<code style='white-space: pre;'>"
    + JSON.stringify(subject, undefined, 4)
    + "</code>"
}

const loadingDialog = (enable) => {
  $('#modal-title').html("Loading");
  $('#modal-body').html('Data is loading');

  // show the things
  if (enable) {
    $('#modal-window-code').modal('show');
  } else {
    $('#modal-window-code').modal('hide');
  }
};

var main = async () => {
  loadingDialog(true);
  let data = await fetchJSON("/data")
  loadingDialog(false);

  // build the actual graph
  const sigmaInstance = window.graph = new sigma({
    graph: {
      nodes: data.nodes.map((node, index, nodes) => {
        return {
          label: node.id,
          id: node.id,
          x: Math.cos(Math.PI * 2 * index / nodes.length),
          y: Math.sin(Math.PI * 2 * index / nodes.length),
          metadata: node.metadata,
          size: 10,
          color: node.metadata.offline ? "red" : "#4CC40B"
        }
      }),
      edges: data.edges.map((edge, index, edges) => {
        return {
          id: `e${index}`,
          source: edge.source,
          target: edge.target,
          metadata: edge.metadata,
          edgeLabelSize: 0,
          type: 'arrow',
          color: 'gray',
          size: 7,
          edgeLabelThreshold: 10
        }
      })
    },
    renderer: {
      container: document.getElementById('graph-container'),
      type: 'canvas'
    },
    settings: {
      edgeLabelSize: 'proportional',
      minArrowSize: 7,
      minNodeSize: 10,
      labelThreshold: 0,
      sideMargin: 0.45,
      drawLabels: false
    }
  })

  sigmaInstance.bind('overNode', (event) => {
    sigmaInstance.settings('drawLabels', true)
    const node = event.data.node
    sigmaInstance.graph.edges().filter(edge => {
      return edge.source === node.id
    }).forEach(edge => {
      edge.color = interpolateColor([220,20,60], [50,205,50], edge.metadata.distance / 1500)
      edge.size = 20
      edge.index = 10
      edge.edgeLabelSize = 10
      edge.label = `Latency: ${edge.metadata.distance}ms`
    })
    sigmaInstance.graph.edges().filter(edge => {
      return edge.source !== node.id
    }).forEach(edge => {
      edge.hidden = true
    })
    sigmaInstance.refresh()
  })

  sigmaInstance.bind('outNode', (event) => {
    sigmaInstance.settings('drawLabels', false)
    const node = event.data.node
    sigmaInstance.graph.edges().filter(edge => {
      return edge.source === node.id
    }).forEach(edge => {
      edge.color = 'grey'
      edge.size = 7
      edge.index = 1
      edge.edgeLabelSize = 0
      edge.label = undefined
    })
    sigmaInstance.graph.edges().filter(edge => {
      return edge.source !== node.id
    }).forEach(edge => {
      edge.hidden = false
    })
    sigmaInstance.refresh()
  })

  sigmaInstance.bind("clickNode", function (e) {
    var node = e.data.node

    // fill the voids
    $('#modal-title').html(node.id);
    $('#modal-body').html(prepareJSON(node.metadata));

    // show the things                
    $('#modal-window-code').modal('show');
  });

  sigmaInstance.bind("clickEdge", function (e) {
    var edge = e.data.edge;

    console.log(edge);

    // fill the voids
    $('#modal-title').html(edge.id);
    $('#modal-body').html(prepareJSON(edge.metadata));

    // show the things                
    $('#modal-window-code').modal('show');
  });
}

try {
  main()
} catch (err) {
  console.error(err);
  $('#modal-title').html("Error");
  $('#modal-body').html(prepareJSON(err));
  $('#modal-window-code').modal('show');
}

$("#show-data").click(function (e) {
  // fill the voids
  $('#modal-title').html("/check_all");
  $('#modal-body').html(prepareJSON(global_data));

  // show the things                
  $('#modal-window-code').modal('show');
});

$("#reload-graph").click(function (e) {
  window.graph.kill();
  try {
    main()
  } catch (err) {
    console.error(err);
    $('#modal-title').html("Error");
    $('#modal-body').html(prepareJSON(err));
    $('#modal-window-code').modal('show');
  }
});

// next generation realtime updating
setInterval(async _ => {
  let data = await fetchJSON("/data")
  const sigmaInstance = window.graph
  // update node that are currently in the graph
  sigmaInstance.graph.nodes().forEach(oldNode => {
    const upToDateNode = data.nodes.find(newNode => newNode.id === oldNode.id)
    // remove node that aren't here anymore
    if (!upToDateNode) {
      return sigmaInstance.graph.dropNode(oldNode.id)
    }
    oldNode.metadata = upToDateNode.metadata
  })
  sigmaInstance.graph.edges().forEach(oldEdge => {
    const upToDateEdge = data.edges.find(newEdge => isSameEdge(newEdge, oldEdge))
    // remove edge that aren't here anymore
    if (!upToDateEdge) {
      return sigmaInstance.graph.dropEdge(oldEdge.id)
    }
    oldEdge.metadata = upToDateEdge.metadata
  })
  sigmaInstance.refresh()
}, 3000)
