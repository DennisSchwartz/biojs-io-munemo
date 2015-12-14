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
            elements['n' + srcNode] = createNode( { id: 'n' + srcNode } );
        }
        // Source layer
        var srcLayer = line[layerIndices[0]];
        if (!elements['l' + srcLayer]) {
            elements['l' + srcLayer] = createLayer( { id: 'l' + srcLayer } )
        }
        // Create source node-layer from those two
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
        var trgLayer = line[layerIndices[0]];
        if (!elements['l' + trgLayer]) {
            elements['l' + trgLayer] = createLayer( { id: 'l' + trgLayer } )
        }
        // Create source node-layer from those two
        if (!elements['nl' + trgNode + trgLayer]) {
            elements['nl' + trgNode + trgLayer] = createNodelayer( {
                node: trgNode,
                layer: trgNode
            })
        }

        // create new edge
        if ( !elements[ 'e' + srcNode + srcLayer + trgNode + trgLayer ] ) {
            elements[ 'e' + srcNode + srcLayer  + trgNode + trgLayer ] =
                createEdge( {
                    source: 'nl' + srcNode + srcLayer,
                    target: 'nl' + trgNode +trgLayer
                })
        }


    }
    //
    //var createElement = function ( grp, id ) {
    //
    //};

    var indices = [ sourceIndex, layerIndices[0], targetIndex, layerIndices[1] ];

    // Get ids from iterating over line with indices (And generating node-layer IDs)

    // Order of element creation in each line

    var groups = [ 'nodes', 'layers', 'nodes', 'layers', 'nodelayers', 'nodelayers', 'edges' ];

    //console.log(elements);

    var nodes = Object.keys(elements).filter(function (el) {
        return elements[el].group === 'nodes';
    });
    //console.log(nodes);

    return elements;
    //}

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