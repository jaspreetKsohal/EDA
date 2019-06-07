// presentation layer

"use strict";

// import {circle} from "../leaflet/leaflet-src.esm";

var App = App || {};

var View = function(model){

    var model = model;

    var self = this;
    var map;
    var greenSpacesGroup, historicSitesGroup, schoolGroup, serviceGroup, vacantLotGroup, safePassageGroup, censusLayer, lotsGroup, demographicsGroup, crimesGroup;

    var markergroup1 = L.layerGroup();
    var markergroup2 = L.layerGroup();

    var circleRadius = 34, circleSvg;
    var legend;
    var sliderTime;

    var colorScale = d3.scaleSequential(d3.interpolateReds);
    var tooltipCrimesColorScale = d3.scaleSequential(d3.interpolateOranges);


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
        drawSlider();
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
            color: "#616161"
        },
        selected: {
            fillColor: '#A0A0A0',
            weight: 2,
            color: "#212121"
        }
    };


    self.displayCensusTracts = function(censusTractsData) {
        censusLayer = L.geoJSON(censusTractsData, {fillColor: style.default.fillColor ,weight: style.default.weight, color: style.default.color, onEachFeature: onEachFeature});
        map.addLayer(censusLayer);
    };


    var elClicked;
    function onEachFeature(feature, layer){
        layer.on('click', function(e){
            e.target.feature.properties.isSelected = true;

            if(elClicked != e.target && elClicked){
                elClicked.feature.properties.isSelected = false;
                elClicked.setStyle(style.default);
                elClicked = e.target;
            }
            else {
                elClicked = e.target;
            }

            e.target.setStyle(style.selected);
        });
        layer.on('mouseover', function(e){
            if(elClicked !== e.target){
                e.target.setStyle(style.highlight);
            }
        });
        layer.on('mouseout', function (e) {
            if(e.target.feature.properties.isSelected !== true)
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


    function getCrimesColor(data){
        var crimeTypeData = data[crimeCategory];

        var size = 0;

        if(crimeCategory === 'narcotics'){
            size = crimeTypeData.NARCOTICS.length;
        }
        else if(crimeCategory === 'non-index-crimes' || crimeCategory === 'property-crimes' || crimeCategory === 'violent-crimes'){
            for (var prop in crimeTypeData){
                size += crimeTypeData[prop].length;
            }
        }

        return colorScale(size);
    }


    function crimesStyle(feature){
        return {
            fillColor: getCrimesColor(feature.properties.crimes),
            weight: 0,
            fillOpacity: 0.7
        };
    }

    var crimeCategory;

    self.displayCrimesData = function(data, crimeType){
        // console.log('crimes data: ', data, crimeType);
        crimesGroup = L.featureGroup();
        crimeCategory = crimeType;

        var max = 0;
        data.features.forEach(function(d){
            var temp = d.properties.crimes[crimeType];

            var size = 0;
            for (var prop in temp){
                size += temp[prop].length;
            }

            if(size > max){
                max = size;
            }
        });

        $('#narcotics > span').text(getNoOfCrimes(data, 'narcotics'));
        $('#non-index-crimes > span').text(getNoOfCrimes(data, 'non-index-crimes'));
        $('#property-crimes > span').text(getNoOfCrimes(data, 'property-crimes'));
        $('#violent-crimes > span').text(getNoOfCrimes(data, 'violent-crimes'));

        colorScale.domain([0, max]);
        L.geoJson(data, {style: crimesStyle}).addTo(crimesGroup);

        crimesGroup.bindPopup(function(layer){
            // console.log(layer.feature);
            var temp = layer.feature.properties;
            var popup_text = '<b>' + temp.namelsad10 + '</b></br></br>';

            var crime = temp.crimes[crimeType];
            var total = 0;
            for(var prop in crime){
                total += crime[prop].length;
            }
            popup_text = popup_text + "Total number of " + crimeType + ": " + total + "</br>";

            if(crimeType != 'narcotics'){
                popup_text += "</br>";

                popup_text = popup_text + "<table id='tooltipCrimesTable'>";

                var maxCrimeType = 0;
                for (var prop in crime) {
                    if(crime[prop].length > maxCrimeType) maxCrimeType = crime[prop].length;
                }
                tooltipCrimesColorScale.domain([0, maxCrimeType]);

                // console.log(tooltipCrimesColorScale(22));
                for (var prop in crime){
                    var color = tooltipCrimesColorScale(crime[prop].length);

                    color = rgb2hex(color);

                    popup_text = popup_text + "<tr>" +
                        "<td>" + prop.toLowerCase() + "</td>" +
                        "<td class=\'highlight-table\' bgcolor= \'" + color + "\'>" + crime[prop].length + "</td>" +
                        "</tr>";
                }
                popup_text = popup_text + "</table>";
            }

            return popup_text;
        });

        map.addLayer(crimesGroup);
    };


    function rgb2hex(rgb){
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
        return (rgb && rgb.length === 4) ? "#" +
            ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
            ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
    }


    function getNoOfCrimes(data, crimeType) {
        // console.log(data);

        var result = 0;
        data.features.forEach(function(d){
            var temp = d.properties.crimes[crimeType];

            for (var prop in temp){
                // console.log(prop, temp[prop]);
                result += temp[prop].length;
            }
        });

        return result;
    }


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


    self.displayCircularChart = function(year, demogrType, data, genderFilter){
        // L.svg().addTo(map);

        censusLayer.bindPopup(function(layer){
            // var tract = "<b>" + layer.feature.properties.geoid10 + "</b></br>";
            //
            // tract += "<div id='tooltip-chart' class='tooltip-barcode-plot'></div>";

            var layerData = layer.feature.properties.demographics;
            // var pctChangeData = model.computePercentChange(layerData, 2010);
            var popShareData = model.computePopShare(layerData);

            var finalData;
            if(demogrType === 'age_gender') {
                finalData = popShareData[demogrType][genderFilter];
            }
            else finalData = popShareData[demogrType];

            var tooltip = drawTooltipChart('tooltip-chart', finalData, demogrType, layerData, year);

            return tooltip;
        });


        data.features.forEach(function(d, index){
            //computing center of geometry
            var center = turf.center(d).geometry.coordinates; /* [longitude, latitude] */

            //adding center to the data
            data.features[index].center = center;

        });//forEach()


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
                .attr("opacity","1")
                .style('fill', function(d, index){
                    getSlices(index, year, demogrType, d, circleSvg, genderFilter);
                    return 'url(#grad'+ index +')';
                });

        map.on('moveend', updateCircularChartPosition);
    };


    self.displayCircularChart2 = function(year, demogrType, data, genderFilter) {
        console.log('displaying Circular Chart...');
        censusLayer.bindPopup(function(layer){
            // var tract = "<b>" + layer.feature.properties.geoid10 + "</b></br>";
            //
            // tract += "<div id='tooltip-chart' class='tooltip-barcode-plot'></div>";

            var layerData = layer.feature.properties.demographics;
            // var pctChangeData = model.computePercentChange(layerData, 2010);
            var popShareData = model.computePopShare(layerData);

            var finalData;
            if(demogrType === 'age_gender') {
                finalData = popShareData[demogrType][genderFilter];
            }
            else finalData = popShareData[demogrType];

            var tooltip = drawTooltipChart('tooltip-chart', finalData, demogrType, layerData, year);

            return tooltip;
        });

        data.features.forEach(function(d, index){
            //computing center of geometry
            var center = turf.center(d).geometry.coordinates; /* [longitude, latitude] */

            //adding center to the data
            data.features[index].center = center;
        });//forEach()

        var temp = data.features[0].properties.demographics['year_'+year][demogrType];
        // console.log(temp);
        var legendData;
        if(demogrType === 'race') legendData = temp.one_race;
        else if(demogrType === 'age_gender') {
            if(genderFilter === 'total') legendData = temp.total;
            else if(genderFilter === 'male') legendData = temp.male;
            else legendData = temp.female;
        }
        else legendData = temp.income_groups;
        var legendText = [];
        for (var prop in legendData){
            legendText.push(getLegendText(prop, demogrType));
        }//for
        // console.log(legendText);

        createMapLegend2(legendText, demogrType);

        var clipPath = circleSvg.selectAll('path')
            .data(data.features)
            .enter()
            .append('clipPath')
            .attr('id', function(d) { return 'base-circle-' + d.properties.name10 })
            .append('circle')
                .attr('cx', function(d) { return  map.latLngToLayerPoint([d.center[1], d.center[0]]).x; })
                .attr('cy', function(d) { return  map.latLngToLayerPoint([d.center[1], d.center[0]]).y; })
                .attr('r', circleRadius)
                .attr('class', function(d) { return 'clip-path clip-circle-' + d.properties.name10 });

        clipPath.each(function(d){
            var pctPopShareValues = prepareCircularChartData(d, demogrType, genderFilter, year);
            shiftCircles(pctPopShareValues,
                map.latLngToLayerPoint([d.center[1], d.center[0]]).x,
                map.latLngToLayerPoint([d.center[1], d.center[0]]).y,
                demogrType, circleSvg, d.properties.name10);
        });

        map.on('moveend', function(){
            updateCircularChartPosition2(year, demogrType, data, genderFilter);
        });
    };


    function prepareCircularChartData(d, demogrType, genderFilter, year) {
        var popShareData = model.computePopShare(d.properties.demographics);
        // console.log(popShareData[demogrType]);


        var demogrTypeData;
        if(demogrType === 'age_gender'){
            demogrTypeData = popShareData[demogrType][genderFilter];
        }
        else {
            demogrTypeData = popShareData[demogrType];
        }

        // console.log('demogrTypeData', demogrTypeData);

        var pctPopShareValues = [];
        for (var prop in demogrTypeData){
            // console.log(prop, demogrTypeData[prop]);

            demogrTypeData[prop].forEach(function(i){
                if (i.year == year) pctPopShareValues.push({
                    prop: prop,
                    pop_share: i.pop_share
                });
            });
        }//for


        //sorting determines the shift by value
        if(demogrType === 'race'){
            pctPopShareValues.sort(function(x, y){
                return d3.descending(x.pop_share, y.pop_share);
            });
        }
        else if(demogrType === 'age_gender'){
            pctPopShareValues.reverse();
        }

        return pctPopShareValues;
    }


    function shiftCircles(pctPopShareValues, x1, y1, demogrType, circleSvg, tract) {
        // console.log(pctPopShareValues, x1, y1, demogrType, circleSvg, d);
        var shift = [];
        var shiftBy = 0;
        pctPopShareValues.forEach(function(value, i){
            shiftBy += (value.pop_share * (2 * circleRadius)) / 100;
            var y2 = y1 + (2 * circleRadius) - shiftBy;
            var x2 = x1;

            shift.push({
                prop: value.prop,
                pop_share: value.pop_share,
                shiftBy: shiftBy,
                x2: x2,
                y2: y2,
                latLng: map.layerPointToLatLng(L.point(x2, y2))
            })
        });

        //sorting determines the order in which the circles are drawn over each other
        if(demogrType === 'race'){
            shift.sort(function(x, y){
                return d3.ascending(x.pop_share, y.pop_share);
            });
        }
        else if(demogrType === 'income' || demogrType === 'age_gender'){
            shift.reverse();
        }

        circleSvg.selectAll('circles')
            .data(shift)
            .enter()
            .append('circle')
            .attr('cx', function(d) { return d.x2; })
            .attr('cy', function(d) { return d.y2; })
            .attr('r', circleRadius)
            .attr('class', function(d) { return 'slices slices-' + tract })
            .attr('clip-path', function() { return 'url(#base-circle-' + tract + ')' })
            .attr('fill', function(d){
                return getLegendColor(d.prop, demogrType);
            });

        d3.selectAll('.slices-' + tract)
            .attr('transform', 'rotate(45,' + x1 + ',' + y1 + ')');
    }


    function getSlices(index, year, demogrType, data, circleSvg, genderFilter){
        // console.log(year, demogrType, data);

        var grad = circleSvg.append("defs").append("linearGradient").attr("id", "grad" + index)
            .attr("x1", "0%").attr("x2", "0%").attr("y1", "100%").attr("y2", "0%");

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

            grad.append("stop").attr("offset", stop3).style("stop-color", "#5ebc97");
            grad.append("stop").attr("offset", stop4).style("stop-color", "#5ebc97");

            grad.append("stop").attr("offset", stop4).style("stop-color", "#F7B32B");
            grad.append("stop").attr("offset", stop5).style("stop-color", "#F7B32B");

            grad.append("stop").attr("offset", stop5).style("stop-color", "#880E4F");
            grad.append("stop").attr("offset", stop6).style("stop-color", "#880E4F");

            grad.append("stop").attr("offset", stop6).style("stop-color", "black");
            grad.append("stop").attr("offset", stop7).style("stop-color", "black");
        }
        else if(demogrType === 'age_gender'){
            var total_population_female = path.total_population_female;
            var total_population_male = path.total_population_male;
            var total_population = total_population_male + total_population_female;
            var pct_age_gender_g1, pct_age_gender_g2, pct_age_gender_g3, pct_age_gender_g4, pct_age_gender_g5, pct_age_gender_g6;

            var divider;
            if(genderFilter === 'total') divider = total_population;
            else if(genderFilter === 'female') divider = total_population_female;
            else if(genderFilter === 'male') divider = total_population_male;

            pct_age_gender_g1 = (path[genderFilter][genderFilter + '_0_to_4'] / divider) * 100;
            pct_age_gender_g2 = (path[genderFilter][genderFilter + '_5_to_14'] / divider) * 100;
            pct_age_gender_g3 = (path[genderFilter][genderFilter + '_15_to_24'] / divider) * 100;
            pct_age_gender_g4 = (path[genderFilter][genderFilter + '_25_to_54'] / divider) * 100;
            pct_age_gender_g5 = (path[genderFilter][genderFilter + '_55_to_64'] / divider) * 100;
            pct_age_gender_g6 = (path[genderFilter][genderFilter + '_65_and_over'] / divider) * 100;

            var stop1 = "0%";
            var stop2 = pct_age_gender_g6 + "%";
            var stop3 = pct_age_gender_g6 + pct_age_gender_g5 + "%";
            var stop4 = pct_age_gender_g6 + pct_age_gender_g5 + pct_age_gender_g4 + "%";
            var stop5 = pct_age_gender_g6 + pct_age_gender_g5 + pct_age_gender_g4 + pct_age_gender_g3 + "%";
            var stop6 = pct_age_gender_g6 + pct_age_gender_g5 + pct_age_gender_g4 + pct_age_gender_g3 + pct_age_gender_g2 + "%";
            var stop7 = pct_age_gender_g6 + pct_age_gender_g5 + pct_age_gender_g4 + pct_age_gender_g3 + pct_age_gender_g2 + pct_age_gender_g1 + "%";

            grad.append("stop").attr("offset", stop1).style("stop-color", "#291f3b");
            grad.append("stop").attr("offset", stop2).style("stop-color", "#291f3b");

            grad.append("stop").attr("offset", stop2).style("stop-color", "#594c5f");
            grad.append("stop").attr("offset", stop3).style("stop-color", "#594c5f");

            grad.append("stop").attr("offset", stop3).style("stop-color", "#897884");
            grad.append("stop").attr("offset", stop4).style("stop-color", "#897884");

            grad.append("stop").attr("offset", stop4).style("stop-color", "#a9969c");
            grad.append("stop").attr("offset", stop5).style("stop-color", "#a9969c");

            grad.append("stop").attr("offset", stop5).style("stop-color", "#c9b4b4");
            grad.append("stop").attr("offset", stop6).style("stop-color", "#c9b4b4");

            grad.append("stop").attr("offset", stop6).style("stop-color", "#e9d2cc");
            grad.append("stop").attr("offset", stop7).style("stop-color", "#e9d2cc");
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
            var stop2 = pct_income_g6 + "%";
            var stop3 = pct_income_g6 + pct_income_g5 + "%";
            var stop4 = pct_income_g6 + pct_income_g5 + pct_income_g4 + "%";
            var stop5 = pct_income_g6 + pct_income_g5 + pct_income_g4 + pct_income_g3 + "%";
            var stop6 = pct_income_g6 + pct_income_g5 + pct_income_g4 + pct_income_g3 + pct_income_g2 + "%";
            var stop7 = pct_income_g6 + pct_income_g5 + pct_income_g4 + pct_income_g3 + pct_income_g2 + pct_income_g1 + "%";

            grad.append("stop").attr("offset", stop1).style("stop-color", "#52000a");
            grad.append("stop").attr("offset", stop2).style("stop-color", "#52000a");

            grad.append("stop").attr("offset", stop2).style("stop-color", "#a50f15");
            grad.append("stop").attr("offset", stop3).style("stop-color", "#a50f15");

            grad.append("stop").attr("offset", stop3).style("stop-color", "#cb181d");
            grad.append("stop").attr("offset", stop4).style("stop-color", "#cb181d");

            grad.append("stop").attr("offset", stop4).style("stop-color", "#ef3b2c");
            grad.append("stop").attr("offset", stop5).style("stop-color", "#ef3b2c");

            grad.append("stop").attr("offset", stop5).style("stop-color", "#fb6a4a");
            grad.append("stop").attr("offset", stop6).style("stop-color", "#fb6a4a");

            grad.append("stop").attr("offset", stop6).style("stop-color", "#fcbba1");
            grad.append("stop").attr("offset", stop7).style("stop-color", "#fcbba1");
        }
    }


    function updateCircularChartPosition() {
        d3.selectAll('.circular-chart')
            .attr('cx', function(d) {
                return map.latLngToLayerPoint([d.center[1], d.center[0]]).x
            })
            .attr('cy', function(d) {
                return map.latLngToLayerPoint([d.center[1], d.center[0]]).y
            })
            .attr('transform' , function(d){
                return 'rotate(45, '+ map.latLngToLayerPoint([d.center[1], d.center[0]]).x +',' + map.latLngToLayerPoint([d.center[1], d.center[0]]).y +') ';
            })
    }


    function updateCircularChartPosition2(year, demogrType, data, genderFilter) {
        console.log('update chart positions');

        d3.selectAll('.clip-path')
            .attr('cx', function(d) {
                return map.latLngToLayerPoint([d.center[1], d.center[0]]).x
            })
            .attr('cy', function(d) {
                return map.latLngToLayerPoint([d.center[1], d.center[0]]).y
            });

        d3.selectAll('.slices').remove();

        d3.selectAll('.clip-path').each(function(d){
            var pctPopShareValues = prepareCircularChartData(d, demogrType, genderFilter, year);
            shiftCircles(pctPopShareValues,
                map.latLngToLayerPoint([d.center[1], d.center[0]]).x,
                map.latLngToLayerPoint([d.center[1], d.center[0]]).y,
                demogrType, d3.select('#demographics-circular-charts'), d.properties.name10, true);
        });

        // d3.select('#demographics-circular-charts').remove();
        // self.displayCircularChart2(year, demogrType, data, genderFilter);
    }


    self.displayOverviewPlots = function(data){
        // console.log('overview data:', data);

        // drawBarCodeChart('race-barcode-plot', data.race, 'race');
        // drawBarCodeChart('income-barcode-plot', data.income, 'income');
        // drawBarCodeChart('age-gender-barcode-plot', data.age_gender.total, 'age_gender')


        drawLineChart('income-line-plot', data.income, 'income');
        drawLineChart('age-gender-line-plot', data.age_gender.total, 'age_gender');
        drawLineChart('race-line-plot', data.race, 'race');
    };


    function drawSlider(){
        var dataTime = d3.range(0, 8).map(function(d) {
            return new Date(2010 + d, 10, 3);
        });

        sliderTime = d3
            .sliderBottom()
            .min(d3.min(dataTime))
            .max(d3.max(dataTime))
            .step(1000 * 60 * 60 * 24 * 365)
            .width(300)
            .tickFormat(d3.timeFormat('%Y'))
            .tickValues(dataTime)
            .default(new Date(2017, 10, 3))
            .on('end', val => {
                var yearSelected = d3.timeFormat('%Y')(val);
                // d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
                $(document).trigger('yearChanged', yearSelected);
            });

        var gTime = d3
            .select('div#timeSlider')
            .append('svg')
            .attr('width', 370)
            .attr('height', 100)
            .append('g')
            .attr('transform', 'translate(30,30)');

        gTime.call(sliderTime);

        // d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()));
    }


    self.updateAgeGenderPlot = function(data, filter){
        if(filter === 'male'){
            drawLineChart('age-gender-line-plot', data.age_gender.male, 'age_gender');
        }
        else if(filter === 'female') {
            drawLineChart('age-gender-line-plot', data.age_gender.female, 'age_gender');
        }
        else {
            drawLineChart('age-gender-line-plot', data.age_gender.total, 'age_gender');
        }

        // if((filter.includes('male') && filter.includes('female')) || filter.length === 0){
        //     drawBarCodeChart('age-gender-barcode-plot', data.age_gender.total, 'age_gender');
        // }
        // else if(filter.includes('female')){
        //     drawBarCodeChart('age-gender-barcode-plot', data.age_gender.female, 'age_gender');
        // }
        // else if(filter.includes('male')) {
        //     drawBarCodeChart('age-gender-barcode-plot', data.age_gender.male, 'age_gender');
        // }
    };


    // function drawTooltipChart(container, data, type){
    //     // console.log('drawing barcode chart');
    //
    //     var div = d3.create('div')
    //         .attr('id', 'tooltip-chart')
    //         .attr('class', 'tooltip-barcode-chart')
    //         .attr('width', 300)
    //         .attr('height', 200);
    //
    //     var margin = {top: 30, right: 10, bottom: 15, left: 30};
    //
    //     var constHeight = 200;
    //     var constWidth = 300;
    //
    //     var width = constWidth - margin.left - margin.right,
    //         height = constHeight - margin.top - margin.bottom;
    //
    //     var rectPadding = 10;
    //     var rectHeight = height / 6 - rectPadding;
    //     var legendWidth = 10;
    //
    //
    //     //append svg to chart container div
    //     var svg = div.append('svg')
    //         .attr('width', width + margin.left + margin.right)
    //         .attr('height', height + margin.top + margin.bottom )
    //         .attr('id', 'barcode-svg-' + type)
    //         .append('g')
    //         .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    //
    //
    //     //create x scale
    //     var xScale = d3.scaleTime().range([0, width]);
    //
    //     //define the x axis styles
    //     var xAxis = d3.axisBottom()
    //         .scale(xScale)
    //         .tickPadding(8)
    //         .ticks(5)
    //         .tickSize(0)
    //         .tickFormat(function(d) { return d * 1 + '%' });
    //
    //
    //     //defines the xscale max
    //     var min = 10, max = -10; // random initialization
    //     for (var prop in data){
    //         var min_temp = d3.min(data[prop], function(d) { return d.pct_change; });
    //         var max_temp = d3.max(data[prop], function(d) { return d.pct_change; });
    //
    //         if(min_temp < min) min = min_temp;
    //         if(max_temp > max) max = max_temp;
    //     }
    //
    //     xScale.domain([min, max]);
    //
    //     //append the x axis
    //     var xAxisGroup = svg.append('g')
    //         .attr('class', 'x-axis')
    //         .attr('transform', 'translate(' + 0 + ',' + -margin.top + ')')
    //         .call(xAxis);
    //
    //     xAxisGroup.select('.domain').attr('stroke', 'none');
    //
    //     var xAxisLabel = svg.append('text')
    //         .attr('class', 'x-axis-label')
    //         .text('Percentage Change from 2010')
    //         .attr('transform', 'translate(' + width/2 + ',' + height + ')')
    //         .attr('text-anchor', 'middle');
    //
    //
    //     var zeroLine = svg.append('line')
    //         .attr('x1', xScale(0))
    //         .attr('x2', xScale(0))
    //         .attr('y1', -10)
    //         .attr('y2', height - 10)
    //         .attr('class', 'zero-line');
    //
    //
    //     var y = 0;
    //
    //     for (var prop in data) {
    //         // console.log(prop, data[prop]);
    //
    //         var rectData = data[prop];
    //
    //         svg.append('rect')
    //             .attr('x', 0)
    //             .attr('y', y)
    //             .attr('width', width)
    //             .attr('height', rectHeight)
    //             .attr('class', 'g-rect');
    //
    //
    //         svg.append('rect')
    //             .attr('x', 0)
    //             .attr('y', y)
    //             .attr('width', legendWidth)
    //             .attr('height', rectHeight)
    //             .attr('transform', 'translate(' + -legendWidth + ',0)')
    //             .attr('class', 'g-legend')
    //             .attr('fill', getLegendColor(prop, type));
    //
    //         svg.append('text')
    //             .attr('class', 'y-axis')
    //             .attr('x', 0)
    //             .attr('y', y)
    //             .attr('transform', 'translate(' + -legendWidth + ',0)')
    //             .text(getLegendText(prop, type));
    //
    //
    //         var drawStrips = svg.selectAll('line.percent')
    //             .data(rectData)
    //             .enter()
    //             .append('line')
    //             .attr('class', function(d) { return 'g-line g-' + d.year; })
    //             .attr('x1', function(d, i) { return xScale(d.pct_change); })
    //             .attr('x2', function(d) { return xScale(d.pct_change); })
    //             .attr('y1', y)
    //             .attr('y2', y + rectHeight)
    //             .on('mouseover', function(d){
    //                 var selectedClass = (d3.select(this).attr('class')).split(' ')[1];
    //                 d3.selectAll('line.' + selectedClass)
    //                     .style('stroke', '#3D5AFE');
    //
    //                 d3.selectAll('text.' + selectedClass)
    //                     .style('fill', '#3D5AFE');
    //             })
    //             .on('mouseout', function(d){
    //                 var selectedClass = (d3.select(this).attr('class')).split(' ')[1];
    //
    //                 d3.selectAll('line.' + selectedClass)
    //                     .style('stroke', '#757575');
    //
    //                 d3.selectAll('text.' + selectedClass)
    //                     .style('fill', 'none');
    //             });
    //
    //
    //         var text = svg.selectAll('text.percent')
    //             .data(rectData)
    //             .enter()
    //             .append('text')
    //             .attr('class', function(d) { return 'g-text g-' + d.year; })
    //             .attr('x', function(d) { return xScale(d.pct_change); })
    //             .attr('y', y - 3)
    //             // .text(function(d) { return d.year + ': ' + d.pct_change + '%'; });
    //             .text(function(d) { return d.year });
    //
    //
    //         y += rectHeight + rectPadding;
    //     }//for-in
    //
    //     return div.node();
    //     // console.log('---------------------');
    // }//drawTooltipChart()


    function drawBarCodeChart(container, data, type){
        // console.log('drawing barcode chart');

        var margin = {top: 30, right: 10, bottom: 15, left: 30};

        // var constWidth = d3.select('#barcode-plot').node().clientWidth; //node() - finds the first DOM element in the selection
        // console.log($('#barcode-plot').width());

        var constHeight = $('.barcode-plot').height();
        var constWidth = 370;

        var width = constWidth - margin.left - margin.right,
            height = constHeight - margin.top - margin.bottom;

        var rectPadding = 10;
        var rectHeight = height / 6 - rectPadding;
        var legendWidth = 10;

        // console.log(d3.select('#' + container));

        //append svg to chart container div
        var svg = d3.select('#' + container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom )
            .attr('id', 'barcode-svg-' + type)
            .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        //create x scale
        var xScale = d3.scaleTime().range([0, width]);
        // var xScale = d3.scaleLog().range([0, width]);

        //define the x axis styles
        var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickPadding(8)
            .ticks(5)
            .tickSize(0)
            .tickFormat(function(d) { return d * 1 + '%' });



        //defines the xscale max
        var min = 10, max = -10; // random initialization
        for (var prop in data){
            var min_temp = d3.min(data[prop], function(d) { return d.pct_change; });
            var max_temp = d3.max(data[prop], function(d) { return d.pct_change; });

            if(min_temp < min) min = min_temp;
            if(max_temp > max) max = max_temp;
        }
        // console.log(min, max);

        if(type === 'race')  xScale.domain([-max/2, max]);
        else
            xScale.domain([min, max]);


        //append the x axis
        var xAxisGroup = svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(' + 0 + ',' + -margin.top + ')')
            .call(xAxis);

        xAxisGroup.select('.domain').attr('stroke', 'none');

        var xAxisLabel = svg.append('text')
            .attr('class', 'x-axis-label')
            .text('Percentage Change from 2010')
            .attr('transform', 'translate(' + width/2 + ',' + height + ')')
            .attr('text-anchor', 'middle');


        var zeroLine = svg.append('line')
            .attr('x1', xScale(0))
            .attr('x2', xScale(0))
            .attr('y1', -10)
            .attr('y2', height - 10)
            .attr('class', 'zero-line');


        var y = 0;

        for (var prop in data) {
                // console.log(prop, data[prop]);

            var rectData = data[prop];

            svg.append('rect')
                .attr('x', 0)
                .attr('y', y)
                .attr('width', width)
                .attr('height', rectHeight)
                .attr('class', 'g-rect');


            svg.append('rect')
                .attr('x', 0)
                .attr('y', y)
                .attr('width', legendWidth)
                .attr('height', rectHeight)
                .attr('transform', 'translate(' + -legendWidth + ',0)')
                .attr('class', 'g-legend')
                .attr('fill', getLegendColor(prop, type));

            svg.append('text')
                .attr('class', 'y-axis')
                .attr('x', 0)
                .attr('y', y)
                .attr('transform', 'translate(' + -legendWidth + ',0)')
                .text(getLegendText(prop, type));


            var drawStrips = svg.selectAll('line.percent')
                .data(rectData)
                .enter()
                .append('line')
                .attr('class', function(d) { return 'g-line g-' + d.year; })
                .attr('x1', function(d, i) { return xScale(d.pct_change); })
                .attr('x2', function(d) { return xScale(d.pct_change); })
                .attr('y1', y)
                .attr('y2', y + rectHeight)
                .on('mouseover', function(d){
                     var selectedClass = (d3.select(this).attr('class')).split(' ')[1];
                     d3.selectAll('line.' + selectedClass)
                         .style('stroke', '#3D5AFE');

                     d3.selectAll('text.' + selectedClass)
                         .style('fill', '#3D5AFE');
                })
                .on('mouseout', function(d){
                     var selectedClass = (d3.select(this).attr('class')).split(' ')[1];

                     d3.selectAll('line.' + selectedClass)
                         .style('stroke', '#757575');

                     d3.selectAll('text.' + selectedClass)
                         .style('fill', 'none');
                });


            var text = svg.selectAll('text.percent')
                .data(rectData)
                .enter()
                .append('text')
                .attr('class', function(d) { return 'g-text g-' + d.year; })
                .attr('x', function(d) { return xScale(d.pct_change); })
                .attr('y', y - 3)
                // .text(function(d) { return d.year + ': ' + d.pct_change + '%'; });
                .text(function(d) { return d.year });

            y += rectHeight + rectPadding;
        }//for-in

        // console.log('---------------------');
    }//drawBarCodeChart()


    function drawTooltipChart(container, data, type, layerDetails, year){
        // console.log('tooltip data', layerDetails);
        var finalDiv = d3.create('div')
            .attr('id', 'tooltip-container-div');

        var tooltipText;

        if(type === 'income'){
            tooltipText = "<b>" + layerDetails['year_' + year].geography.split(',')[0] + "</b>" + "</br></br>" +
                "Total Households (" + year + "): &emsp; " + layerDetails['year_' + year].income.total_households.toLocaleString() + "</br>" +
                "Median Income (2010): &emsp;&emsp; $" + layerDetails['year_' + 2010].income.median_income.toLocaleString() + "</br>" +
                "Median Income (" + year + "): &emsp;&emsp; $" + layerDetails['year_' + year].income.median_income.toLocaleString() + "</br>" +
                "<span class='tooltip-info'>(Data is by households not individuals)</span>"
        }
        else if(type === 'age_gender') {
            tooltipText = "<b>" + layerDetails['year_' + year].geography.split(',')[0] + "</b>" + "</br></br>" +
                "Total Population (" + year + "): &emsp; " + layerDetails['year_' + year].total_population.toLocaleString() + "</br>" +
                "Change since 2010: &emsp;&emsp;&emsp; " + model.pctChange(layerDetails['year_'+ year].total_population, layerDetails['year_2010'].total_population) + '%' + "</br></br>" +
                "Total Population Female (" + year + "): &emsp; " + layerDetails['year_'+year].age_gender.total_population_female.toLocaleString() + "</br>" +
                "Total Population Male (" + year + "): &emsp;&emsp; " + layerDetails['year_'+year].age_gender.total_population_male.toLocaleString() + "</br>";
        }
        else {
            tooltipText = "<b>" + layerDetails['year_' + year].geography.split(',')[0] + "</b>" + "</br></br>" +
                "Total Population (" + year + "): &emsp; " + layerDetails['year_' + year].total_population.toLocaleString() + "</br>" +
                "Change since 2010: &emsp;&emsp;&emsp; " + model.pctChange(layerDetails['year_'+ year].total_population, layerDetails['year_2010'].total_population) + '%';
        }

        // tooltip header details
        finalDiv.append('div')
            .attr('class', 'tooltip-header')
            .html(tooltipText);


        // line chart
        var div = finalDiv.append('div')
                .attr('id', 'tooltip-chart')
                .attr('class', 'tooltip-line-chart')
                .attr('width', 300)
                .attr('height', 200);

        var margin = {top: 10, right: 10, bottom: 25, left: 40};

        var constHeight = 200;
        var constWidth = 300;

        var width = constWidth - margin.left - margin.right,
            height = constHeight - margin.top - margin.bottom;

        //append svg to chart container div
        var svg = div.append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom )
            .attr('id', 'barcode-svg-' + type)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var xScale = d3.scaleTime().range([0, width]).domain([2010, 2017]);
        var yScale;

        var min = 999999, max = -10; // random initialization
        for (var prop in data){
            var min_temp = d3.min(data[prop], function(d) { return d.pop_share; });
            var max_temp = d3.max(data[prop], function(d) { return d.pop_share; });

            if(min_temp < min) min = min_temp;
            if(max_temp > max) max = max_temp;
        }//for

        if(type === 'race'){
            yScale = d3.scaleLog().range([height, 0]).domain([1e-6, max]);
            // yScale = d3.scaleLinear().range([height, 0]).domain([min, max]);
        }
        else {
            yScale = d3.scaleLinear().range([height, 0]).domain([min, max]);
        }

        var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(d3.format(""));

        const format = d3.format("");

        var yAxis = d3.axisLeft()
            .scale(yScale);
        // .tickValues([0.05, 1, 20, Math.round(max)])
        // // .tickValues(d3.scaleLinear().domain(yScale.domain()).ticks(3))
        // .tickFormat(d => format(d));


        if(type === 'race'){
            yAxis.tickValues([0.05, 1, 20, Math.round(max)])
                .tickFormat(d => format(d));
        }
        else {
            yAxis.tickSize(0)
                .ticks(6)
                .tickPadding(8)
                .tickFormat(d3.format(""));
        }


        //add x-axis
        var xAxisGroup = svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        //add y-axis
        var yAxisGroup = svg.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // text label for the y axis
        var txt = svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1.5em")
            .attr('class', 'y-axis-label')
            .style("text-anchor", "middle");


        if(type === 'income') txt.text("Share (%)");
        else txt.text("Population Share (%)");

        yAxisGroup.select('.domain').attr('stroke', 'none');
        yAxisGroup.selectAll(".tick line")
            .attr("stroke", "#E0E0E0")
            .attr("x2", width);
        // .attr("stroke-dasharray", "2,2");

        var lineGenerator = d3.line()
            .x(function(d) { return xScale(d.year) })
            .y(function(d) {
                // console.log(d.pop_share, yScale(d.pop_share));
                if(yScale(d.pop_share) === Infinity){
                    return height;
                }
                else return yScale(d.pop_share)
            });


        // for each line do the following
        for (var prop in data){
            var propData = data[prop];
            // console.log(prop, data[prop]);

            svg.append('path')
                .data([propData])
                .attr('class', function(d) { return 'g-line g-' + prop })
                .attr('stroke', function(d) {
                    return getLegendColor(prop, type);
                })
                .attr('d', lineGenerator)
        }//for

        return finalDiv.node();
    }


    function drawLineChart(container, data, type){
        var margin = {top: 10, right: 10, bottom: 25, left: 40};

        var constHeight = $('.demogr-plot').height() - 40;
        var constWidth = 370;


        var legendText = [];
        var min = 999999, max = -10; // random initialization
        for (var prop in data){
            var min_temp = d3.min(data[prop], function(d) { return d.pop_share; });
            var max_temp = d3.max(data[prop], function(d) { return d.pop_share; });

            if(min_temp < min) min = min_temp;
            if(max_temp > max) max = max_temp;
            legendText.push(getLegendText(prop, type));
        }//for


        //legend
        d3.select('#' + container).append('div')
            .attr('class', function() { return 'legend legend-' + type });

        var legend = d3.select('.legend-' + type).selectAll('legend')
            .data(legendText)
            .enter()
            .append('div')
            .attr('class', 'legend-component');

        var p = legend.append('p')
            .attr('class', 'demogr-sub-type');
        p.append('span')
            .attr("class","key-dot")
            .style("background", function(d) { return getLegendColor(d.toLowerCase(), type) });
        p.insert("text")
            .text(function(d,i) { return d } );


        var width = constWidth - margin.left - margin.right,
            height = constHeight - margin.top - margin.bottom;

        //append svg to chart container div
        var svg = d3.select('#' + container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom )
            .attr('id', 'barcode-svg-' + type)
            .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var xScale = d3.scaleTime().range([0, width]).domain([2010, 2017]);
        var yScale;

        if(type === 'race'){
            yScale = d3.scaleLog().range([height, 0]).domain([1e-6, max])
        }
        else {
            yScale = d3.scaleLinear().range([height, 0]).domain([min, max]);
        }


        var xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(d3.format(""));

        const format = d3.format("");

        var yAxis = d3.axisLeft()
            .scale(yScale);

        if(type === 'race'){
            yAxis.tickValues([0.05, 1, 20, Math.round(max)])
                .tickFormat(d => format(d));
        }
        else {
            yAxis.tickSize(0)
                .ticks(6)
                .tickPadding(8)
                .tickFormat(d3.format(""));
        }


        //add x-axis
        var xAxisGroup = svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        //add y-axis
        var yAxisGroup = svg.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // text label for the y axis
        var txt = svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1.5em")
            .attr('class', 'y-axis-label')
            .style("text-anchor", "middle");

        if(type === 'income') txt.text("Share (%)");
        else txt.text("Population Share (%)");

        yAxisGroup.select('.domain').attr('stroke', 'none');
        yAxisGroup.selectAll(".tick line")
            .attr("stroke", "#E0E0E0")
            .attr("x2", width);
        // .attr("stroke-dasharray", "2,2");


        var lineGenerator = d3.line()
            .x(function(d) { return xScale(d.year) })
            .y(function(d) {
                // console.log(d.pop_share, yScale(d.pop_share));
                if(yScale(d.pop_share) === Infinity){
                    return height;
                }
                else return yScale(d.pop_share)
            });


        // for each line do the following
        for (var prop in data){
            var propData = data[prop];
            // console.log(prop, data[prop]);

            svg.append('path')
                .data([propData])
                .attr('class', function(d) { return 'g-line g-' + prop })
                .attr('stroke', function(d) {
                    return getLegendColor(prop, type);
                })
                .attr('d', lineGenerator)
        }//for

        // createMapLegend(legendText, type);


    }


    function createMapLegend2(legendText, type){
        if($('.map-legend').length){
            var legendContent = '';
            for (var i = 0; i < legendText.length; i++) {
                legendContent +=  '<i style="background:' + getLegendColor((legendText[i]).toLowerCase(), type) + '"></i>'+ '<span>' + legendText[i] + '</span>' + ' </br>';
            }

            $('.map-legend').html(legendContent);

        }
        else {
            legend = L.control({position: 'bottomright'});

            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'legend-info map-legend');

                for (var i = 0; i < legendText.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + getLegendColor((legendText[i]).toLowerCase(), type) + '"></i>'+ '<span>' + legendText[i] + '</span>' + ' </br>';
                }

                return div;
            };

            legend.addTo(map);
        }
    }


    function createMapLegend(legendText, type){
        if($('.' + type).length){
            $('.' + type + ' span').each(function(i){
                $(this).text(legendText[i]);
            })
        }
        else {
            legend = L.control({position: 'bottomright'});

            legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'legend-info map-legend ' + type);

                for (var i = 0; i < legendText.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + getLegendColor((legendText[i]).toLowerCase(), type) + '"></i>'+ '<span>' + legendText[i] + '</span>' + ' </br>';
                }

                return div;
            };

            legend.addTo(map);
        }
    }


    function getLegendText(prop, type){
        if(type === 'race'){
            if(prop === 'white') return 'white';
            else if(prop === 'black_or_african_american') return 'black';
            else if(prop === 'asian') return 'asian';
            else if(prop === 'native_hawaiian_other_pacific_islander') return 'NH/PI';
            else if(prop === 'american_indian_and_alaska_native') return 'AI/AN';
            else if(prop === 'others') return 'others';
        }
        else if(type === 'income'){
            if(prop === 'less_than_10000') return '<10,000';
            else if(prop === 'bw_10000_and_24999') return '10,000 - 24,999';
            else if(prop === 'bw_25000_and_49999') return '25,000 - 49,999';
            else if(prop === 'bw_50000_and_99999') return '50,000 - 99,999';
            else if(prop === 'bw_100000_and_199999') return '100,000 - 199,999';
            else if(prop === 'more_than_200000') return '>200,000';
        }
        else if(type === 'age_gender'){
            return prop;
        }

    }


    function getLegendColor(prop, type){
        if(type === 'race'){
            if(prop === 'white') return '#D50000';
            else if(prop === 'black_or_african_american' || prop === 'black') return '#9FA8DA';
            else if(prop === 'asian') return '#5ebc97';
            else if(prop === 'native_hawaiian_other_pacific_islander' || prop === 'nh/pi') return '#F9A825';
            else if(prop === 'american_indian_and_alaska_native' || prop === 'ai/an') return '#880E4F';
            else if(prop === 'others') return '#424242';
        }
        else if(type === 'income'){
            if(prop === 'less_than_10000' || prop === '<10,000') return '#fee8c8';
            else if(prop === 'bw_10000_and_24999' || prop === '10,000 - 24,999') return '#fdbb84';
            else if(prop === 'bw_25000_and_49999' || prop === '25,000 - 49,999') return '#fc8d59';
            else if(prop === 'bw_50000_and_99999' || prop === '50,000 - 99,999') return '#ef6548';
            else if(prop === 'bw_100000_and_199999' || prop === '100,000 - 199,999') return '#d7301f';
            else if(prop === 'more_than_200000' || prop === '>200,000') return '#7f0000';
        }
        else if(type === 'age_gender'){
            // if(prop === 'total_0_to_4' || prop === 'male_0_to_4' || prop === 'female_0_to_4') return '#e9d2cc';
            // else if(prop === 'total_5_to_14' || prop === 'male_5_to_14' || prop === 'female_5_to_14') return '#c9b4b4';
            // else if(prop === 'total_15_to_24' || prop === 'male_15_to_24' || prop === 'female_15_to_24') return '#a9969c';
            // else if(prop === 'total_25_to_54' || prop === 'male_25_to_54' || prop === 'female_25_to_54') return '#897884';
            // else if(prop === 'total_55_to_64' || prop === 'male_55_to_64' || prop === 'female_55_to_64') return '#594c5f';
            // else if(prop === 'total_65_and_over' || prop === 'male_65_and_over' || prop === 'female_65_and_over') return '#291f3b';

            if(prop === 'total_0_to_4' || prop === 'male_0_to_4' || prop === 'female_0_to_4') return '#291f3b';
            else if(prop === 'total_5_to_14' || prop === 'male_5_to_14' || prop === 'female_5_to_14') return '#594c5f';
            else if(prop === 'total_15_to_24' || prop === 'male_15_to_24' || prop === 'female_15_to_24') return '#897884';
            else if(prop === 'total_25_to_54' || prop === 'male_25_to_54' || prop === 'female_25_to_54') return '#a9969c';
            else if(prop === 'total_55_to_64' || prop === 'male_55_to_64' || prop === 'female_55_to_64') return '#c9b4b4';
            else if(prop === 'total_65_and_over' || prop === 'male_65_and_over' || prop === 'female_65_and_over') return '#e9d2cc';
        }
    }


    function clearInterface() {
        if(map.hasLayer(schoolGroup)){
            map.removeLayer(schoolGroup);
            $('#school').parent().removeClass('highlight');
            $('#numberSchools').remove();
        }
        if(map.hasLayer(serviceGroup)){
            map.removeLayer(serviceGroup);
            $('#service').parent().removeClass('highlight');
            $('#numberServices').remove();
            $('#service-types').addClass('hide-services');
        }
        if(map.hasLayer(lotsGroup)){
            map.removeLayer(lotsGroup);
            $('#vacant-lots').parent().removeClass('highlight');
        }
        if(map.hasLayer(safePassageGroup)){
            map.removeLayer(safePassageGroup);
            $('#safe-passage').parent().removeClass('highlight');
        }

        $('#secondary-controls-container').hide();
    }


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
                       '<img src="images/MasonicTemple.jpg" id="masonic-temple" width="100%"/> <br>' +
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
                   map.setView(new L.latLng(41.794124, -87.654949), 14.5);

                   var container2 = $('<div class="tooltip-wrapper"/>');

                   container2.on('click', '#southtown-btn', function() {
                       southtown.closePopup();
                       $('.overlay').fadeIn('slow');
                       clearInterface();
                       map.removeLayer(markergroup1);

                       map.setView(new L.latLng(41.774876, -87.656801), 14.5);
                       self.showContentForIndex(3);
                   });

                   container2.html(
                       '<img src="images/southtown.jpg" id="southtown" width="100%"/> <br>' +
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
                    var position = $('#vacant-lots')[0].getBoundingClientRect();
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
                            if(filter == 'vacant-lots' && story){
                                $('#pulse').remove();
                                $('#selectVacantLots').remove();
                                var yale = L.marker([41.774570, -87.631220]).addTo(markergroup2);
                                var honroe = L.marker([41.777210, -87.669770]).addTo(markergroup2);

                                map.addLayer(markergroup2);

                                var container1 = $('<div class="tooltip-wrapper"/>');

                                container1.on('click', '#honroe', function() {
                                    honroe.closePopup();
                                    yale.openPopup();
                                    map.setView(new L.latLng(41.793736, -87.640470), 14.5);
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
                                map.setView(new L.latLng(41.794121, -87.677519), 14.5);

                                var container2 = $('<div class="tooltip-wrapper"/>');

                                container2.html(
                                    '<img src="images/YaleApartments.jpg" width="100%" height="100%" id="yale" /> <br>' +
                                    '<h2 class="tooltip-title">Yale Building</h2>' +
                                    '<p class="tooltip-text custom-margin">Lot of work went into restoring this building which now serves as home to ' +
                                    'senior citizens.  It features a large, open atrium and sprawling glass arcade that fills the building with natural light. ' +
                                    'A remarkable example of transformation.</p><br>' +
                                    '<button id="yale" class="btn-width btn">Next</button>'
                                );

                                yale.bindPopup(container2[0], {closeOnClick: false, autoClose: false});

                                container2.on('click', '#yale', function() {
                                    map.setView([41.774876, -87.659901], 14.5);
                                    step5 = false;
                                    yale.closePopup();

                                    map.removeLayer(markergroup2);
                                    // map.setView(new L.latLng(41.762582, -87.639271), 14.5);

                                    $('#numberVacantLots').remove();
                                    $('#vacant-lots').parent().removeClass('highlight');
                                    map.removeLayer(lotsGroup);

                                    var schoolPos = $('#school')[0].getBoundingClientRect();
                                    var passagePos = $('#safe-passage')[0].getBoundingClientRect();

                                    clearInterface();
                                    var schoolTop = schoolPos.height / 2 + schoolPos.top,
                                        schoolLeft = schoolPos.width / 2 + schoolPos.left,
                                        passageTop = passagePos.height / 2 + passagePos.top,
                                        passageLeft = passagePos.width / 2 + passagePos.left;

                                    $('body').append('<div id="schools-pulse" class="pulsating-circle"></div>');
                                    $('body').append('<div id="passages-pulse" class="pulsating-circle"></div>');

                                    $('#schools-pulse').css({top: schoolTop, left: schoolLeft, width: '50px', height: '50px'});
                                    $('#passages-pulse').css({top: passageTop, left: passageLeft, width: '50px', height: '50px'});

                                    $('body').append('<div id="selectFilters" class="instructions-tooltip"> Select the Schools and Safe-Passages filter</div>');

                                    $('#selectFilters').css({top: schoolTop, left: filtersWidth + 10});

                                    var filtersSelected=[], step6 = true;
                                    $('td').on('click', function(){
                                        if(story && step6){
                                            var filter = $(event.currentTarget).find(':first-child').attr('id');

                                            if(filter == 'safe-passage' || filter == 'school') {
                                                if(!filtersSelected.includes(filter)) {
                                                    filtersSelected.push(filter);
                                                }
                                                else {
                                                    var index = filtersSelected.indexOf(filter);
                                                    if (index !== -1) filtersSelected.splice(index, 1);
                                                }
                                            }

                                            if(filtersSelected.length == 2){
                                                $('#schools-pulse').remove();
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

                                                $('#step6').css({top: 0 , right: 0});

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
                    console.log('final-step');
                    $('.overlay').fadeOut('slow');
                    $('#schools-flex-item').hide();
                    $('#vacant-lots-flex-item').hide();
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

        addDemographicsData: function(year, demogrType, data, genderFilter){
            circleSvg = d3.select('#map')
                .select('svg')
                .append('g')
                .attr('id', 'demographics-circular-charts');
            // self.displayDotDistribution(year, demogrType, data);
            // self.displayCircularChart(year, demogrType, data, genderFilter);
            self.displayCircularChart2(year, demogrType, data, genderFilter);
        },

        removeDemographics: function() {
            d3.select('#demographics-circular-charts').remove();
        },

        addCrimesData: function(data, crimeType) {
            self.displayCrimesData(data, crimeType);
        },

        removeCrimes: function(){
            map.removeLayer(crimesGroup);
        },

        showOverviewPlots: function(data){
          self.displayOverviewPlots(data);
        },

        updateAgeGenderPlot: function(data, filter){
          self.updateAgeGenderPlot(data, filter);
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
        },

        removeDemogrPopup: function(){
            censusLayer.closePopup();
            censusLayer.unbindPopup();
            if(elClicked){
                elClicked.feature.properties.isSelected = false;
                elClicked.setStyle(style.default);
            }

            $('.map-legend').remove();
        },

        isCrimesLayerActive: function(){
            return map.hasLayer(crimesGroup);
        }

    };


    return publiclyAvailable;
};