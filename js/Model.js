// data and operations

"use strict";

var App = App || {};

var Model = function() {

    var censusData = [];

    var schoolData = [], crimeData = [], servicesData = [], vacantLotsData = [], safePassagesData = [], filteredCensusData = [], aggCrimesByTract, serviceTaxonomy = [];
    var serviceTypes = ['BN', 'EC', 'ED', 'EM', 'FS', 'HW', 'HH', 'VP', 'YE'];

    function loadData() {
        d3.csv("data/schools.csv", function(d){
            schoolData.push(d);
            $(document).trigger('loadSchool');
        });
    }


    function loadCensusData() {
        d3.json('data/censusData.geojson', function(error, mapData) {
            censusData = mapData.features;
            
            $(document).trigger('loadCensus');
            addCrimesToCensus(aggCrimesByTract);
        });
    }


    function loadCrimesData() {
        console.log('loading crimes data...');

        d3.csv("data/crimes2017.csv", function(d){
           crimeData.push(d);
           $(document).trigger('loadCrime');
           getCrimesDayVsHours(crimeData[0]);
           aggCrimesByTract = getCrimesPerTract(crimeData[0]);

        });
        // $.ajax({
        //     url: "https://data.cityofchicago.org/resource/6zsd-86xi.json?year=2018&$where=community_area in('67','68') AND latitude IS NOT NULL",
        //     type: "GET",
        //     data: {
        //         "$limit" : 5000         //change the limit back to 12000
        //         // "$$app_token" : "YOURAPPTOKENHERE"
        //     }
        // }).done(function(data) {
        //     // alert("Retrieved " + data.length + " records from the dataset!");
        //     crimeData.push(data);
        //     $(document).trigger('loadCrime');
        //     $(document).trigger('getTract');
        // });
    }


    // $(document).on('getTract',function(e){
    //     // console.log('crimes pre loaded',crimes);
    //     // if(!crimes){
    //         // console.log('could not find local storage item');
    //         getCrimesCensusTract(crimeData[0]);
    //     // }
    // });


    // const urls = [];
    // var tractData = [];
    // function getCrimesCensusTract(cData){
    //     console.log('getting census tracts...');
    //     var len = cData.length;
    //
    //     for(var i = 0; i < len; i++){
    //         (function(i){
    //             console.log(i);
    //             var lat = cData[i].latitude;
    //             var lng = cData[i].longitude;
    //             // var url = "https://geo.fcc.gov/api/census/block/find?latitude=" + lat + "&longitude=" + lng + "&format=json";
    //             var url = "https://www.broadbandmap.gov/broadbandmap/census/block?latitude=" + lat + "&longitude=" + lng + "&format=json";
    //             urls.push(url);
    //         })(i);
    //     }//for
    //
    //     Promise.all(urls.map(url =>
    //         fetch(url).then(resp => resp.json())
    //     )).then(texts => {
    //         // texts.map((text, index) => tractData.push({tract: text.Block.FIPS.slice(-10), i: index}));
    //         texts.map((text, index) => tractData.push({tract: text.Results.block[0].FIPS.slice(-10), i: index}));
    //     }).then(() => {
    //         addTract(tractData);
    //         aggCrimesByTract = getCrimesPerTract(crimeData[0]);
    //         // // localStorage.setItem('crimes',JSON.stringify(crimeData[0]));
    //         // console.log(aggCrimesByTract);
    //         addCrimesToCensus(aggCrimesByTract);
    //     });
    // }//getCrimesCensusTract()


    function addCrimesToCensus(crimes){
        censusData.forEach(function(census){
            //reset the no of crimes for each block to 0
            census.properties.noOfCrimes = 0;
            crimes.forEach(function(crime){
                if(crime.key == census.properties.tract_bloc){
                    census.properties.noOfCrimes = crime.value;
                }//if
            })//forEach-crime
        });//forEach-census

        console.log('added crimes to census');
    }

    // function addTract(data){
    //     data.forEach(function(d){
    //         crimeData[0][d.i].c_tract = d.tract;
    //     });
    //
    // }


    function getCrimesPerTract(data){
        var temp = d3.nest()
            .key(function(d) {
                // console.log(d);
                return d.c_tract;
            })
            .rollup(function(v) { return v.length; })
            .entries(data);

        return temp;
    }


    function nearestHour(date) {

        date.setHours(date.getHours() + Math.round(date.getMinutes()/60));
        date.setMinutes(0);

        // console.log('after',date);
        return date;
    }

    function getCrimesDayVsHours(data){
        var tParameter = [];
        data.forEach(function(d){
           var date = new Date(d.date);
            // console.log('before',date);
           var day = date.getDay() == 0? 7 : date.getDay();

           var hour = nearestHour(date).getHours() == 0? 24: nearestHour(date).getHours();

           var value = 1;

           tParameter.push({day: day, hour: hour, value: value});
        });

        //sorting first by day and then by hour
        tParameter.sort(
            function(a,b){
                if (a.day==b.day){
                    return (a.hour-b.hour);
                } else {
                    return (a.day-b.day);
                }
            });
        // console.log(tParameter);

        var aggData = d3.nest()
            .key(function(d) { return d.day; })
            .key(function(t) { return t.hour; })
            .rollup(function(v) { return v.length; })
            .entries(tParameter);

        // console.log(aggData);

        //flattening aggData
        var filteredData = [];
        aggData.forEach(function(d){
            var day = d.key;

            d.values.forEach(function(v){
                filteredData.push({day: +day, hour: +v.key, value: +v.value});
            });
        });

        return filteredData;
    }

    function getCrimesDayVsMonth(data) {
        var tParameter = [];
        data.forEach(function(d){
            var date = new Date(d.date);
            // console.log('before',date);
            var day = date.getDay() == 0? 7 : date.getDay();

            var month = date.getMonth() + 1;

            var value = 1;

            tParameter.push({day: day, month: month, value: value});
        });

        //sorting first by day and then by hour
        tParameter.sort(
            function(a,b){
                if (a.day==b.day){
                    return (a.month-b.month);
                } else {
                    return (a.day-b.day);
                }
            });
        // console.log(tParameter);

        var aggData = d3.nest()
            .key(function(d) { return d.day; })
            .key(function(t) { return t.month; })
            .rollup(function(v) { return v.length; })
            .entries(tParameter);

        // console.log(aggData);

        //flattening aggData
        var filteredData = [];
        aggData.forEach(function(d){
            var day = d.key;

            d.values.forEach(function(v){
                filteredData.push({day: +day, month: +v.key, value: +v.value});
            });
        });

        return filteredData;
    }

    function getBlockCrimeData(block) {
        var filteredCrimes = [];
        crimeData[0].forEach(function(c){
            if(c.c_tract == block){
                filteredCrimes.push(c);
            }//if
        })//forEach
        return filteredCrimes;
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


    function loadVacantLotsData() {
        d3.csv("data/Englewood_Land_Inventory.csv",function(d){
            d.forEach(function(r){
                vacantLotsData.push(r);
            });
            console.log('vacant lots', vacantLotsData);
        });

        // d3.json("data/WestEnglewoodLandInventory.json",function(d){
        //     d.forEach(function(r){
        //         vacantLotsData.push(r);
        //     });
        //     console.log('vacant lots', vacantLotsData);
        // });
        d3.csv("data/West_Englewood_Land_Inventory.csv", function(d){
            d.forEach(function(r){
                vacantLotsData.push(r);
            });
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
            safePassagesData.push(data);
        });

    }


    function getSchoolData(){
        return schoolData;
    }

    function getCrimeData(){
        return crimeData[0];
    }

    function getCrimesByCat(block) {
        //filter by block
        if(block) {
            var crimes = crimeData[0].filter(function (d) { return d.c_tract == block})
        } else {
            var crimes = crimeData[0];
        }     
        var crimeByCat = d3.nest()
            .key(function(d) { return d.primary_type; })
            .rollup(function(v) { return v.length; })
            .entries(crimes);

        crimeByCat.sort(function(a, b){
            return b.value-a.value
        })
        crimeByCat.splice(10);
        return crimeByCat;
    }

    function getCrimeTimeline() {
        var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");
        var format = d3.timeFormat("%Y-%m-%dT%H");
        crimeData[0].forEach(function(c) {
            c.parsedDate = format(parseDate(c.date));
        });
        var crimeTl = d3.nest()
            .key(function(d) { return d.parsedDate; })
            .rollup(function(v) { return v.length; })
            .entries(crimeData[0]);
        
        return crimeTl
    }

    function getCensusData() {
        // console.log(censusData);
        return censusData;
        
    }

    function getDateFilteredCrime(dateRange) {
        //filter the crimes data
        var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");
        var filtCrimes = crimeData[0].filter(function (d) { return parseDate(d.date) > dateRange["start"] & parseDate(d.date) < dateRange["end"]; })
        //aggregate by block
        var aggFiltCrimes = getCrimesPerTract(filtCrimes);
        //add to census data
        //return census data
        addCrimesToCensus(aggFiltCrimes);
        return censusData;
    }

    function getTotalRaceDist() {
        //extract race distribution here
        
        var raceTotalsDict = censusData[0].properties.census.RACE_TOTAL_TALLIED;
        for(var item in raceTotalsDict) {
            raceTotalsDict[item] = 0
        }
        censusData.forEach(function(block) {
            // console.log(block);
            var raceDetails = block.properties.census.RACE_TOTAL_TALLIED;
            for (var race in raceDetails) {
                raceTotalsDict[race] = raceDetails[race] + raceTotalsDict[race] + 0;
            }
        });
        var raceTotals = [];
        for(var item in raceTotalsDict) {
            if(item != 'Total') {
                var obj = {'race': item, 'count': raceTotalsDict[item]};
                // obj[item] = raceTotalsDict[item];
                raceTotals.push(obj);
            }
        }
        // raceTotals.sort(function(a, b){
        //     return a.count-b.count;
        // })
        console.log(shortenNames(raceTotals));
        return shortenNames(raceTotals);
    }

    function getTotalGenderAgeDist() {
        var ageGroups = censusData[0].properties.census['SEX_BY_AGE_(FEMALE)'];
        var totalDist = []
        for (var age in ageGroups) {
            if(age != 'Total') {
                totalDist.push({'age': age, 'male': 0, 'female': 0})
            }
        }
        
        censusData.forEach(function(block) {
            // console.log(block);
            var femaleByAge = block.properties.census['SEX_BY_AGE_(FEMALE)'];
            var maleByAge = block.properties.census['SEX_BY_AGE_(MALE)'];            
            totalDist.forEach(function(item) {
                item.female = item.female + femaleByAge[item.age]
                item.male = item.male + maleByAge[item.age]
            });
        });

        totalDist.forEach(function(a) {
            a.age = a.age.replace(' years', '');
        });
        return totalDist;
    }

    function getBlockRaceDist(blockNum) {
        // per block
        var selectedblock = censusData.find(obj => {
            return obj.properties.tract_bloc == blockNum
        });
        var blockRaces = selectedblock.properties.census.RACE_TOTAL_TALLIED;
        var races = [];
        for(var item in blockRaces) {
            if(item != 'Total') {
                var obj = {'race': item, 'count': blockRaces[item]};
                // obj[item] = raceTotalsDict[item];
                races.push(obj);
            } else {
                if(blockRaces[item] == 0)
                    return;
            }
        }
        // races.sort(function(a, b){
        //     return a.count-b.count;
        // })
        return shortenNames(races);
    }

    function getBlockGenAgeDist(blockNum) {
        var selectedblock = censusData.find(obj => {
            return obj.properties.tract_bloc == blockNum
        });
        var femaleByAge = selectedblock.properties.census['SEX_BY_AGE_(FEMALE)'];
        var maleByAge = selectedblock.properties.census['SEX_BY_AGE_(MALE)'];
        var genAgeDist = [];
        for (var age in femaleByAge) {
            if(age != 'Total') {
                genAgeDist.push({'age': age.replace('years', ''), 'male': maleByAge[age], 'female': femaleByAge[age]})
            }
        }
        return genAgeDist;
    }

    function shortenNames(races) {
        races.forEach(function(item) {
            if(item.race == "White alone or in combination with one or more other races") 
                item.race = "White";
            else if(item.race == "Black or African American alone or in combination with one or more other races") 
                item.race = "Black or African American";
            else if(item.race == "American Indian and Alaska Native alone or in combination with one or more other races") 
                item.race = "American Indian and Alaska Native";
            else if(item.race == "Asian alone or in combination with one or more other races") 
                item.race = "Asian";
            else if(item.race =="Native Hawaiian and Other Pacific Islander alone or in combination with one or more other races")
                item.key = "Native Hawaiian and Other Pacific Islander";
            else if(item.race == "Some Other Race alone or in combination with one or more other races")
                item.race = "Other";
        });
        return races;
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
        getCrimesByCat: getCrimesByCat,
        loadCensusData: loadCensusData,
        getTotalGenderAgeDist: getTotalGenderAgeDist,
        getCensusData: getCensusData,
        getTotalRaceDist: getTotalRaceDist,
        loadServicesData: loadServicesData,
        loadVacantLotsData: loadVacantLotsData,
        loadSafePassagesData: loadSafePassagesData,
        getSchoolData: getSchoolData,
        getCrimeData: getCrimeData,
        getServiceData: getServiceData,
        getVacantLots: getVacantLots,
        getSafePassagesData: getSafePassagesData,
        getBlockRaceDist: getBlockRaceDist,
        getBlockGenAgeDist: getBlockGenAgeDist,
        getFilteredServices: getFilteredServices,
        getCrimeTimeline: getCrimeTimeline,
        getCrimesDayVsHours: getCrimesDayVsHours,
        getCrimesDayVsMonth: getCrimesDayVsMonth,
        getBlockCrimeData: getBlockCrimeData,
        getDateFilteredCrime: getDateFilteredCrime
    }

};