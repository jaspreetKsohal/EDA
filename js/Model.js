// data and operations

"use strict";

var App = App || {};

var Model = function() {
    var censusTractsData = [], lotsData = [], parksData = [], greenRoofsData = [], cuampData = [], historicSitesData = [], schoolData = [], servicesData = [], safePassagesData = [];
    var serviceTypes = ['BN', 'EC', 'ED', 'EM', 'FS', 'HW', 'HH', 'VP', 'YE'];
    var cuampGreenSpaceTypes = ['gs-community-garden', 'gs-school-garden', 'gs-urban-farm', 'gs-other'];


    function loadCensusTractsData() {
        $.ajax({
            url: "https://data.cityofchicago.org/resource/74p9-q2aq.geojson?$where=commarea in('67','68')",
            type: "GET",
            data: {
                "$limit" : 5000,
                // "$$app_token" : "YOURAPPTOKENHERE"
            }
        }).done(function(data) {
            censusTractsData.push(data);
            $(document).trigger('loadCensus');
        });
    }


    function loadLotsData() {
        d3.json("data/lots.geojson", function(d){
           lotsData.push(d);
        });
    }


    function loadGreenSpacesData() {
        d3.json("data/parks.geojson", function(d){
            parksData.push(d);
        });

        d3.csv("data/green-roofs.csv", function(d){
            greenRoofsData.push(d);
        });

        d3.csv("data/cuamp-gardens.csv", function(d){
            cuampData.push(d);
        });
    }


    function loadHistoricSitesData() {
        $.ajax({
            url: "https://data.cityofchicago.org/resource/fpx9-pjqk.json?$where=within_box(location,41.793634,-87.679810,41.751014,-87.625162)",
            type: "GET",
            data: {
                "$limit" : 5000,
                // "$$app_token" : "YOURAPPTOKENHERE"
            }
        }).done(function(data) {
            historicSitesData.push(data);
        });
    }


    function loadSchoolData() {
        d3.csv("data/schools.csv", function(d){
            schoolData.push(d);
            $(document).trigger('loadSchool');
        });
    }


    function loadServicesData() {
        console.log('loading services data...');
        d3.queue()
            .defer(d3.json, "data/serviceTaxonomy.json")
            .defer(d3.csv, "data/services.csv")
            .await(analyzeServices);
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
            safePassagesData.push(data);
        });

    }


    function analyzeServices(error, taxonomy, services){
        restructureServicesData(services, taxonomy);
        // console.log(servicesData);
        $(document).trigger('loadServices');
    }


    function restructureServicesData(data, taxonomy){
        console.log('restructuring services data...');
        data.forEach(function(d){
            if(d['Latitude']){
                var s = getServiceDetailsAtOrg(d, taxonomy);

                var org = {
                    name: d['Organization Name'],
                    address: d['Address'],
                    website: d['Website'],
                    phone: d['Phone Number'],
                    latitude: d['Latitude'],
                    longitude: d['Longitude'],
                    description: d['Description of Services'],
                    servicesDetails: s[1],
                    servicesOffered: s[0]
                };

                servicesData.push(org);
            }
        })
    }


    function getServiceDetailsAtOrg(org, taxonomy){
        var details = {};
        var servicesOffered = [];
        serviceTypes.forEach(function(s){
            // console.log(taxonomy[s]);
            var subServicesPresent = [];
            taxonomy[s]['children'].forEach(function(c){
                if(org[c] == 1){
                    subServicesPresent.push(c);
                }//if
            });//inner-loop
            if(subServicesPresent.length != 0) servicesOffered.push(s);
            details[s] = subServicesPresent;
        });

        return [servicesOffered, details];
    }


    function getFilteredServices(sType){
        // console.log(sType);
        var filteredServices = [];
        servicesData.forEach(function(s){
            if(sType.some(a => s['servicesOffered'].includes(a))){
                filteredServices.push(s);
            }//if
        });//loop
        return filteredServices;
    }


    function getFilteredGreenSpaces(arr){
        var filteredGreenSpaces = [[],[],[]];

        if(arr.length!= 0){
            var filteredCUAMPData = [];
            arr.forEach(function(subType){
                if(subType === 'gs-parks'){
                    filteredGreenSpaces[0] = parksData[0];
                }

                else if(subType === 'gs-green-roofs'){
                    filteredGreenSpaces[1] = greenRoofsData[0];
                }

                else if(cuampGreenSpaceTypes.includes(subType)){

                    cuampData[0].forEach(function(d){
                       if('gs-' + d['type'].toLowerCase().replace(/ /g,'-') === subType){
                           filteredCUAMPData.push(d);
                       }
                    });

                    filteredGreenSpaces[2] = filteredCUAMPData;
                }
            });//forEach
        }//if

        return filteredGreenSpaces;
    }


    function getGreenSpaceData() {
        return [parksData[0], greenRoofsData[0], cuampData[0]];
    }


    function getHistoricSitesData() {
        return historicSitesData[0];
    }


    function getSchoolData(){
        return schoolData;
    }


    function getServiceData(){
        return servicesData;
    }


    function getSafePassagesData(){
        return safePassagesData[0];
    }


    function getCensusTractsData() {
        return censusTractsData[0];
    }


    function getLotsData() {
        return lotsData;
    }


    return {
        loadCensusTractsData: loadCensusTractsData,
        loadLotsData: loadLotsData,
        loadGreenSpacesData: loadGreenSpacesData,
        loadHistoricSitesData: loadHistoricSitesData,
        loadSchoolData: loadSchoolData,
        loadServicesData: loadServicesData,
        loadSafePassagesData: loadSafePassagesData,
        getGreenSpaceData: getGreenSpaceData,
        getHistoricSitesData: getHistoricSitesData,
        getSchoolData: getSchoolData,
        getServiceData: getServiceData,
        getSafePassagesData: getSafePassagesData,
        getCensusTractsData: getCensusTractsData,
        getLotsData: getLotsData,
        getFilteredServices: getFilteredServices,
        getFilteredGreenSpaces: getFilteredGreenSpaces
    }

};