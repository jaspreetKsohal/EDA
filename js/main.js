"use strict";

// Get or create application global variable
var App = App || {};

// IIFE to initialize main entry of the application
(function(){

    App.start = function(){
        console.log('application started');

        var model = new Model();
        var view = new View();
        var controller = new Controller(model, view);

        view.initialize();
        model.loadData();

    };

}) ();