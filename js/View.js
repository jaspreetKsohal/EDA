// presentation layer

"use strict";

var App = App || {};

var View = function(){

    var self = this;
    var map;
    var schoolGroup, crimeGroup, serviceGroup, vacantLotGroup, markers, safePassageGroup;

    self.displayMap = function() {
        // L.mapbox.accessToken = 'pk.eyJ1IjoiamFzcHJlZXQxM3NvaGFsIiwiYSI6ImNqZzlpNjFjeDFkdXgzNG10ZGxta3QxYjAifQ.OdfMrevmS4Az30DQCEHCFg';
        // var map = L.mapbox.map('map', 'mapbox.light', {maxZoom: 18, minZoom: 0})
        //     .setView([41.7753, -87.6416], 14);

        map = L.map('map').setView([41.774876, -87.656801], 14);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            // subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

    };


    self.displaySchools = function(schoolData) {
        schoolGroup = L.featureGroup();

        schoolData.forEach(function(s, index){
            var latlng = L.latLng(s.Latitude, s.Longitude);
            L.circle( latlng, {radius: 30, color: '#5e8df7', weight: 0, fillOpacity: 1}).addTo(schoolGroup);
        });

        map.addLayer(schoolGroup);
    };

    self.displayRaceDist = function(raceDist) {
        console.log(raceDist);
        var waffle = new WaffleChart()
            .selector(".chart_race")
            .data(raceDist)
            .useWidth(true)
            .label("Race Distribution")
            .size(10)
            .gap(2)
            .rows(10)
            .rounded(true)();
    } 


    self.displayCrimes = function(crimeData) {
        // crimeGroup = L.featureGroup();

        markers = L.markerClusterGroup({
            spiderfyOnMaxZoom: false
        });
        crimeData.forEach(function(c){
           // var latlng = L.latLng(c.latitude, c.longitude);
           // L.circle(latlng, {radius: 5, color: '#E78820'}).addTo(crimeGroup);
            var marker = L.marker(new L.latLng(c.latitude, c.longitude));
            markers.addLayer(marker);
        });

        // map.addLayer(crimeGroup);
        map.addLayer(markers);
    };


    self.displayServices = function(serviceData) {
        serviceGroup = L.featureGroup();

        serviceData.forEach(function(s){
            var latlng = L.latLng(s.Latitude, s.Longitude);
            L.circle(latlng, {radius: 25, color: '#f08a6b',weight: 0, fillOpacity: 1}).addTo(serviceGroup);
        });

        map.addLayer(serviceGroup);
    };


    self.displayVacantLots = function(vacantLotData) {
        vacantLotGroup = L.featureGroup();

        vacantLotData.forEach(function(v){
            // var loc = v.location;
            // var latlng = L.latLng(loc.latitude, loc.longitude);
            var str = v.Location;
            str = str.replace('(', '');
            str = str.replace(')', '');
            var loc = str.split(',');

            var latlng = L.latLng(loc[0], loc[1]);
            L.circle(latlng, {radius: 20, color: '#f7d19d', weight: 0, fillOpacity: 1}).addTo(vacantLotGroup);
        });

        map.addLayer(vacantLotGroup);
    };


    self.displaySafePassages = function(safePassagesData){
        safePassageGroup = L.featureGroup();

        safePassagesData.forEach(function(s){
            L.geoJSON(s['the_geom']).addTo(safePassageGroup);
        });

        map.addLayer(safePassageGroup);
    };

    var publiclyAvailable = {
        initialize: function(){
            self.displayMap();
        },

        addServices: function(serviceData){
            self.displayServices(serviceData);
        },

        removeServices: function(){
          map.removeLayer(serviceGroup);
        },

        addSchools: function(schoolData){
            self.displaySchools(schoolData);
        },

        removeSchools: function(){
          map.removeLayer(schoolGroup);
        },

        addCrimes: function(crimeData){
            self.displayCrimes(crimeData);
        },

        removeCrimes: function(){
          // map.removeLayer(crimeGroup);
            map.removeLayer(markers);
        },

        addVacantLots: function(vacantLotData){
            self.displayVacantLots(vacantLotData);
        },

        removeVacantLots: function(){
          map.removeLayer(vacantLotGroup);
        },

        addSafePassages: function(safePassagesData){
          self.displaySafePassages(safePassagesData);
        },

        removeSafePassages: function(){
          map.removeLayer(safePassageGroup);
        },


        showRaceDist: function(raceDist) {
            self.displayRaceDist(raceDist);
        },

        isLayerActive: function(layer){
            if(layer === 'school')
                return map.hasLayer(schoolGroup);
            else if(layer === 'crime')
            // return map.hasLayer(crimeGroup);
                 return map.hasLayer(markers);
            else if(layer === 'service')
                return map.hasLayer(serviceGroup);
            else if(layer === 'vacant-lot')
                return map.hasLayer(vacantLotGroup);
            else
                return map.hasLayer(safePassageGroup);
        }

    };

    return publiclyAvailable;
};