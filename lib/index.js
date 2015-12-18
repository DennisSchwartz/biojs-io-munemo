/*
 * biojs-io-munemo
 * https://github.com/DennisSchwartz/biojs-io-munemo
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

var Baby = require('babyparse');
var R = require('ramda');
var Options = {};

var Munemo = function ( input ) {
    var elements = {};
    var nodes = [];
    var layers = [];
    var nodelayers = [];
    var edges = [];


    var data = parse(input.data);

    // console.log( data );

    //var readData = function () {
    var fields = data.shift();
    // Get indices of relevant fields
    var sourceIndex;
    var targetIndex;
    var weightIndex;
    var layerIndices = [];
    var i;
    for ( i = 0; i < fields.length; i++) {
        if ( fields[i] === ( Options.sourceFieldLabel || 'source' ) ) sourceIndex = i;
        if ( fields[i] === ( Options.targetFieldLabel || 'target' ) ) targetIndex = i;
        if ( fields[i] === ( Options.weightFieldLabel || 'weight' ) ) weightIndex = i;
        if ( fields[i] === ( Options.layerFieldLabel || 'layer' ) ) layerIndices.push(i);
    }

    // Iterate over lines of input and extract data
    for ( i = 0; i < data.length; i++ ) {
        var line = data[i];
        // Source node
        var srcNode = line[sourceIndex];
        if ( !elements.hasOwnProperty('n' + srcNode) ) {
            var newNode = createNode( { id: 'n' + srcNode } );
            elements['n' + srcNode] = newNode;
            nodes.push(newNode);
        }
        // Source layer
        var srcLayer = line[layerIndices[0]];
        if (!elements['l' + srcLayer]) {
            var newLayer = createLayer( { id: 'l' + srcLayer } );
            elements['l' + srcLayer] = newLayer;
            layers.push(newLayer);
        }
        // Create source node-layer from those two
        if (!elements['nl' + srcNode + srcLayer]) {
            var newNodeLayer = createNodelayer( {
                node: srcNode,
                layer: srcLayer
            });
            elements['nl' + srcNode + srcLayer] = newNodeLayer;
            nodelayers.push(newNodeLayer);
        }

        // Target node
        var trgNode = line[targetIndex];
        if (!elements['n' + trgNode]) {
            newNode = createNode( { id: 'n' + trgNode } );
            elements['n' + trgNode] = newNode;
            nodes.push(newNode);
        }
        // Target layer
        var trgLayer = line[layerIndices[1]];
        if (!elements['l' + trgLayer]) {
            newLayer = createLayer( { id: 'l' + trgLayer } );
            elements['l' + trgLayer] = newLayer;
            layers.push(newLayer);
        }
        // Create source node-layer from those two
        if (!elements['nl' + trgNode + trgLayer]) {
            newNodeLayer = createNodelayer( {
                node: trgNode,
                layer: trgLayer
            });
            elements['nl' + trgNode + trgLayer] = newNodeLayer;
            nodelayers.push(newNodeLayer);
        }

        // create new edge
        if ( !elements[ 'e' + srcNode + srcLayer + trgNode + trgLayer ] ) {
            var newEdge = createEdge( {
                source: 'nl' + srcNode + srcLayer,
                target: 'nl' + trgNode +trgLayer
            });
            elements[ 'e' + srcNode + srcLayer  + trgNode + trgLayer ] = newEdge;
            edges.push(newEdge);

        }


    }


    //var nodes = Object.keys(elements).filter(function (el) {
    //    return elements[el].group === 'nodes';
    //});
    //console.log(nodes);

    var network = {};
    network.elements = elements;
    network.nodes = nodes;
    network.layers = layers;
    network.nodelayers = nodelayers;
    network.edges = edges;

    /*
     Before returning the elements object,
     attach a method to emulate
     Backbones 'get()' function
     */
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
            label: input.label || ''
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
            id: input.id || input.node + input.layer
        }
    };
}

function createEdge( input ) {
    return {
        group: 'edges',
        data: {
            source: input.source, // only save id's
            target: input.target,
            id: input.id || input.source + input.target,
            weight: input.weight || 0
        }
    }
}

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