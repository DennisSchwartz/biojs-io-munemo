/*
 * biojs-io-munemo
 * https://github.com/DennisSchwartz/biojs-io-munemo
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

var Baby = require('babyparse');
var R = require('ramda');
var mathjs = require('mathjs');
var Options = {
    paths: false
};

var Munemo = function ( input ) {
    var network = {};
    var elements = {};
    var nodes = [];
    var layers = [];
    var nodelayers = [];
    var edges = [];

    if (input.opts) {
        Options = input.opts;
    }

    var data = parse(input.data);

    //var readData = function () {
    var fields = data.shift();

    if ( fields !== undefined && fields !== "") {
        // Get indices of relevant fields
        var sourceIndex;
        var targetIndex;
        var weightIndex;
        var layerIndices = [];
        var srcPathIndex;
        var trgPathIndex;
        var i;
        for (i = 0; i < fields.length; i++) {
            if (fields[i] === Options.sourceFieldLabel || fields[i] === 'source_name' || fields[i] === 'source' ) sourceIndex = i;
            if (fields[i] === Options.targetFieldLabel || fields[i] === 'target_name' || fields[i] === 'target' ) targetIndex = i;
            if (fields[i] === ( Options.weightFieldLabel || 'weight' )) weightIndex = i;
            if (fields[i] === ( Options.layerFieldLabel || 'layer' )) layerIndices.push(i);
            if (fields[i] === ( 'source_pathways' )) srcPathIndex = i;
            if (fields[i] === ( 'target_pathways' )) trgPathIndex = i;
        }

        //console.log(sourceIndex);
        //console.log(targetIndex);
        //console.log(layerIndices);
        //console.log(srcPathIndex);
        // Iterate over lines of input and extract data
        for (i = 0; i < data.length; i++) {
            var line = data[i];
            // Source node
            var srcNode = line[sourceIndex];
            if (!elements.hasOwnProperty('n' + srcNode)) {
                var newNode = createNode({id: 'n' + srcNode});
                if (Options.paths) {
                    newNode.data.paths = line[srcPathIndex].split(',');
                }
                elements['n' + srcNode] = newNode;
                nodes.push(newNode);
            }
            // Source layer
            var srcLayer = line[layerIndices[0]];
            if (!elements['l' + srcLayer]) {
                var newLayer = createLayer({id: 'l' + srcLayer});
                elements['l' + srcLayer] = newLayer;
                layers.push(newLayer);
            }
            // Create source node-layer from those two
            if (!elements['nl' + srcNode + srcLayer]) {
                var newNodeLayer = createNodelayer({
                    node: srcNode,
                    layer: srcLayer
                });
                elements['nl' + srcNode + srcLayer] = newNodeLayer;
                nodelayers.push(newNodeLayer);
            }
            // Target node
            var trgNode = line[targetIndex];
            if (!elements['n' + trgNode]) {
                newNode = createNode({id: 'n' + trgNode});
                elements['n' + trgNode] = newNode;
                nodes.push(newNode);
            }
            // Target layer
            var lIndex = layerIndices.length > 1 ? layerIndices[1] : layerIndices[0];
            var trgLayer = line[lIndex];
            if (!elements['l' + trgLayer]) {
                newLayer = createLayer({id: 'l' + trgLayer});
                elements['l' + trgLayer] = newLayer;
                layers.push(newLayer);
            }
            // Create source node-layer from those two
            if (!elements['nl' + trgNode + trgLayer]) {
                newNodeLayer = createNodelayer({
                    node: trgNode,
                    layer: trgLayer
                });
                elements['nl' + trgNode + trgLayer] = newNodeLayer;
                nodelayers.push(newNodeLayer);
            }
            // Pathways
            var srcPath;
            var trgPath;
            if (Options.paths) {
                // Source pathways
                srcPath = line[srcPathIndex];
                trgPath = line[trgPathIndex];
            }
            // create new edge
            if (!elements['e' + srcNode + srcLayer + trgNode + trgLayer]) {
                var newEdge = createEdge({
                    source: 'nl' + srcNode + srcLayer,
                    target: 'nl' + trgNode + trgLayer,
                    srcPath: srcPath,
                    trgPath: trgPath
                });
                elements['e' + srcNode + srcLayer + trgNode + trgLayer] = newEdge;
                edges.push(newEdge);

            }


        }

        network.elements = elements;
        network.nodes = nodes;
        network.layers = layers;
        network.nodelayers = nodelayers;
        network.edges = edges;

    } else {
        console.log("ERROR: No data in input! Returning empty network!!");
        network.elements = elements;
        network.nodes = nodes;
        network.layers = layers;
        network.nodelayers = nodelayers;
        network.edges = edges;
    }

    network.metrics = {};
    //network.prototype.createNode = createNode;
    //network.prototype.createLayer =  createLayer;
    //network.prototype.createNodelayer = createNodelayer;
    //network.prototype.createEdge = createEdge;

    // Simple Graph measures

    var vertexCount = function () {
        return network.nodelayers.length;
    };

    var edgeCount = function () {
        return network.edges.length;
    };
    var getWeights = function (layer) {
        //    var subSet = 'init!';//network.elements;
        //    if (layer) {
        //        subSet = {};
        //        // filter just this layer.
        //        var isInLayer = function (nl) {
        //            return network.elements.elements[nl.data.target].data.layer === layer;
        //        };
        //        for (var e in network.elements.elements) {
        //            subSet = "here!";
        //            if (network.elements.elements.hasOwnProperty(e)){
        //                if (e.group === 'edges') {
        //                    subSet = "here!";
        //                    if (network.elements.elements[e.data.target].data.layer === layer) {
        //                        subSet[e.data.id] = e;
        //                    }
        //                }
        //            }
        //        }
        //    }
        //    var sum = 0;
        //    for (var o in subSet) {
        //        if (subSet.hasOwnProperty(o)) {
        //            sum += o.data.weight;
        //        }
        //    }
        //    //R.map(function (e) {
        //    //    console.log(e);
        //    //    sum += e.data.weight;
        //    //}, subSet);
        //
        //    return subSet;
    };


    /**
     * Creates an array of one sparse adjacency matrix per layer
     */
    var createMultiplexAdjacencyArray = function () {
        console.log("Calculating adjancency tensor...");
        var A = [];
        var createIdList = R.map(function (i) { return i.data['id'] });
        var layerIDs = createIdList(network.layers);
        var nodeIDs = createIdList(network.nodes);
        console.log("Created ID lists");
        for ( i = 0; i < layerIDs.length; i++ ) {
            A[i] = mathjs.zeros(network.nodes.length, network.nodes.length, 'sparse');
        }
        console.log("Matrices initialized!");
        // Get connections
        var counter = 0;
        network.edges.forEach(function (e) {
            var srcNL = network.elements[e.data.source];
            var alpha = layerIDs.indexOf('l' + srcNL.data.layer);
            var trgNL = network.elements[e.data.target];
            var A_alpha = A[alpha];
            var i = nodeIDs.indexOf('n' + srcNL.data.node);
            var j = nodeIDs.indexOf('n' + trgNL.data.node);
            A[alpha] = mathjs.subset(A_alpha, mathjs.index(i, j), e.data.weight);
            counter++;
            process.stdout.write("Creating adjacency tensor: " + ( (counter / network.edges.length) * 100 ).toFixed(2) + "% done... \r");
        });
        network.adjacencyMatrix = A;

        // create aggregated overlapping adjacency matrix
        console.log("Creating aggregated overlapping adjacency matrix...");
        var o = mathjs.zeros(A[0].size()[0], A[0].size()[1]);
        for ( i = 0; i < A.length; i++ ) {
            process.stdout.write("Adding layer " + (i + 1) + " / " + A.length + "\r");
            o = mathjs.add(o, A[i]);
        }
        console.log("\nDone!");
        // Normalize to ones and zeros:
        var t = o.map(function (value, index, matrix) {
            return value > 0 ? 1 : 0;
        });

        network.aggregatedAdjacencyMatrix = o;
        network.topologicalAdjacencyMatrix = t;
    };

    var calcVertexDegrees = function () {
        console.log("Calculating vertex degrees for nodes.");
        // Do it for nodes only
        if (!network.adjacencyMatrix) network.createMultiplexAdjacencyArray();
        var A = network.adjacencyMatrix;

        // Initialize node degrees
        for ( i = 0; i < network.nodes.length; i++ ) {
            network.nodes[i].data.degree = Array.apply(null, Array(A.length)).map(Number.prototype.valueOf,0);
            process.stdout.write("Initialising nodes: " +
                ( (i / network.nodes.length) * 100 ).toFixed(2) + "% \r");
        }

        var max = A.length * A[0].size()[0] * A[0].size()[1];
        var counter = 0;
        for ( i = 0; i < A.length; i++ ) {
            A[i].forEach(function (value, index, matrix) {
                if (value > 0) {
                    network.nodes[index[0]].data.degree[i] += value;
                    network.nodes[index[1]].data.degree[i] += value;
                    counter++;
                }
                //process.stdout.write("Calculating vertex degrees: " +
                //    ( (counter / max) * 100 ).toFixed(2) + "% \r");
            });
        }
        console.log("\nDone!");
    };

    var calcLayerStrength = function () {
        console.log("Calculating layer strengths (sum of all node degrees per layer)");
        var strength = mathjs.zeros(network.layers.length);
        network.nodes.forEach(function (n) {
            strength = mathjs.add(strength, n.data.degree);
        });
        network.metrics.layerStrength = strength;
    };

    var calcNodelayerDegrees = function (done, step) {
        network.edges.forEach(function (e) {
            var src = network.elements[e.data.source];
            var trg = network.elements[e.data.target];
            src.data.outDegree++; src.data.degree++;
            trg.data.inDegree++; trg.data.degree++;
            //step(e.data.source, e.data.target);
        });
        // ==> Update nodelayer list?
        var nl = network.nodelayers;
        var avg = 0;
        for ( var i = 0; i < nl.length; i++ ) {
            var update = network.elements['nl' + nl[i].data.id];
            nl[i] = update;
            avg += update.data.degree;
        }
        avg = avg / nl.length;
        //done(avg);
        network.metrics.averageNodelayerDegree = avg;
    };

    /**
     *  calculate Entropy of multiplex degree
     */
    var calcDegreeEntropy = function () {
        var entropy = {};
        // For each node
        for (var n = 0; n < network.nodes.length; n++ ) {
            var node = network.nodes[n];
            var o_i = R.sum(node.data.degree);
            var H_i = 0;
            // And for each layer
            for ( l = 0; l < network.layers.length; l++ ) {
                var k_ixa = node.data.degree[l];
                var frac = k_ixa / o_i;
                H_i += k_ixa > 0 ? frac * Math.log(frac) : 0;
            }
            H_i = -1 * H_i;
            node.data.H_i = H_i;
            entropy[node.data.id.substr(1)] = H_i;
        }
        network.metrics.degreeEntropy = entropy;
    };

    /**
     *  calculate the multiplex participation coefficient
     */
    var calcParticipationCoefficient = function () {
        console.log("Calculating the participation coefficients...");
        var participationCoeff = {};
        for ( var n = 0; n < network.nodes.length; n++ ) {
            var node = network.nodes[n];
            var o_i = R.sum(node.data.degree);
            var M = network.layers.length;
            var factor = M / (M-1);
            var sum = 0;
            for ( l = 0; l < network.layers.length; l++ ) {
                var k_ixa = node.data.degree[l];
                var frac = k_ixa / o_i;
                sum += Math.pow(frac, 2);
            }
            var P_i = factor * ( 1 - sum );
            node.data.P_i = P_i;
            process.stdout.write("Progress: " +
                ( (n / network.nodes.length) * 100 ).toFixed(2) + "% \r");
            participationCoeff[node.data.id.substr(1)] = P_i;
        }
                network.metrics.participationCoefficients = participationCoeff;
    };


    var calcDegreeOfMultiplexity = function () {
        /*
         One can calculate the degree of multiplexity for a multiplex network
         by counting the number of node pairs that have multiple edge types
         between them divided by the total number of adjacent node pairs [254].
         (One can analogously calculate a node’s degree of multiplexity by considering
         all pairs of a node and its neighbours.)
         */
        //var interlayer = 0;
        //var intralayer = 0;
        //network.edges.forEach(function (e) {
        //    var src = network.elements[e.data.source];
        //    var trg = network.elements[e.data.target];
        //    if ( src.data.layer === trg.data.layer ) {
        //        intralayer++;
        //    } else {
        //        interlayer++;
        //    }
        //});
        //network.degreeOfMultiplexity =
    };


    /*
     One example of this is interdependence,which is defined as the ratio of the number
     of shortest paths that traverse more than one layer to the total number of shortest
     paths [72,240]. When defining a walk o
     */


    /*
     Before returning the elements object,
     attach a method to emulate
     Backbones 'get()' function
     */

    var functions = {
        createNode: createNode,
        createLayer: createLayer,
        createNodelayer: createNodelayer,
        createEdge: createEdge,
        createMultiplexAdjacencyArray: createMultiplexAdjacencyArray,
        getEdgeCount: edgeCount,
        getVertexCount: vertexCount,
        getWeights: getWeights,
        calcVertexDegrees: calcVertexDegrees,
        calcNodelayerDegrees: calcNodelayerDegrees,
        calcLayerStrength: calcLayerStrength,
        calcDegreeEntropy: calcDegreeEntropy,
        calcParticipationCoefficient: calcParticipationCoefficient
    };


    network.func = functions;


    network.get = function ( input ) {
        // Translate the keywords
        if ( input === 'V' ) {
            input = 'nodes';
        } else if ( input === 'nodes' ) {
            input = 'nodelayers';
        }
        return network[input];
    };


    return network;

};

function createNode( input ) {
    return {
        group: 'nodes',
        data: {
            id: input.id,
            label: input.label || '',
            outDegree: 0,
            inDegree: 0,
            degree: []
        }
    };
}

function createLayer( input ) {
    return {
        group: 'layers',
        data: {
            id: input.id
        }
    }
}

function createNodelayer( input ) {
    return {
        group: 'nodelayers',
        data: {
            node: input.node,
            layer: input.layer,
            id: input.id || input.node + input.layer,
            outDegree: 0,
            inDegree: 0,
            degree: 0
        }
    };
}

function createEdge( input ) {
    return {
        group: 'edges',
        data: {
            source: input.source, // only save id's
            target: input.target,
            id: input.id || input.source.substring(2) + input.target.substring(2),
            weight: input.weight || 1,
            srcPath: input.srcPath,
            trgPath: input.trgPath,
            misc: input.misc
        }
    }
}

// Read data
function parse (input, header) {
    input = input.replace(/ /g, ''); //remove whitespace
    if (!header) header = false;
    return Baby.parse(input, {
        header: header,
        skipEmptyLines: true,
        delimiter: ";"
    }).data;
}




module.exports = Munemo;
