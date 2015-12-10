/*
 * biojs-io-munemo
 * https://github.com/DennisSchwartz/biojs-io-munemo
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

var R = require('ramda');
var Baby = require('babyparse');

var Munemo = function ( options ) {

    var format = options.inFormat;
    var data = parse(options.data, true);

    // Build edges from csv lines
    function createEdge ( line ) {
        return {
            group: 'edge',
            source: {
                node: line.source,
                layer: line.sourceLayer,
                data: line.sourceData || {}
            },
            target: {
                node: line.target,
                layer: line.targetLayer,
                data: line.targetData || {}
            },
            type: line.directed || 'undirected',
            id: line.id || line.source + line.sourceLayer + "-" + line.target + line.targetLayer
        }
    }

    // Function to create map from data
    // TODO: Remove need for double input
    var createMap = R.compose(R.zipObj, R.pluck('id'));
    var getAtt = R.compose(R.uniq, R.pluck);

    var edges = R.map(createEdge, data);
    var edgeMap = createMap(edges)(edges);

    // Extract nodelayers from edges
    var nodelayers = R.map(R.assoc('group', 'nodelayer'), R.uniq(R.concat(R.pluck('source', edges), R.pluck('target', edges))));
    R.map(function (nl) { nl.id = nl.node + nl.layer; }, nodelayers); // Add id's
    var nodelayerMap = R.zipObj(R.pluck('id', nodelayers), nodelayers);

    // Extract nodes from nodelayers
    var nodes = R.map(function (id) {
        return { group: 'node', id: id }
    }, getAtt('node', nodelayers));
    var nodeMap = createMap(nodes)(nodes);

    // Extract layers from nodelayers
    var layers = R.map(function (id) {
        return {group: 'layer', id: id}
    }, getAtt('layer', nodelayers));
    var layerMap = createMap(layers)(layers);



    // Store all as network
    var elements = R.flatten([edges, nodelayers, nodes, layers]);

    return elements;


};

// Read data
function parse (input, header) {
    input = input.replace(/ /g, ''); //remove whitespace
    if (!header) header = false;
    return Baby.parse(input, {
        header: header,
        skipEmptyLines: true
    }).data;
}


module.exports = Munemo;