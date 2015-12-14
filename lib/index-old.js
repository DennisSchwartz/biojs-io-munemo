/*
 * biojs-io-munemo
 * https://github.com/DennisSchwartz/biojs-io-munemo
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

var R = require('ramda');
var Baby = require('babyparse');
var Options = {};

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
            id: input.id || 'nl' + input.node + input.layer
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



var Munemo = function ( opts ) {
    this.elements = [];

    var parseInput = function ( data ) {
        var fields = data.shift();
        var elements = this.elements;

        var sourceIndex = fields.indexOf(Options.sourceFieldLabel || 'source');
        var targetIndex = fields.indexOf(Options.targetFieldLabel || 'target');
        var layerIndices = [];
        for ( var i=0; i < fields.length; i++) {
            if ( fields[i] === ( Options.sourceFieldLabel && 'source' ) ) sourceIndex = i;
            if ( fields[i] === ( Options.targetFieldLabel && 'target' ) ) targetIndex = i;
            if ( fields[i] === ( Options.layerFieldLabel && 'layer' ) ) layerIndices.push(i);
        }



        //for ( i=0; i < data.length; i++ ) {
        //    if (!containsObj( 'layer', layerIndices[1], this.elements)
        //        }
    };
    //this.container = opts.el;
    //this.container.style.height = window.innerHeight ||
    //    document.documentElement.clientHeight || document.body.clientHeight;
    if ( opts.data ) {
        parseInput( parse(opts.data));
    }
    this.state = opts.state;
    function getElement() {

    }
    function addElement( grp, data ) {
        var add = R.curry(this.elements.push);

        if ( grp === "node" ) {
            add(createNode( data ));
        } else if ( grp === "layer" ) {
            add(createLayer( data ));
        } else if ( grp === "nodelayer" ) {
            add(createNodelayer( data ));
        } else if ( grp === "edge" ) {
            add(createEdge( data ));
        }
    }

};

function containsObj ( group, id, arr ) {
    var i;
    for ( i=0; i < arr.length; i++ ) {
        if ( arr[i].group === group && arr[i].data.id === id ) {
            return true;
        }
    }

    return false;
}

function readInput ( data ) {
    var sourceFieldLabel = Options.sourceFieldLabel || 'source';
    var targetFieldLabel = Options.targetFieldLabel || 'target';
    var layerLabel = Options.layerLabel || 'layer';
    // var data = input.data;
    // data = parse(data);
    if (Options.loglevel > 2) { console.log('The input data was parsed as: '); console.log(data); }
    var fields = data.shift();
    var sourceIndex = fields.indexOf(sourceFieldLabel);
    var targetIndex = fields.indexOf(targetFieldLabel);
    var source, targetID, target;

    //var aspects_ = [];
    //for ( var i = sourceIndex + 1; i < targetIndex; i++ ) {
    //    aspects_.push( fields[i] );
    //}

    /*
     Go through every line and build nodes, layers and nodelayers
     */

    for ( i = 0; i < data.length; i++ ) {

        var line = data[i];
        /*
         Source node
         */
        //oboe(this.elements).node({
        //    'id
        //})
        const sourceID = line[sourceIndex];
        var node = R.find(function ( el ) { return el.group === 'nodes' && el.data.id === sourceID });
        if (!node) {
            //node = new Node(sourceID);
            this.addElement( 'node', { id: sourceID } );
        }
        var obj = {};
        var lid = '';
        for (var j=sourceIndex+1;j<=sourceIndex+aspects_.length;j++) {
            obj[fields[j]] = line[j];
            lid = lid + line[j];
        }
        var layer = layers.get(lid);
        if (!layer) {
            layer = new Layer(aspects_, obj, lid);
            layers.add(layer);
        }
        var snlid = sourceID + lid;
        source = nodelayers.get(snlid);
        if (!source) {
            source = new Nodelayer(snlid, node, layer);
            nodelayers.add(source);
        }
        /*
         Target node
         */
        targetID = line[targetIndex];
        node = undefined;
        node = nodes.findWhere({id: targetID});
        if (!node) {
            node = new Node(targetID);
            nodes.add(node);
        }
        obj = {};
        lid = '';
        for (j=targetIndex+1;j<=targetIndex+aspects_.length;j++) {
            obj[fields[j]] = line[j];
            lid = lid + line[j];
        }
        layer = undefined;
        layer = layers.get(lid);
        if (!layer) {
            layer = new Layer(aspects_, obj, lid);
            layers.add(layer);
        }
        var tnlid = targetID + lid;
        target = nodelayers.get(tnlid);
        if (!target) {
            target = new Nodelayer(tnlid, node, layer);
            nodelayers.add(target);
        }
        /*
         Edge
         */
        edges.add(new Edge(source.get('id'), target.get('id')), '', snlid + '-' + tnlid);
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