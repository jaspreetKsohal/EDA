// presentation layer

"use strict";

var App = App || {};

var View = function(){

    var self = this;
    var map;
    var schoolGroup, crimeGroup;

    self.displayMap = function() {
        // L.mapbox.accessToken = 'pk.eyJ1IjoiamFzcHJlZXQxM3NvaGFsIiwiYSI6ImNqZzlpNjFjeDFkdXgzNG10ZGxta3QxYjAifQ.OdfMrevmS4Az30DQCEHCFg';
        // var map = L.mapbox.map('map', 'mapbox.light', {maxZoom: 18, minZoom: 0})
        //     .setView([41.7753, -87.6416], 14);

        map = L.map('map').setView([41.7753, -87.6416], 13);
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
            L.circle( latlng, {radius: 15, color: '#e74c3c'}).addTo(schoolGroup);
        });

        map.addLayer(schoolGroup);
    };

    self.displayRaceDist = function(raceDist) {
        console.log('view')
    } 


    self.displayCrimes = function(crimeData) {
        crimeGroup = L.featureGroup();

        crimeData.forEach(function(c){
           var latlng = L.latLng(c.latitude, c.longitude);
           L.circle(latlng, {radius: 10, color: '#E78820'}).addTo(crimeGroup);
        });

        map.addLayer(crimeGroup);
    };


    var publiclyAvailable = {
        initialize: function(){
            self.displayMap();
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
          map.removeLayer(crimeGroup);
        },

        isLayerActive: function(layer){
            if(layer === 'school')
                return map.hasLayer(schoolGroup);
            else if(layer === 'crime')
                return map.hasLayer(crimeGroup);
        },

        showRaceDist: function(raceDist) {
            self.displayRaceDist(raceDist);
        }
    };

    return publiclyAvailable;
};