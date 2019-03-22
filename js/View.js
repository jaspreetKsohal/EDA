// presentation layer

"use strict";

var App = App || {};

var View = function(controller){

    var self = this;
    var map;
    var greenSpacesGroup, historicSitesGroup, schoolGroup, serviceGroup, vacantLotGroup, safePassageGroup, censusLayer, lotsGroup;

    var markergroup1 = L.layerGroup();
    var markergroup2 = L.layerGroup();


    var colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, 5]);


    var greenSpacesIcon = L.icon({
        iconUrl: 'images/green-spaces.svg',
        // shadowUrl: 'leaf-shadow.png',

        iconSize:     [12, 12], // size of the icon
        // shadowSize:   [50, 64], // size of the shadow
        // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
        // shadowAnchor: [4, 62],  // the same for the shadow
        // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    });


    var historicSitesIcon = L.icon({
        iconUrl: 'images/historic-sites.svg',
        iconSize:     [12, 12], // size of the icon
    });


    self.displayMap = function() {
        // L.mapbox.accessToken = 'pk.eyJ1IjoiamFzcHJlZXQxM3NvaGFsIiwiYSI6ImNqZzlpNjFjeDFkdXgzNG10ZGxta3QxYjAifQ.OdfMrevmS4Az30DQCEHCFg';
        // var map = L.mapbox.map('map', 'mapbox.light', {maxZoom: 18, minZoom: 0})
        //     .setView([41.7753, -87.6416], 14);

        map = L.map('map', {zoomControl: false}).setView([41.774876, -87.656801], 14);

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


    self.displayCensusTracts = function(censusTractsData) {
        censusLayer = L.geoJSON(censusTractsData, {fillColor: '#A0A0A0' ,weight: 0.3, color: "black"});
        map.addLayer(censusLayer);
    };


    // greenSpacesData[0] = Parks | greenSpacesData[1] = green-roofs | greenSpacesData[2] = cuamp-gardens
    self.displayGreenSpaces = function(greenSpacesData){
        $('#green-spaces-flex-item').show();

        greenSpacesGroup = L.featureGroup();

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
        $('#safe-passages-flex-item').show();

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

        lotsGroup = L.geoJSON(lotsData, {style: lotsStyle})
            .bindPopup(function(layer){
                var popup_text = "<b>" + layer.feature.properties.address + "</b></br>" +
                    "Status - " + layer.feature.properties.property_status + "</br>" +
                    "Area - " + layer.feature.properties.sq_ft + " sqft</br>";
                return popup_text;
            });
        map.addLayer(lotsGroup);
    };


    function onEachFeature(feature, layer){
        layer.on('click', function(e){
        //    console.log('Block selected',e.target.feature.properties.blockce10);
            var blockSelected = e.target.feature.properties.tract_bloc;
            var target = e.target;
            if(!e.target.feature.properties.isSelected) {
                console.log('Selected Block:', blockSelected);
                e.target.feature.properties.isSelected = true;
                e.target.setStyle({
                    weight: 0.7,
                    fillColor: '#666',
                    color: '#666'
                });
                $(document).trigger('blockSelected', {blockSelected: blockSelected, target: target});
            } else {
                e.target.feature.properties.isSelected = false;
                self.removeBlockHighlight(e.target);
                $(document).trigger('blockDeselected', {blockSelected: blockSelected, target: target});
            }
           
        });
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
            $('#safe-passages-flex-item').hide();
          map.removeLayer(safePassageGroup);
        },

        addLots: function(lotsData){
            self.displayLots(lotsData);
        },

        removeLots: function(){
            $('#vacant-lots-flex-item').hide();
            map.removeLayer(lotsGroup);
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
            else
                return map.hasLayer(safePassageGroup);
        }

    };


    return publiclyAvailable;
};