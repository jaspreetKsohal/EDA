// data and operations

"use strict";

var App = App || {};

var Model = function() {

    var schoolData = [];

    function loadData() {
        d3.csv("data/schools.csv", function(d){
            schoolData.push(d);
        });
    }

    function getSchoolData(){
        return schoolData;
    }

    return {
        loadData: loadData,
        getSchoolData: getSchoolData

    }

};