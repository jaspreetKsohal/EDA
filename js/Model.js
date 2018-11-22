// data and operations

"use strict";

var App = App || {};

var Model = function() {

    var censusData = [];

    var schoolData = [], crimeData = [], servicesData = [], vacantLotsData = [], safePassagesData = [], filteredCensusData = [], aggCrimesByTract;

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

        d3.csv("data/crimes.csv", function(d){
           crimeData.push(d);
           $(document).trigger('loadCrime');
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


    function loadServicesData() {
        console.log('loading services data...');
        d3.csv("data/services.csv", function(d){
            servicesData.push(d);
            $(document).trigger('loadServices');
        });
    }


    function loadVacantLotsData() {
        d3.csv("data/Englewood_Land_Inventory.csv",function(d){
            d.forEach(function(r){
                vacantLotsData.push(r);
            });
        });

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
        return crimeData;
    }

    function getCrimesByCat() {
        
        var crimeByCat = d3.nest()
            .key(function(d) { return d.primary_type; })
            .rollup(function(v) { return v.length; })
            .entries(crimeData[0]);

        return crimeByCat;
    }

    function getCensusData() {
        // console.log('census Data');
        censusData.forEach(function(d){
            var population = d.properties.census['TOTAL_POPULATION'];
            if(population['Total'] != 0){
                filteredCensusData.push(d);
            }
        });
        return filteredCensusData;
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
        return raceTotals;
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
        return races;
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
                genAgeDist.push({'age': age, 'male': maleByAge[age], 'female': femaleByAge[age]})
            }
        }
        return genAgeDist;
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
        getBlockGenAgeDist: getBlockGenAgeDist
    }

};