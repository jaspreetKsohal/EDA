// presentation layer

"use strict";

var App = App || {};

var View = function(){

    var self = this;

    self.displayMap = function() {
        mapboxgl.accessToken = 'pk.eyJ1IjoiamFzcHJlZXQxM3NvaGFsIiwiYSI6ImNqZzlpNjFjeDFkdXgzNG10ZGxta3QxYjAifQ.OdfMrevmS4Az30DQCEHCFg';
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v9',
            zoom: 12,
            center: [-87.6416, 41.7753]  /*[longitude, latitude]*/
        });
    };

    var publiclyAvailable = {
        initialize: function(){
            self.displayMap();
        }
    };

    return publiclyAvailable;
};