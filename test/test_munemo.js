/*
 * biojs-io-munemo
 * https://github.com/DennisSchwartz/biojs-io-munemo
 *
 * Copyright (c) 2015 Dennis Schwartz
 * Licensed under the MIT license.
 */

// chai is an assertion library
var chai = require('chai');
var R = require('ramda');
var Mplexnet = require('mplexnet').Network;
var fs = require('fs');
var time = require('node-tictoc');

// @see http://chaijs.com/api/assert/
var assert = chai.assert;

// register alternative styles
// @see http://chaijs.com/api/bdd/
chai.expect();
chai.should();

// requires your main app (specified in index-old.js)
var munemo = require('../');

describe('biojs-io-munemo module', function(){
    describe('Functional network generation', function () {
        var elements;
        before(function () {
            elements = munemo({
                inFormat: 'csv',
                data: 'source,layer,target,layer \n A,1,A,2 \n B,1,B,2 \n C,1,C,2 \n D,1,D,2 \n \
                A,1,C,1 \n B,1,C,1 \n B,1,D,1 \n C,1,D,1 \n A,2,B,2 \n B,2,D,2 \n C,2,A,2 \n C,2,D,2'
            });
        });
        it ('should do sth', function () {
            chai.expect(elements).to.be.defined;
        });
        //it ('should contain 12 edges', function () {
        //    var edges = R.filter(function (e) { return e.group === 'edge'; }, elements);
        //    chai.expect(edges.length).to.equal(12);
        //});
        //it ('should contain 4 nodes', function () {
        //    var nodes = R.filter(function (e) { return e.group === 'node'; }, elements);
        //    chai.expect(nodes.length).to.equal(4);
        //});
        //it ('should contain 8 node-layers', function () {
        //    var nodelayers = R.filter(function (e) { return e.group === 'nodelayer'; }, elements);
        //    chai.expect(nodelayers.length).to.equal(8);
        //});
        //it ('should contain 2 layers', function () {
        //    var layers = R.filter(function (e) { return e.group === 'layer'; }, elements);
        //    chai.expect(layers.length).to.equal(2);
        //})
    })
});

describe('speed comparison mplexnet - munemo', function () {
    var file;
    var file2;
    var file3, file4;
    var fileMunemo;
    before(function () {
        // get the File
        //fileMunemo = fs.readFileSync('test/5000-munemo.csv');
        //time.tic();
        file = fs.readFileSync('test/signalink1.csv', 'utf-8');
        file2 = fs.readFileSync('/Users/ds/Documents/Code/Thesis/BioJS/Data/slk2/Elegans-Notch-TGF-WNT-No-TF.csv', 'utf-8');
        file3 = fs.readFileSync('/Users/ds/Documents/Code/Thesis/BioJS/Data/slk2/Human-Notch-TGF-WNT-No-TF.csv', 'utf-8');
        file4 = fs.readFileSync('/Users/ds/Documents/Code/Thesis/BioJS/Data/slk2/Human-AllPW-ExOnly-NoTF.csv', 'utf-8');
        console.log("Read File");
        console.log(file);
        //time.toc();
    });
    it ('should compare time', function () {
        // Create the network with mplexnet
        time.tic();
        //var mplexnet = new Mplexnet({ options: { inputFormat: 'csv'} , data: file });
        console.log('Mplexnet: ');
        time.toc();
        time.tic();
        var elements = munemo( { inFormat: 'csv', data: file } );
        console.log('Munemo: ');
        console.log('Number of elements: ' + Object.keys(elements).length);
        time.toc();
        console.log(elements.func.createNode({ id: "test", label: "tras"}));
        console.log(elements);
    });
    it ('should provide functions to return sum of edge weights', function () {
        var elements = munemo( { inFormat: 'csv', data: file3 } );
        //console.log(elements.elements);

        //console.log(elements.func.getWeights());
    });
    it ('should work faster with sparse matrices', function () {
        var network = munemo( { inFormat: 'csv', data: file2 } );
        network.func.createMultiplexAdjacencyArray();
        network.func.calcVertexDegrees();
        chai.assert(true);
    });
    /*it('give me a demo dataset', function () {
        var demo = munemo( { inFormat: 'csv', data: 'source, layer, target, layer\n\
A, 1, B, 1\n\
A, 1, C, 1\n\
A, 1, D, 1\n\
A, 1, E, 1\n\
A, 1, F, 1\n\
B, 1, C, 1\n\
B, 1, D, 1\n\
B, 1, E, 1\n\
B, 1, F, 1\n\
C, 1, D, 1\n\
C, 1, E, 1\n\
C, 1, F, 1\n\
D, 1, E, 1\n\
D, 1, F, 1\n\
E, 1, F, 1\n\
A, 2, B, 2\n\
A, 2, C, 2\n\
A, 2, D, 2\n\
A, 2, E, 2\n\
A, 2, F, 2\n\
B, 2, C, 2\n\
B, 2, D, 2\n\
B, 2, E, 2\n\
B, 2, F, 2\n\
C, 2, D, 2\n\
C, 2, E, 2\n\
C, 2, F, 2\n\
D, 2, E, 2\n\
D, 2, F, 2\n\
E, 2, F, 2\n\
A, 1, A, 2\n\
B, 1, B, 2\n\
C, 1, C, 2\n\
D, 1, D, 2\n\
E, 1, E, 2\n\
F, 1, F, 2'});
        console.log(JSON.stringify(demo));
    })*/
});
