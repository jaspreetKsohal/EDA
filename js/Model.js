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
    }

    function loadCensusData() {
        d3.json('data/censusData.geojson', function(error, mapData) {
            censusData = mapData.features;
            
            $(document).trigger('loadCensus');
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
        //extract race distribution here
        console.log(censusData)
        var raceTotals = censusData[0].properties.census.RACE_TOTAL_TALLIED;
        for(var item in raceTotals) {
            raceTotals[item] = 0
        }
        censusData.forEach(function(block) {
            // console.log(block);
            var raceDetails = block.properties.census.RACE_TOTAL_TALLIED
            for (var race in raceDetails) {
                raceTotals[race] = raceDetails[race] + raceTotals[race] + 0;
            }
        });
        
        return raceTotals;
    }
    

    return {
        loadData: loadData,
        loadCrimesData: loadCrimesData,
        loadCensusData: loadCensusData,
        getSchoolData: getSchoolData,
        getCrimeData: getCrimeData,
        getCensusData: getCensusData,
        getTotalRaceDist: getTotalRaceDist
    }

};