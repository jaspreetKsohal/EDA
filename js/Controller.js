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

            if(view.isLayerActive()){
                view.removeSchools();
            }
            else{
                view.plotSchools(model.getSchoolData()[0]);
            }
        }//if-school
    });

};