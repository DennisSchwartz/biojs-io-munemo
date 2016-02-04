/**
 * Created by ds on 03/02/16.
 */

var fs = require("fs");
var Baby = require("babyparse");
var R = require("ramda");
var munemo = require('.');


var file = fs.readFileSync('/Users/ds/Documents/Code/Thesis/BioJS/Data/slk2/Core-Human-Notch-TGF-WNT-No-TF.csv', 'utf-8');

var data = parse(file, true);

var elements = munemo( { inFormat: 'csv', data: file } );

//console.log(elements.edges);

var edges = elements.edges;
var paths = [];

// remove any within pathway interaction


for ( var i=0; i < edges.length; i++ ) {
    var src = edges[i].data.srcPath.split(',');
    var trg = edges[i].data.trgPath.split(',');
    paths.push(src); paths.push(trg);
    if (arraysEqual(src, trg)) {
        var id = edges[i].data.id;
        delete elements.elements['e' + id];
        edges = R.remove(i, 1, edges);
    }
}

var mapSplit = R.curry(R.map(function (e) {
    return e.split('(')[0];
}));


var f = R.compose(R.uniq, mapSplit, R.flatten);
paths = f(paths);


console.log(paths);

// count cross-talks



/*
    3 Nodes per layer -> Pathways
        1) Parse layers
        2) create nodes
*/

// Discard nodes without connection to relevant nodes


//var nodes = ['TGF', 'Notch', 'WNT'];
//var object = {};
//// Init object
//for ( var i=0; i < nodes.length; i++ ) {
//    object[nodes[i]] = {
//        incoming: 0,
//        outgoing: 0
//    };
//}
//
//console.log(object);
//
//var pathways = [];
//for ( i=0; i < data.length; i++ ) {
//    var row = data[i];
//    for ( var j=0; j < nodes.length; j++ ) {
//        var re = new RegExp(nodes[j]);
//        if ( row.source_pathways.match(re) )  {
//            object[nodes[j]].outgoing++;
//        }
//        if ( row.target_pathways.match(re) )  {
//            object[nodes[j]].incoming++;
//        }
//    }
//    pathways.push(row.source_pathways);
//    pathways.push(row.target_pathways);
//}
//
//console.log(object);


function parse(input, header) {
    input = input.replace(/ /g, ''); //remove whitespace
    if (!header) header = false;
    return Baby.parse(input, {
        header: header,
        skipEmptyLines: true,
        delimiter: ";"
    }).data;
}

function arraysEqual(arr1, arr2) {
    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}