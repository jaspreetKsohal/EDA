// data and operations

"use strict";

var App = App || {};

var Model = function() {
    var schoolData = [], servicesData = [], safePassagesData = [];
    var serviceTypes = ['BN', 'EC', 'ED', 'EM', 'FS', 'HW', 'HH', 'VP', 'YE'];

    function loadData() {
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


    function getSchoolData(){
        return schoolData;
    }

    function getServiceData(){
        return servicesData;
    }


    function getSafePassagesData(){
        return safePassagesData[0];
    }

    return {
        loadData: loadData,
        loadServicesData: loadServicesData,
        loadSafePassagesData: loadSafePassagesData,
        getSchoolData: getSchoolData,
        getServiceData: getServiceData,
        getSafePassagesData: getSafePassagesData,
        getFilteredServices: getFilteredServices,
    }

};