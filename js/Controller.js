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

        if(filter === 'school'){
            if(view.isLayerActive(filter)){
                view.removeSchools();
            } else {
                view.addSchools(model.getSchoolData()[0]);
            }
        }//if-school
        else if(filter === 'crime'){
            if(view.isLayerActive(filter)){

            } else {
                view.addCrimes(model.getCrimeData()[0]);
            }
        }//if-crime
    });

    $(document).ready(function() {
        // total race dist from the model
        view.showRaceDist(model.getTotalRaceDist())
    });
};