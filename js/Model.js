// data and operations

"use strict";

var App = App || {};

var Model = function() {
    var censusTractsData = [], lotsData = [], parksData = [], greenRoofsData = [], cuampData = [], historicSitesData = [], schoolData = [], servicesData = [], safePassagesData = [],
        overviewDemographicsData = [];
    var serviceTypes = ['BN', 'EC', 'ED', 'EM', 'FS', 'HW', 'HH', 'VP', 'YE'];
    var cuampGreenSpaceTypes = ['gs-community-garden', 'gs-school-garden', 'gs-urban-farm', 'gs-other'];


    function loadCensusTractsData() {
        // $.ajax({
        //     url: "https://data.cityofchicago.org/resource/74p9-q2aq.geojson?$where=commarea in('67','68')",
        //     type: "GET",
        //     data: {
        //         "$limit" : 5000,
        //         // "$$app_token" : "YOURAPPTOKENHERE"
        //     }
        // }).done(function(data) {
        //     censusTractsData.push(data);
        //     $(document).trigger('loadCensus');
        // });

        d3.queue()
            .defer(d3.json, "data/census-tracts.geojson")
            .defer(d3.json, "data/demographics.json")
            .await(combineData);

        d3.json('data/overview_demographics.json', function(data){
            overviewDemographicsData.push(data);
            // console.log(data);
        })
    }


    function combineData(error, tractsData, demogrData){
        // console.log('tracts', tractsData);
        // console.log('demographics data', demogrData);

        censusTractsData.push(tractsData);
        $(document).trigger('loadCensus');

        for(var i = 0; i < tractsData.features.length; i++) {
            for(var j = 0; j < demogrData.length; j++) {
                if (tractsData.features[i].properties.geoid10 === demogrData[j]['year_2017'].geoid) {
                    censusTractsData[0].features[i].properties['demographics'] = demogrData[j];
                    break;
                }
            }//inner loop
        }//outer loop
    }


    function loadLotsData() {
        d3.json("data/lots.geojson", function(d){
           lotsData.push(d);
        });

        // console.log(lotsData);
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
        // console.log(safePassagesData);
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

        console.log(filteredServices);
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
        console.log(servicesData);
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


    function getDemographicsData() {
        console.log(censusTractsData[0]);
        return censusTractsData[0];
    }


    function getOverviewDemographicsData() {
        return overviewDemographicsData[0];
    }


    function computePercentChange(data, baseYear) {
        console.log('computing percent change...');
        // console.log(data);

        var result = {
            race: {},
            age_gender: {
                total:{},
                female: {},
                male: {}
            },
            income: {
            }
        };

        var old = data['year_' + baseYear];

        var counter = 0;

        for (var prop in data){
            if(prop === 'year_' + baseYear) continue;

            //percent change for race
            var raceData = data[prop].race.one_race;

            for (var race in raceData){
                if(counter === 0) result.race[race] = [];

                var temp = {
                    year: prop.split('_')[1],
                    pct_change: pctChange(raceData[race], old.race.one_race[race]),
                    pop_share: popShare(raceData[race], data[prop].total_population)
                };

                result.race[race].push(temp);
            }//for


            //percent change for income
            var incomeData = data[prop].income.income_groups;

            for (var incomeGroup in incomeData){
                if(counter === 0) result.income[incomeGroup] = [];

                var temp = {
                    year: prop.split('_')[1],
                    pct_change: pctChange(incomeData[incomeGroup], old.income.income_groups[incomeGroup]),
                    pop_share: popShare(incomeData[incomeGroup], data[prop].income.total_households)
                };

                result.income[incomeGroup].push(temp);
            }//for


            //percent change for age-gender: total
            var ageGenderData = data[prop].age_gender.total;

            for (var ageGroup in ageGenderData){
                if(counter === 0) result.age_gender.total[ageGroup] = [];

                var temp = {
                    year: prop.split('_')[1],
                    pct_change: pctChange(ageGenderData[ageGroup], old.age_gender.total[ageGroup]),
                    pop_share: popShare(ageGenderData[ageGroup], data[prop].age_gender.total_population_female + data[prop].age_gender.total_population_male)
                };

                result.age_gender.total[ageGroup].push(temp);
            }//for

            //percent change for age-gender: female
            var ageGenderData = data[prop].age_gender.female;

            for (var ageGroup in ageGenderData){
                if(counter === 0) result.age_gender.female[ageGroup] = [];

                var temp = {
                    year: prop.split('_')[1],
                    pct_change: pctChange(ageGenderData[ageGroup], old.age_gender.female[ageGroup]),
                    pop_share: popShare(ageGenderData[ageGroup], data[prop].age_gender.total_population_female + data[prop].age_gender.total_population_male)
                };

                result.age_gender.female[ageGroup].push(temp);
            }//for

            //percent change for age-gender: male
            var ageGenderData = data[prop].age_gender.male;

            for (var ageGroup in ageGenderData){
                if(counter === 0) result.age_gender.male[ageGroup] = [];

                var temp = {
                    year: prop.split('_')[1],
                    pct_change: pctChange(ageGenderData[ageGroup], old.age_gender.male[ageGroup]),
                    pop_share: popShare(ageGenderData[ageGroup], data[prop].age_gender.total_population_female + data[prop].age_gender.total_population_male)
                };

                result.age_gender.male[ageGroup].push(temp);
            }//for

            counter = 1;
        }//for


        // console.log('result', result);
        return result;
    }


    function computePopShare(data){
        var result = {
            race: {},
            age_gender: {
                total:{},
                female: {},
                male: {}
            },
            income: {
            }
        };

        var counter = 0;

        for (var prop in data){
            //population share for race
            var raceData = data[prop].race.one_race;

            for (var race in raceData){
                if(counter === 0) result.race[race] = [];

                var temp = {
                    year: prop.split('_')[1],
                    pop_share: popShare(raceData[race], data[prop].total_population)
                };

                result.race[race].push(temp);
            }//for


            //population share for income
            var incomeData = data[prop].income.income_groups;

            for (var incomeGroup in incomeData){
                if(counter === 0) result.income[incomeGroup] = [];

                var temp = {
                    year: prop.split('_')[1],
                    pop_share: popShare(incomeData[incomeGroup], data[prop].income.total_households)
                };

                result.income[incomeGroup].push(temp);
            }//for

            //population share for age-gender: total
            var ageGenderData = data[prop].age_gender.total;

            for (var ageGroup in ageGenderData){
                if(counter === 0) result.age_gender.total[ageGroup] = [];

                var temp = {
                    year: prop.split('_')[1],
                    pop_share: popShare(ageGenderData[ageGroup], data[prop].age_gender.total_population_female + data[prop].age_gender.total_population_male)
                };

                result.age_gender.total[ageGroup].push(temp);
            }//for

            //population share for age-gender: female
            var ageGenderData = data[prop].age_gender.female;

            for (var ageGroup in ageGenderData){
                if(counter === 0) result.age_gender.female[ageGroup] = [];

                var temp = {
                    year: prop.split('_')[1],
                    pop_share: popShare(ageGenderData[ageGroup], data[prop].age_gender.total_population_female )
                };

                result.age_gender.female[ageGroup].push(temp);
            }//for

            //population share for age-gender: male
            var ageGenderData = data[prop].age_gender.male;

            for (var ageGroup in ageGenderData){
                if(counter === 0) result.age_gender.male[ageGroup] = [];

                var temp = {
                    year: prop.split('_')[1],
                    pop_share: popShare(ageGenderData[ageGroup], data[prop].age_gender.total_population_male)
                };

                result.age_gender.male[ageGroup].push(temp);
            }//for

            counter = 1;
        }//for

        return result;
    }


    function popShare(value, total){
        var result;

        result = (value / total) * 100;

        return parseFloat(result.toFixed(2));
    }


    function pctChange(newValue, oldValue){
        var result = 0;

        var diff = newValue - oldValue;

        if(diff === 0 || oldValue === 0){
            return 0;
        }

        result = (diff / oldValue) * 100;

        return parseFloat(result.toFixed(2));
    }


    return {
        loadCensusTractsData: loadCensusTractsData,
        loadLotsData: loadLotsData,
        loadGreenSpacesData: loadGreenSpacesData,
        loadHistoricSitesData: loadHistoricSitesData,
        loadSchoolData: loadSchoolData,
        loadServicesData: loadServicesData,
        loadSafePassagesData: loadSafePassagesData,
        // loadDemographicsData: loadDemographicsData,
        getOverviewDemographicsData: getOverviewDemographicsData,
        getGreenSpaceData: getGreenSpaceData,
        getHistoricSitesData: getHistoricSitesData,
        getSchoolData: getSchoolData,
        getServiceData: getServiceData,
        getSafePassagesData: getSafePassagesData,
        getCensusTractsData: getCensusTractsData,
        getLotsData: getLotsData,
        getFilteredServices: getFilteredServices,
        getFilteredGreenSpaces: getFilteredGreenSpaces,
        getDemographicsData: getDemographicsData,
        computePercentChange: computePercentChange,
        computePopShare: computePopShare,
        pctChange: pctChange
    }

};