/*
 * biojs-io-munemo
 * https://github.com/DennisSchwartz/biojs-io-munemo
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

var Baby = require('babyparse');
var R = require('ramda');

var Munemo = function ( input ) {
    var elements = {};

    var data = parse(input.data);

    var readData = function () {
        var fields = data.shift();
        // Get indices of relevant fields
        var sourceIndex;
        var targetIndex;
        var layerIndices = [];
        var i;
        for ( i = 0; i < fields.length; i++) {
            if ( fields[i] === ( Options.sourceFieldLabel && 'source' ) ) sourceIndex = i;
            if ( fields[i] === ( Options.targetFieldLabel && 'target' ) ) targetIndex = i;
            if ( fields[i] === ( Options.layerFieldLabel && 'layer' ) ) layerIndices.push(i);
        }
        // Iterate over lines of input and extract data
        for ( i = 0; i < data.length; i ++ ) {
            var line = data[i];
            // Source node
            var srcNode = line[sourceIndex];
            var newNode;
            if (!elements['n' + srcNode]) {
                elements['n' + srcNode] = createNode( { id: 'n' + srcNode } );
            }
            // Source layer
            var srcLayer = line[layerIndices[0]];
            var newLayer;
            if (!elements['l' + srcLayer]) {
                elements['l' + srcLayer] = createLayer( { id: 'l' + srcLayer } )
            }
            // Create source node-layer from those two
            var newNL;
            if (!elements['nl' + srcNode + srcLayer]) {
                elements['nl' + srcNode + srcLayer] = createNodelayer( {
                    node: srcNode,
                    layer: srcNode
                })
            }
            
            // Target node
            var trgNode = line[targetIndex];
            if (!elements['n' + trgNode]) {
                elements['n' + trgNode] = createNode( { id: 'n' + trgNode } );
            }
            // Target layer

        }
        //
        //var createElement = function ( grp, id ) {
        //
        //};

        var indices = [ sourceIndex, layerIndices[0], targetIndex, layerIndices[1] ];

        // Get ids from iterating over line with indices (And generating node-layer IDs)

        // Order of element creation in each line

        var groups = [ 'nodes', 'layers', 'nodes', 'layers', 'nodelayers', 'nodelayers', 'edges' ];

    }

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
            node: input.node.id,
            layer: input.layer.id,
            id: input.id || input.node.id + input.layer.id
        }
    };
}

function createEdge( input ) {
    return {
        group: 'edges',
        data: {
            source: input.source, // only save id's
            target: input.target,
            id: input.id || input.source + '-' +input.target,
            weight: input.weight || 0
        }
    }
}


module.exports = Munemo;