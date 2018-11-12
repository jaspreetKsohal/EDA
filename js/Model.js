// data and operations

"use strict";

var App = App || {};

var Model = function() {

    var schoolData = [], crimeData = [];
    var censusData = [];

    function loadData() {
        d3.csv("data/schools.csv", function(d){
            schoolData.push(d);
        });
        d3.json('censusData.geojson', function(error, mapData) {
            var censusData = mapData.features;
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
    
    function getCensusData() {
        return censusData;
    }

    function getTotalRaceDist() {
        console.log(censusData);
    }

    return {
        loadData: loadData,
        loadCrimesData: loadCrimesData,
        getSchoolData: getSchoolData,
        getCrimeData: getCrimeData,
        getCensusData: getCensusData,
        getTotalRaceDist: getTotalRaceDist
    }

};