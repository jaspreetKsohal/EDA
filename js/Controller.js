// handles user interaction

"use strict";

var App = App || {};

var Controller = function(model, view){

    var model = model || new Model();
    var view = view || new View();

    $('.filter-option').on('click', function(event){
        // console.log(view.isLayerActive());
        var filter = event.target.id;

        $('#'+filter).toggleClass("highlight");

        if(filter === 'service'){
            if(view.isLayerActive(filter)){
                view.removeServices();
            } else {
                view.addServices(model.getServiceData()[0]);
            }
        }//if-service
        else if(filter === 'school'){
            if(view.isLayerActive(filter)){
                view.removeSchools();
            } else {
                view.addSchools(model.getSchoolData()[0]);
            }
        }//if-school
        else if(filter === 'crime'){
            if(view.isLayerActive(filter)){
                view.removeCrimes();
            } else {
                view.addCrimes(model.getCrimeData()[0]);
            }
        }//if-crime
        else if(filter === 'vacant-lot'){
            if(view.isLayerActive(filter)){
                view.removeVacantLots();
            } else {
                view.addVacantLots(model.getVacantLots());
            }
        }//if-vacant-lots
        else if(filter === 'safe-passage'){
            if(view.isLayerActive(filter)){
                view.removeSafePassages();
            } else {
                view.addSafePassages(model.getSafePassagesData());
            }
        }//if-safe-passage

    });

};