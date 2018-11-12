// data and operations

"use strict";

var App = App || {};

var Model = function() {

    var schoolData = [], crimeData = [];

    function loadData() {
        d3.csv("data/schools.csv", function(d){
            schoolData.push(d);
        });
    }


    function loadCrimesData() {
        console.log('loading crimes data...');
        $.ajax({
            url: "https://data.cityofchicago.org/resource/6zsd-86xi.json?$where=community_area in('67','68')&year=2018&$where=latitude IS_NOT_NULL",
            type: "GET",
            data: {
                "$limit" : 12000
                // "$$app_token" : "YOURAPPTOKENHERE"
            }
        }).done(function(data) {
            // alert("Retrieved " + data.length + " records from the dataset!");
            crimeData.push(data);
        });
    }


    function getSchoolData(){
        return schoolData;
    }

    function getCrimeData(){
        return crimeData;
    }

    return {
        loadData: loadData,
        loadCrimesData: loadCrimesData,
        getSchoolData: getSchoolData,
        getCrimeData: getCrimeData
    }

};