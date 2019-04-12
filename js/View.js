// presentation layer

"use strict";

var App = App || {};

var View = function(controller){

    var self = this;
    var map;
    var greenSpacesGroup, historicSitesGroup, schoolGroup, serviceGroup, vacantLotGroup, safePassageGroup, censusLayer, lotsGroup, demographicsGroup;

    var markergroup1 = L.layerGroup();
    var markergroup2 = L.layerGroup();


    var colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, 5]);


    var greenSpacesIcon = L.icon({
        iconUrl: 'images/green-spaces.svg',
        // shadowUrl: 'leaf-shadow.png',

        iconSize:     [16, 16], // size of the icon
        // shadowSize:   [50, 64], // size of the shadow
        // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        // shadowAnchor: [4, 62],  // the same for the shadow
        // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });


    var historicSitesIcon = L.icon({
        iconUrl: 'images/historic-sites.svg',
        iconSize:     [16, 16], // size of the icon
    });


    self.displayMap = function() {
        // L.mapbox.accessToken = 'pk.eyJ1IjoiamFzcHJlZXQxM3NvaGFsIiwiYSI6ImNqZzlpNjFjeDFkdXgzNG10ZGxta3QxYjAifQ.OdfMrevmS4Az30DQCEHCFg';
        // var map = L.mapbox.map('map', 'mapbox.light', {maxZoom: 18, minZoom: 0})
        //     .setView([41.7753, -87.6416], 14);

        map = L.map('map', {zoomControl: false, zoomSnap: 0.5}).setView([41.774876, -87.659901], 14.5);

        L.control.zoom({
            position:'topright'
        }).addTo(map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // var info = L.control();

        // info.onAdd = function (map) {
        //     this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        //     this._div.innerHTML = '<h4 class="info-content">Click on the data points or blocks to see details</h4>';
        //     return this._div;
        // };

        // info.addTo(map);
    };


    var style = {
        default: {
            fillColor: '#A0A0A0',
            weight: 0.3,
            color: "black"
        },
        highlight: {
            fillColor: '#A0A0A0',
            weight: 1.5,
            color: "black"
        }
    };


    self.displayCensusTracts = function(censusTractsData) {
        censusLayer = L.geoJSON(censusTractsData, {fillColor: style.default.fillColor ,weight: style.default.weight, color: style.default.color, onEachFeature: onEachFeature})
            .bindTooltip(function(layer){
                var polygon = L.polygon(layer.feature.geometry.coordinates[0]);
                var bounds = polygon.getBounds();

                //get x and y limits of the bounds
                var x_max = bounds.getEast();
                var x_min = bounds.getWest();
                var y_max = bounds.getSouth();
                var y_min = bounds.getNorth();

                var tract_text = "<b>" + layer.feature.properties.geoid10 + "</b></br>";
                return tract_text;
            });
        map.addLayer(censusLayer);
    };


    function onEachFeature(feature, layer){
        layer.on('mouseover', function(e){
            e.target.setStyle(style.highlight);
        });
        layer.on('mouseout', function (e) {
            layer.setStyle(style.default);
        });
    }


    // greenSpacesData[0] = Parks | greenSpacesData[1] = green-roofs | greenSpacesData[2] = cuamp-gardens
    self.displayGreenSpaces = function(greenSpacesData){
        $('#green-spaces-flex-item').show();

        var numberOfGreenSpaces = greenSpacesData[1].length + greenSpacesData[2].length;
        if(greenSpacesData[0].length !== 0){
            numberOfGreenSpaces += greenSpacesData[0].features.length;
        }

        $('#green-spaces-flex-item > .dataLength').text(numberOfGreenSpaces);

        greenSpacesGroup = L.featureGroup();

        if(greenSpacesData.length!= 0){
            // adding parks
            L.geoJSON(greenSpacesData[0], {fillColor: "#86cd86", weight: 0, fillOpacity: 0.7}).addTo(greenSpacesGroup)
                .bindPopup(function(layer){
                    var popup_text = "<b>"+ layer.feature.properties.park +"</b></br>" +
                        "<i>" + layer.feature.properties.park_class + "</i></br>" +
                        "Area - " + layer.feature.properties.acres + " acres</br>" +
                        "Address - " + layer.feature.properties.location;
                    return popup_text;
                });

            //adding green roofs
            greenSpacesData[1].forEach(function(r, index){
                // var latlng = L.latLng(r.latitude, r.longitude);
                // L.circle( latlng, {radius: 30, color: "#6ba46b", weight: 0, fillOpacity: 1}).addTo(greenSpacesGroup);
                L.marker([r.latitude, r.longitude], {icon: greenSpacesIcon}).addTo(greenSpacesGroup)
                    .bindPopup(
                        "<b>" + r.full_address_range + "</b></br>" +
                        "<i>" + r.type + "</i></br>" +
                        "Total Roof sqft - " + r.total_roof_sqft + "</br>" +
                        "Vegetated sqft - " + r.vegetated_sqft + "</br>" +
                        "Percent Vegetated - " + r.percent_vegetated + "%</br>"
                    );
            });

            //adding cuamp gardens
            greenSpacesData[2].forEach(function(g, index){
                // var latlng = L.latLng(g.latitude, g.longitude);
                // L.circle( latlng, {radius: 30, color: "#6ba46b", weight: 0, fillOpacity: 1}).addTo(greenSpacesGroup);
                L.marker([g.latitude, g.longitude], {icon: greenSpacesIcon}).addTo(greenSpacesGroup)
                    .bindPopup(
                        "<b>" + g.growing_site_name + "</b></br>" +
                        "<i>" + g.choose_growing_site_types + "</i></br>" +
                        getIcons(g.food_producing, g.compost_system, g.is_growing_site_dormant) + "</br>" +
                        "Address - " + g.address
                    );
            });

            map.addLayer(greenSpacesGroup);
        }


    };


    function getIcons(food_producing, compost_system, dormant){
        var icons = "";

        if(food_producing.trim() === 'true')
            icons += "<span title='Food Producing' class='icon-food-producing tooltip-icon'></span>";
        if(compost_system.trim() === 'true')
            icons += "<span title='Compost System' class='icon-compost-system tooltip-icon'></span>";
        if(dormant.trim() === 'true')
            icons += "<span title='Dormant Site' class='icon-dormant tooltip-icon'></span>";

        return icons;
    }


    self.displayHistoricSites = function(historicSitesData) {
        $('#historic-sites-flex-item').show();
        $('#historic-sites-flex-item > .dataLength').text(historicSitesData.length);

        historicSitesGroup = L.featureGroup();

        historicSitesData.forEach(function(h, index){
           // var latlng = L.latLng(h.latitude, h.longitude);
           // L.circle( latlng,{radius: 30, color: "#000", weight: 0, fillOpacity: 1}).addTo(historicSitesGroup);
            L.marker([h.latitude, h.longitude],{icon: historicSitesIcon}).addTo(historicSitesGroup)
                .bindPopup("<b>" + h.landmark_name + "</b></br>Built - " + h.date_built + "</br>By - " + h.architect + "</br>Address - " + h.address);
        });

        map.addLayer(historicSitesGroup);
    };


    self.displaySchools = function(schoolData) {
        $('#schools-flex-item').show();
        $('#schools-flex-item > .dataLength').text(schoolData.length);

        schoolGroup = L.featureGroup();

        schoolData.forEach(function(s, index){
            var latlng = L.latLng(s.Latitude, s.Longitude);
            L.circle( latlng, {radius: 30, color: '#2d97f2', weight: 0, fillOpacity: 1}).addTo(schoolGroup)
                .bindPopup("<b>" + s['Organization Name'] + " </b></br>Address: " + s['Address']);
        });

        map.addLayer(schoolGroup);
    };


    self.displayServices = function(serviceData) {
        $('#services-flex-item').show();
        $('#services-flex-item > .dataLength').text(serviceData.length);

        serviceGroup = L.featureGroup();

        serviceData.forEach(function(s){
            var latlng = L.latLng(s.latitude, s.longitude);
            L.circle(latlng, {radius: 25, color: '#e57287',weight: 0, fillOpacity: 1}).addTo(serviceGroup)
                .bindPopup("<b>" + s['name'] + "</b></br>" +
                    "<i><p class='service-description'>" + s['description'] + "</p></i></br>" +
                    "<a href='" + s['website'] + "' target='_blank'>Website</a></br>" +
                    "Address: " + s['address'] + "</br>" +
                    "Phone Number: " + "<a href='tel:" + s['phone'] + "' target='_blank'>" + s['phone'] + "</a></br>");
        });

        map.addLayer(serviceGroup);
    };


    self.displaySafePassages = function(safePassagesData){
        // $('#safe-passages-flex-item').show();

        safePassageGroup = L.featureGroup();

        safePassagesData.forEach(function(s){
            L.geoJSON(s['the_geom'], {fillColor: "#2d97f2", weight: 2}).addTo(safePassageGroup);
        });

        map.addLayer(safePassageGroup);
    };


    function lotsStyle(feature){
        var color = "";
        var lot_status = feature.properties.property_status;
        if(lot_status === 'Owned by City')
            color = "#e66101";
        else if(lot_status === 'Sold')
            color = "#5e3c99";
        else if(lot_status === 'In Acquisition')
            color = "#e6ad55";
        else
            color = "#404040";

        return {
            fillColor: color,
            weight: 0,
            fillOpacity: 0.6
        }
    }


    self.displayLots = function(lotsData){
        $('#vacant-lots-flex-item').show();

        var numSold = 0, numOwnedByCity = 0, numInAcquisition = 0, numUnknown = 0;
        lotsData[0].features.forEach(function(d){
            var propertyStatus = '';
            if(d.properties.property_status !== undefined){
                propertyStatus = (d.properties.property_status).toLowerCase().replace(/ /g,'-');
            }

            if( propertyStatus === 'sold') numSold++;
            else if (propertyStatus === 'owned-by-city') numOwnedByCity++;
            else if (propertyStatus === 'in-acquisition') numInAcquisition++;
            else numUnknown++;
        });

        $('#sold > span').text(numSold);
        $('#owned-by-city > span').text(numOwnedByCity);
        $('#in-acquisition > span').text(numInAcquisition);
        $('#unknown-status > span').text(numUnknown);

        lotsGroup = L.geoJSON(lotsData, {style: lotsStyle})
            .bindPopup(function(layer){
                var popup_text = "<b>" + layer.feature.properties.address + "</b></br>" +
                    "Status - " + layer.feature.properties.property_status + "</br>" +
                    "Area - " + layer.feature.properties.sq_ft + " sqft</br>";
                return popup_text;
            });
        map.addLayer(lotsGroup);
    };


    function dotColor(demogrType, prop) {
        var color;
        if(demogrType === 'race'){
            if(prop === 'white'){
                // color = '#6a3d9a';
                // color = '#ff4040';
                color = '#e41a1c';
            }
            else if(prop === 'black_or_african_american'){
                color = '#d3c99d';
            }
            else if(prop === 'asian'){
                color = '#2962FF';
            }
            else if(prop === 'american_indian_and_alaska_native'){
                // color = '#000';
                color = '#6200EA';
            }
            else if(prop === 'native_hawaiian_other_pacific_islander'){
                // color = '#ff7f00';
                color = '#880E4F';
            }
            else {
                color = '#455A64';
            }
        }
        else if(demogrType === 'age_gender'){
            if(prop === 'total_0_to_4'){
                color = '#2196F3';
                // color = '#fafafa';
            }
            else if(prop === 'total_5_to_14'){
                color = '#795548';
                // color = '#fafafa';
            }
            else if(prop === 'total_15_to_24'){
                color = '#E91E63';
                // color = '#fafafa';
            }
            else if(prop === 'total_25_to_54'){
                // color = '#fafafa';
                color = '#FFA726';
            }
            else if(prop === 'total_55_to_64'){
                // color = '#fafafa';
                color = '#CDDC39';
            }
            else {
                // color = '#fafafa';
                color = '#AB47BC';
            }
        }
        else if(demogrType === 'income'){
            if(prop === 'less_than_10000'){
                color = '#EF5350';
                // color =  '#e5e5e5';
            }
            else if(prop === 'bw_10000_and_24999'){
                // color = '#33a02c';
                color = '#AB47BC';
            }
            else if(prop === 'bw_25000_and_49999'){
                // color = '#e31a1c';
                color = '#5C6BC0';
            }
            else if(prop === 'bw_50000_and_99999'){
                // color = '#ff7f00';
                color = '#26C6DA';
            }
            else if(prop === 'bw_100000_and_199999'){
                // color = '#6a3d9a';
                color = '#9CCC65';
            }
            else{
                color = '#FFA726';
                // color = '#e5e5e5';
            }
        }

        return color;
    }


    self.displayDotDistribution = function(year, demogrType, data){
        console.log(year, demogrType, data);
        demographicsGroup = L.featureGroup();

        var renderer = L.canvas();

        //for each census tract
        data.features.forEach(function(d){
            // if(d.properties.geoid10 === "17031680900"){
            // console.log('polygon', d.geometry.coordinates[0]);
            var poly = turf.polygon(d.geometry.coordinates[0]);
            var polygon = L.polygon(d.geometry.coordinates[0]);
            // var polygon = turf.polygon(d.geometry.coordinates[0]);
            var bounds = polygon.getBounds();
            //
            // //get x and y limits of the bounds
            var x_max = bounds.getEast();
            var x_min = bounds.getWest();
            var y_max = bounds.getSouth();
            var y_min = bounds.getNorth();
            // console.log(x_max, x_min, y_max, y_min);

            var path = d.properties.demographics['year_' + year][demogrType];
            var data;

            if(demogrType === 'race'){
                data = path.one_race;
            }
            else if(demogrType === 'age_gender'){
                data = path.total;
            }
            else if(demogrType === 'income'){
                data = path.income_groups;
            }

            //for each property in the data
            for (var prop in data){
                // console.log(prop, data[prop]);
                var numPeople = data[prop];

                var points = {
                    type: "FeatureCollection",
                    features: []
                };
                // for(var i = 0; i < numPeople; i++){
                //     points.features.push(turf.pointOnFeature(polygon));
                // }

                for(var i = 0; i < parseInt(numPeople/2); i++){
                    var pt = turf.randomPoint(1, {bbox: [x_min, y_min, x_max, y_max]});
                    var point = turf.point([pt.features[0].geometry.coordinates[1], pt.features[0].geometry.coordinates[0]]);

                    if(turf.booleanPointInPolygon(point, poly)){
                        points.features.push(pt.features[0]);
                        // console.log('in polygon');
                    }
                    else {
                        i--;
                        // console.log('outside polygon');
                    }
                }


                // var points = turf.randomPoint(numPeople, {bbox: [x_min, y_min, x_max, y_max]});

                var color = dotColor(demogrType, prop);

                // console.log('points', points);
                points.features.forEach(function(p){
                    // console.log(p.geometry.coordinates[0], p.geometry.coordinates[1]);
                    var latLng = p.geometry.coordinates;
                    // console.log(latLng);
                    L.circle(latLng, {
                        renderer: renderer,
                        radius: 6,
                        weight: 0,
                        fillOpacity: 0.8,
                        fillColor: color
                    }).addTo(demographicsGroup);
                });//points
            }//for
            // console.log('-------------------------');
            // }
        });//for each census tract

        // console.log('demographicsGroup ', demographicsGroup);
        map.addLayer(demographicsGroup);
    };


    self.displayCircularChart = function(year, demogrType, data){
        // L.svg().addTo(map);

        data.features.forEach(function(d, index){
            //computing center of geometry
            var center = turf.center(d).geometry.coordinates; /* [longitude, latitude] */

            //adding center to the data
            data.features[index].center = center;
        });//forEach()

        // console.log(data);

        var circleSvg = d3.select('#map')
            .select('svg')
            .append('g')
            .attr('id', 'demographics-circular-charts');


        circleSvg
            .selectAll('circular-chart')
            .data(data.features)
            .enter()
            .append('circle')
                .attr('cx', function(d) {
                    // console.log(d.center);
                    return map.latLngToLayerPoint([d.center[1], d.center[0]]).x
                })
                .attr('cy', function(d) {
                    return map.latLngToLayerPoint([d.center[1], d.center[0]]).y
                })
                .attr('r', 34)
                .attr('class', 'circular-chart')
                .attr('transform' , function(d){
                    return 'rotate(45, '+ map.latLngToLayerPoint([d.center[1], d.center[0]]).x +',' + map.latLngToLayerPoint([d.center[1], d.center[0]]).y +') ';
                })
                .attr("opacity","0.6")
                .style('fill', function(d, index){
                    getSlices(index, year, demogrType, d, circleSvg);
                    return 'url(#grad'+ index +')';
                });

        map.on('moveend', updateCircularChartPosition);
        console.log(circleSvg);
    };


    function getSlices(index, year, demogrType, data, circleSvg){
        // console.log(year, demogrType, data);

        var grad = circleSvg.append("defs").append("linearGradient").attr("id", "grad" + index)
            .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");
            // .attr('gradientTransform','rotate(45,' + map.latLngToLayerPoint([data.center[1], data.center[0]]).x + ',' + map.latLngToLayerPoint([data.center[1], data.center[0]]).y + ')');

        var path = data.properties.demographics['year_' + year][demogrType];

        if(demogrType === 'race'){
            var pct_white, pct_black, pct_asian, pct_ai, pct_nh, pct_others;
            var total = path.total_one_race;

            pct_white = (path.one_race.white / total) * 100;
            pct_black = (path.one_race.black_or_african_american / total) * 100;
            pct_asian = (path.one_race.asian / total) * 100;
            pct_ai = (path.one_race.american_indian_and_alaska_native / total) * 100;
            pct_nh = (path.one_race.native_hawaiian_other_pacific_islander / total) * 100;
            pct_others = (path.one_race.others / total) * 100;

            // console.log(pct_white, pct_black, pct_asian, pct_ai, pct_nh, pct_others);
            // console.log(Math.round(pct_white), Math.round(pct_black), Math.round(pct_asian), Math.round(pct_ai), Math.round(pct_nh), Math.round(pct_others));

            // console.log(data.properties.geoid10, pct_white + pct_black + pct_asian + pct_ai + pct_nh + pct_others + "%");

            var stop1 = "0%";
            var stop2 = pct_white + "%";
            var stop3 = pct_white + pct_black + "%";
            var stop4 = pct_white + pct_black + pct_asian + "%";
            var stop5 = pct_white + pct_black + pct_asian + pct_ai + "%";
            var stop6 = pct_white + pct_black + pct_asian + pct_ai + pct_nh + "%";
            var stop7 = pct_white + pct_black + pct_asian + pct_ai + pct_nh + pct_others + "%";

            grad.append("stop").attr("offset", stop1).style("stop-color", "#D50000");
            grad.append("stop").attr("offset", stop2).style("stop-color", "#D50000");

            grad.append("stop").attr("offset", stop2).style("stop-color", "#9FA8DA");
            grad.append("stop").attr("offset", stop3).style("stop-color", "#9FA8DA");

            grad.append("stop").attr("offset", stop3).style("stop-color", "#F7B32B");
            grad.append("stop").attr("offset", stop4).style("stop-color", "#F7B32B");

            grad.append("stop").attr("offset", stop4).style("stop-color", "#A9E5BB");
            grad.append("stop").attr("offset", stop5).style("stop-color", "#A9E5BB");

            grad.append("stop").attr("offset", stop5).style("stop-color", "#880E4F");
            grad.append("stop").attr("offset", stop6).style("stop-color", "#880E4F");

            grad.append("stop").attr("offset", stop6).style("stop-color", "black");
            grad.append("stop").attr("offset", stop7).style("stop-color", "black");
        }
        else if(demogrType === 'age_gender'){

        }
        else if(demogrType === 'income'){
            var total_households = path.total_households;
            var pct_income_g1, pct_income_g2, pct_income_g3, pct_income_g4, pct_income_g5, pct_income_g6;

            pct_income_g1 = (path.income_groups.less_than_10000 / total_households) * 100;
            pct_income_g2 = (path.income_groups.bw_10000_and_24999 / total_households) * 100;
            pct_income_g3 = (path.income_groups.bw_25000_and_49999 / total_households) * 100;
            pct_income_g4 = (path.income_groups.bw_50000_and_99999 / total_households) * 100;
            pct_income_g5 = (path.income_groups.bw_100000_and_199999 / total_households) * 100;
            pct_income_g6 = (path.income_groups.more_than_200000 / total_households) * 100;

            var stop1 = "0%";
            var stop2 = pct_income_g1 + "%";
            var stop3 = pct_income_g1 + pct_income_g2 + "%";
            var stop4 = pct_income_g1 + pct_income_g2 + pct_income_g3 + "%";
            var stop5 = pct_income_g1 + pct_income_g2 + pct_income_g3 + pct_income_g4 + "%";
            var stop6 = pct_income_g1 + pct_income_g2 + pct_income_g3 + pct_income_g4 + pct_income_g5 + "%";
            var stop7 = pct_income_g1 + pct_income_g2 + pct_income_g3 + pct_income_g4 + pct_income_g5 + pct_income_g6 + "%";

            grad.append("stop").attr("offset", stop1).style("stop-color", "#D50000");
            grad.append("stop").attr("offset", stop2).style("stop-color", "#D50000");

            grad.append("stop").attr("offset", stop2).style("stop-color", "#9FA8DA");
            grad.append("stop").attr("offset", stop3).style("stop-color", "#9FA8DA");

            grad.append("stop").attr("offset", stop3).style("stop-color", "#F7B32B");
            grad.append("stop").attr("offset", stop4).style("stop-color", "#F7B32B");

            grad.append("stop").attr("offset", stop4).style("stop-color", "#A9E5BB");
            grad.append("stop").attr("offset", stop5).style("stop-color", "#A9E5BB");

            grad.append("stop").attr("offset", stop5).style("stop-color", "#880E4F");
            grad.append("stop").attr("offset", stop6).style("stop-color", "#880E4F");

            grad.append("stop").attr("offset", stop6).style("stop-color", "black");
            grad.append("stop").attr("offset", stop7).style("stop-color", "black");
        }
    }


    function updateCircularChartPosition() {
        d3.selectAll('.circular-chart')
            .attr('cx', function(d) {
                // console.log(d.center);
                return map.latLngToLayerPoint([d.center[1], d.center[0]]).x
            })
            .attr('cy', function(d) {
                return map.latLngToLayerPoint([d.center[1], d.center[0]]).y
            })
            .attr('transform' , function(d){
                return 'rotate(45, '+ map.latLngToLayerPoint([d.center[1], d.center[0]]).x +',' + map.latLngToLayerPoint([d.center[1], d.center[0]]).y +') ';
            })
    }


    self.displayRaceSummary = function(data){
        console.log('demographics data', data);
    };


    self.showContentForIndex = function(index) {
        var content = $('.story-content');
        content.empty();

        //add content according to index
        switch(index) {
            // Englewood history
            case 0: {
                content.append(
                    '<div id="step0">' +
                    '<img src="images/englewood.jpg" width="100%"/>' +
                    '<p id="step0-content" class="overlay-content">Centered around 63rd and Halsted, Englewood was a dynamic and prosperous community with ' +
                    'population of over 90,000. <br><br> It hosted major departmental stores like Sears and was the busiest shopping district outside the loop.</p>' +
                    '</div>'
                );
                break;
            }
            // englewood downfall
            case 1: {
                content.append(
                    '<div id="step1">' +
                    '<img src="images/masonic-demolished.jpg" width="100%"/>' +
                    '<p id="step1-content" class="overlay-content">However, the latter half of the 20th century witnessed the downfall of this' +
                    ' thriving community. <br><br> Due to the competition from shopping malls, 63rd and Halsted lost its fame resulting in abandonment and ' +
                    'deterioration of many shops and buildings.</p>' +
                    '</div>'
                );
                break;
            }
            // famous buidlings closed or demolished
            case 2: {
                $('.overlay').fadeOut('slow',function(){
                   var southtown = L.marker([41.779911, -87.641739]).addTo(markergroup1);
                   var masonic = L.marker([41.777750, -87.646330]).addTo(markergroup1);

                   map.addLayer(markergroup1);
                   var container1 = $('<div class="tooltip-wrapper"/>');

                   container1.on('click', '#masonic-btn', function() {
                        masonic.closePopup();
                        southtown.openPopup();
                   });

                   container1.html(
                       '<img src="images/MasonicTemple.jpg" id="masonic-temple" /> <br>' +
                       '<h2 class="tooltip-title">Masonic Temple</h2>' +
                       '<p class="tooltip-text custom-margin">An extraordinary landmark, reminder of Englewood\'s past glory. <br>Demolished in February 2018.</p> <br>' +
                       '<button id="masonic-btn" class="btn-width btn">Next</button>'
                   );

                    // map.on('popupopen', function(e) {
                    //     var px = map.project(e.popup._latlng); // find the pixel location on the map where the popup anchor is
                    //     px.y -= e.popup._container.clientHeight/2;// find the height of the popup container, divide by 2, subtract from the Y axis of marker location
                    //     map.panTo(map.unproject(px),{animate: true}); // pan to new center
                    // });

                   masonic.bindPopup(container1[0], {closeOnClick: false}).openPopup();
                   map.setView(new L.latLng(41.794124, -87.654949), 14);

                   var container2 = $('<div class="tooltip-wrapper"/>');

                   container2.on('click', '#southtown-btn', function() {
                       southtown.closePopup();
                       $('.overlay').fadeIn('slow');
                       clearInterface();
                       map.removeLayer(markergroup1);

                       map.setView(new L.latLng(41.774876, -87.656801), 14);
                       self.showContentForIndex(3);
                   });

                   container2.html(
                       '<img src="images/southtown.jpg" id="southtown" /> <br>' +
                       '<h2 class="tooltip-title">Southtown Theatre</h2>' +
                       '<p class="tooltip-text custom-margin">The phenominal Southtown Theatre, known for its grandeur and duck pond loby, was converted to discount store and ultimately ' +
                       'demolished in 1991.</p> <br>' +
                       '<button id="southtown-btn" class="btn-width btn">Next</button>'
                   );

                   southtown.bindPopup(container2[0], {closeOnClick: false, autoClose: false});

                });
                break;
            }
            // peak of crimes and poverty
            case 3: {
                content.append(
                    '<div id="step3">' +
                    '<p id="step3-content" class="overlay-content">The years that followed were marked by high crime rate and poverty. Scores of residents abandoned' +
                    ' their homes and the population dwindled to under 50,000 in the 90s. As the neighborhood continued to deteriorate, crumbling buildings and vacant ' +
                    'lots lead to more crime. <br> <br> <b> By this time Englewood and West Englewood had become a part of the most ' +
                    'notorious neighborhoods in Chicago.</b></p>' +
                    '</div>'
                );
                break;
            }
            // efforts taken: vacant lots
            case 4: {
                content.append(
                    '<div id="step4">' +
                    '<img src="images/perry-garden.jpg" width="100%"/>' +
                    '<p id="step4-content" class="overlay-content">But yet, the community has not given up. <br> <br> The last two decades have seen numerous efforts' +
                    ' taken by the residents to improve the neighborhood. Some residents have converted vacant lots into community gardens' +
                    ' and places that can be enjoyed by families. Programs like the Dollar Lot are helping the residents take the reigns in their own hands. <br><br>' +
                    '(Left) Garden of Perry Mansion Cultural Center: From Drug House to Cultural Center. </p>' +
                    '</div>'
                );
                break;
            }
            // vacant lots examples
            case 5: {
                $('.overlay').fadeOut('slow').promise().done(function() {
                    var story = true, step5 = true;
                    var position = $('#vacant-lot')[0].getBoundingClientRect();
                    var top = position.top, left = position.left;
                    var width = position.width, height = position.height;
                    var topPos = height/2 + top, leftPos = width/2 + left;
                    var filtersWidth = $('.filters')[0].getBoundingClientRect().width;

                    $('body').append('<div id="pulse" class="pulsating-circle"></div>');

                    $('.pulsating-circle').css({top: topPos, left: leftPos, width: '50px', height: '50px'});

                    $('body').append('<div id="selectVacantLots" class="instructions-tooltip"> Select the Vacant-Lots filter</div>');

                    $('#selectVacantLots').css({top: topPos, left: filtersWidth + 10});

                    $('td').on('click', function() {
                        if(story && step5){
                            var filter = $(event.currentTarget).find(':first-child').attr('id');
                            if(filter == 'vacant-lot' && story){
                                $('#pulse').remove();
                                $('#selectVacantLots').remove();
                                var yale = L.marker([41.774570, -87.631220]).addTo(markergroup2);
                                var honroe = L.marker([41.777210, -87.669770]).addTo(markergroup2);

                                map.addLayer(markergroup2);

                                var container1 = $('<div class="tooltip-wrapper"/>');

                                container1.on('click', '#honroe', function() {
                                    honroe.closePopup();
                                    yale.openPopup();
                                });

                                container1.html(
                                    '<img src="images/peaceGarden.jpg" width="100%" height="100%" id="honroe" /> <br>' +
                                    '<h2 class="tooltip-title">Vacant Lot to Community Garden</h2> ' +
                                    '<p class="tooltip-text custom-margin"><i>"litter filled lot transformed into vibrant source of food, healing and connection ' +
                                    'to self, community and earth."</i></p>' +
                                    '<p class="tooltip-text custom-margin"><b>- I Grow Chicago</b>, a nonprofit community organization in Englewood</p> <br>' +
                                    '<button id="honroe" class="btn-width btn">Next</button>'
                                );

                                honroe.bindPopup(container1[0], {closeOnClick: false,  autoClose: false}).openPopup();
                                map.setView(new L.latLng(41.795978, -87.654860), 14);

                                var container2 = $('<div class="tooltip-wrapper"/>');

                                container2.on('click', '#yale', function() {
                                    step5 = false;
                                    yale.closePopup();

                                    map.removeLayer(markergroup2);
                                    map.setView(new L.latLng(41.774876, -87.656801), 14);

                                    $('#numberVacantLots').remove();
                                    $('#vacant-lot').parent().removeClass('highlight');
                                    map.removeLayer(vacantLotGroup);

                                    var schoolPos = $('#school')[0].getBoundingClientRect();
                                    var crimePos = $('#crime')[0].getBoundingClientRect();
                                    var passagePos = $('#safe-passage')[0].getBoundingClientRect();

                                    clearInterface();
                                    var schoolTop = schoolPos.height / 2 + schoolPos.top,
                                        schoolLeft = schoolPos.width / 2 + schoolPos.left,
                                        crimeTop = crimePos.height / 2 + crimePos.top,
                                        crimeLeft = crimePos.width / 2 + crimePos.left,
                                        passageTop = passagePos.height / 2 + passagePos.top,
                                        passageLeft = passagePos.width / 2 + passagePos.left;

                                    $('body').append('<div id="schools-pulse" class="pulsating-circle"></div>');
                                    $('body').append('<div id="crimes-pulse" class="pulsating-circle"></div>');
                                    $('body').append('<div id="passages-pulse" class="pulsating-circle"></div>');

                                    $('#schools-pulse').css({top: schoolTop, left: schoolLeft, width: '50px', height: '50px'});
                                    $('#crimes-pulse').css({top: crimeTop, left: crimeLeft, width: '50px', height: '50px'});
                                    $('#passages-pulse').css({top: passageTop, left: passageLeft, width: '50px', height: '50px'});

                                    $('body').append('<div id="selectFilters" class="instructions-tooltip"> Select the Schools, Crimes and Safe-Passages filter</div>');

                                    $('#selectFilters').css({top: crimeTop, left: filtersWidth + 10});

                                    var filtersSelected=[], step6 = true;
                                    $('td').on('click', function(){
                                       if(story && step6){
                                           var filter = $(event.currentTarget).find(':first-child').attr('id');

                                           if(filter == 'crime' || filter == 'safe-passage' || filter == 'school') {
                                               if(!filtersSelected.includes(filter)) {
                                                   filtersSelected.push(filter);
                                               }
                                               else {
                                                   var index = filtersSelected.indexOf(filter);
                                                   if (index !== -1) filtersSelected.splice(index, 1);
                                               }
                                           }

                                           if(filtersSelected.length == 3){
                                               $('#schools-pulse').remove();
                                               $('#crimes-pulse').remove();
                                               $('#passages-pulse').remove();
                                               $('#selectFilters').remove();
                                               story = false;
                                               step6 = false;

                                               $('body').append(
                                                   '<div id="step6"><div>' +
                                                        '<h2 class="tooltip-title">Safe Passage Program</h2>' +
                                                        '<p class="tooltip-text">This program not only allows safe passage to students to and from schools but also provides ' +
                                                        'opportunities to parents and residents to get involved in the community as a safe passage worker.</p>' +
                                                        '<button id="passage" class="btn-width btn">Next</button>' +
                                                   '</div></div>'
                                               );

                                               $('#step6').css({top: filtersWidth/2, left: filtersWidth + 60});

                                               $('#passage').on('click', function(){
                                                    clearInterface();

                                                   $('#step6').remove();
                                                   $('.overlay').fadeIn('slow');
                                                   self.showContentForIndex(6);
                                               });
                                           }//if

                                       }//if-story

                                    });
                                });

                                container2.html(
                                    '<img src="images/YaleApartments.jpg" width="100%" height="100%" id="yale" /> <br>' +
                                    '<h2 class="tooltip-title">Yale Building</h2>' +
                                    '<p class="tooltip-text custom-margin">Lot of work went into restoring this building which now serves as home to ' +
                                    'senior citizens.  It features a large, open atrium and sprawling glass arcade that fills the building with natural light. ' +
                                    'A remarkable example of transformation.</p><br>' +
                                    '<button id="yale" class="btn-width btn">Next</button>'
                                );

                                yale.bindPopup(container2[0], {closeOnClick: false, autoClose: false});
                            }
                        }
                    });
                });
                break;
            }
            //call to action
            case 6: {
                $('#next').remove();
                content.append(
                    '<div id="call-to-action">' +
                    '<p id="final-step-content" class="overlay-content">Safe passages and community gardens represent the resiliency of Englewood residents. Despite these efforts, Englewood residents continue to deal with high levels of violence. The killing of kids, sound of gunshots, and the sometimes helplessness of mothers to protect their children is aggravating Englewood\'s conditions.  <br> <br>' +
                    'Crimes can happen anywhere, what is required is a collective effort by you and the entire community. <br><br>' +
                    'Imagine what would Englewood be if all the vacant lots were repurposed, if not few passages but all the passages were safe. That is what we have to aim for. <br> <br>' +
                    '<span class="text-highlight">So, Will Englewood be brought back to life again?</span>' +
                    '<br><br><button id="final-step-btn" class="explore-btn btn">Explore!</button> </p>' +
                    '</div>'
                );

                $('#final-step-btn').on('click', function(){
                    $('.overlay').fadeOut('slow');
                });
                break;
            }
        }
    };


    var publiclyAvailable = {
        initialize: function(){
            self.displayMap();
        },

        addCensusTracts: function(censusTractsData){
          self.displayCensusTracts(censusTractsData);
        },

        addGreenSpaces: function(greenSpacesData){
          self.displayGreenSpaces(greenSpacesData);
        },

        removeGreenSpaces: function(){
            $('#green-spaces-flex-item').hide();
            map.removeLayer(greenSpacesGroup);
        },

        addHistoricSites: function(historicSitesData){
            self.displayHistoricSites(historicSitesData);
        },

        removeHistoricSites: function(){
            $('#historic-sites-flex-item').hide();
            map.removeLayer(historicSitesGroup);
        },

        addServices: function(serviceData){
            self.displayServices(serviceData);
        },

        removeServices: function(){
            $('#services-flex-item').hide();
            map.removeLayer(serviceGroup);
        },

        addSchools: function(schoolData){
            self.displaySchools(schoolData);
        },

        removeSchools: function(){
           $('#schools-flex-item').hide();
            map.removeLayer(schoolGroup);
        },

        addSafePassages: function(safePassagesData){
          self.displaySafePassages(safePassagesData);
        },

        removeSafePassages: function(){
            // $('#safe-passages-flex-item').hide();
          map.removeLayer(safePassageGroup);
        },

        addLots: function(lotsData){
            self.displayLots(lotsData);
        },

        removeLots: function(){
            $('#vacant-lots-flex-item').hide();
            map.removeLayer(lotsGroup);
        },

        addDemographicsData: function(year, demogrType, data){
            // self.displayDotDistribution(year, demogrType, data);
            self.displayCircularChart(year, demogrType, data);
        },

        removeDemographics: function() {
            // map.removeLayer(demographicsGroup);
            console.log('removing demographics data');
            d3.select('#demographics-circular-charts').remove();
        },

        showRaceSummary: function(data) {
            self.displayRaceSummary(data);
        },

        showContentForIndex: function(index) {
            self.showContentForIndex(index);
        },

        isLayerActive: function(layer){
            if(layer === 'green-spaces')
                return map.hasLayer(greenSpacesGroup);
            else if(layer === 'historic-sites')
                return map.hasLayer(historicSitesGroup);
            else if(layer === 'school')
                return map.hasLayer(schoolGroup);
            else if(layer === 'service')
                return map.hasLayer(serviceGroup);
            else if(layer === 'vacant-lots')
                return map.hasLayer(lotsGroup);
            else if(layer === 'demographics')
                return map.hasLayer(demographicsGroup);
            else
                return map.hasLayer(safePassageGroup);
        },

        isDemogrTypeActive: function(){
            var temp = d3.select('#map').select('#demographics-circular-charts');
            return temp.empty();
        }

    };


    return publiclyAvailable;
};