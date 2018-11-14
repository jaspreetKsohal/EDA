// data and operations

"use strict";

var App = App || {};

var Model = function() {

    var schoolData = [], crimeData = [], servicesData = [], vacantLotsData = [], safePassagesData = [];

    function loadData() {
        d3.csv("data/schools.csv", function(d){
            schoolData.push(d);
        });
    }


    function loadCrimesData() {
        console.log('loading crimes data...');
        $.ajax({
            url: "https://data.cityofchicago.org/resource/6zsd-86xi.json?year=2018&$where=community_area in('67','68') AND latitude IS NOT NULL",
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


    function loadServicesData() {
        console.log('loading services data...');
        d3.csv("data/services.csv", function(d){
            servicesData.push(d);
        });
    }


    function loadVacantLotsData() {
        d3.csv("data/Englewood_Land_Inventory.csv",function(d){
            d.forEach(function(r){
                vacantLotsData.push(r);
            });
            // d.forEach(function(r){
            //     if(r.community_area === 'ENGLEWOOD' || r.community_area === "WEST ENGLEWOOD"){
            //         vacantLots.push(r);
            //     }
            // });
        });

        d3.csv("data/West_Englewood_Land_Inventory.csv", function(d){
            d.forEach(function(r){
                vacantLotsData.push(r);
            });
            // d.forEach(function(r){
            //     if(r.community_area === 'ENGLEWOOD' || r.community_area === "WEST ENGLEWOOD") {
            //         vacantLots.push(r);
            //     }
            // });
        });
    }


    function loadSafePassagesData() {
        $.ajax({
            url: "https://data.cityofchicago.org/resource/v3t6-2wdk.json?$where=within_box(the_geom,41.793634,-87.679810,41.751014,-87.625162)",
            type: "GET",
            data: {
                "$limit" : 12000
                // "$$app_token" : "YOURAPPTOKENHERE"
            }
        }).done(function(data) {
            // alert("Retrieved " + data.length + " records from the dataset!");
            // console.log(data);
            safePassagesData.push(data);
        });

    }


    function getSchoolData(){
        return schoolData;
    }

    function getCrimeData(){
        return crimeData;
    }

    function getServiceData(){
        return servicesData;
    }

    function getVacantLots(){
        return vacantLotsData;
    }

    function getSafePassagesData(){
        return safePassagesData[0];
    }

    return {
        loadData: loadData,
        loadCrimesData: loadCrimesData,
        loadServicesData: loadServicesData,
        loadVacantLotsData: loadVacantLotsData,
        loadSafePassagesData: loadSafePassagesData,
        getSchoolData: getSchoolData,
        getCrimeData: getCrimeData,
        getServiceData: getServiceData,
        getVacantLots: getVacantLots,
        getSafePassagesData: getSafePassagesData
    }

};