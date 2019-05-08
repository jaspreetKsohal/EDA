"use strict";

// Get or create application global variable
var App = App || {};

// IIFE to initialize main entry of the application
(function(){

    App.start = function(){
        console.log('application started');
        $('#secondary-controls-container').hide();
        var model = new Model();
        var view = new View(model);
        var controller = new Controller(model, view);


        // var totalBlocksSelected = 0;

        view.initialize();
        model.loadCensusTractsData();
        model.loadCrimesData();
        model.loadLotsData();
        model.loadHistoricSitesData();
        model.loadGreenSpacesData();
        model.loadSchoolData();
        model.loadServicesData();
        model.loadSafePassagesData();
    };

}) ();