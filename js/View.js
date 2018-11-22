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
        // L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        //     // subdomains: 'abcd',
        //     maxZoom: 19
        // }).addTo(map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

    };


    self.displaySchools = function(schoolData) {
        $('#map').append('<div id="numberSchools"><p class="content">'+ schoolData.length +'<span class="det_text"> Schools</span></p></div>');
        if($('#numberServices').length > 0){
            $('#numberSchools').addClass('shift');
        }
        schoolGroup = L.featureGroup();

        schoolData.forEach(function(s, index){
            var latlng = L.latLng(s.Latitude, s.Longitude);
            L.circle( latlng, {radius: 30, color: '#5e8df7', weight: 0, fillOpacity: 1}).addTo(schoolGroup)
                .bindPopup("<b>" + s['Organization Name'] + " </b></br>Address: " + s['Address']);
        });

        map.addLayer(schoolGroup);
    };

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

        $('#map').append('<div id="numberServices"><p class="content">'+ serviceData.length +'<span class="det_text"> Services</span></p></div>');
        console.log('schoolse exists or not',$('#numberSchools').length);
        if($('#numberSchools').length > 0){
            $('#numberServices').addClass('shift');
        }

        serviceGroup = L.featureGroup();

        serviceData.forEach(function(s){
            var latlng = L.latLng(s.Latitude, s.Longitude);
            L.circle(latlng, {radius: 25, color: '#f08a6b',weight: 0, fillOpacity: 1}).addTo(serviceGroup)
                .bindPopup("<b>" + s['Organization Name'] + "</b></br>" + "Address: " + s['Address'] + "</br>" + "<a href='" + s['Website'] + "' target='_blank'>Website</a></br>"
                + "Phone Number: " + "<a href='tel:" + s['Phone Number'] + "' target='_blank'>" + s['Phone Number'] + "</a>");
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
            L.circle(latlng, {radius: 20, color: '#f7d19d', weight: 0, fillOpacity: 1}).addTo(vacantLotGroup)
                .bindPopup("Address: " + v['Address'] + "</br> Area: " + v['Sq. Ft.'] + " sq. ft");
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

    self.displayRaceDist = function(raceDist) {
        if(raceDist === undefined) {
            d3.select(".chart_race").append("h2").text("No Data Available");
        } else {
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
    };

    self.removeRaceDist = function() {
        d3.select('.chart_race').selectAll("*").remove();
    }
    
    self.displayCrimesByCat = function(crimeData) {

        var margin = {top: 0, right: 5, bottom: 20, left: 10};
        var width = d3.select(".chart_crime_cat").node().getBoundingClientRect().width;
        var height = 200;
        var x = d3.scaleBand()
            .domain(crimeData.map(d => d.key))
            .range([margin.left, width - margin.right])
            .padding(0.1);
        var y = d3.scaleLinear()
            .domain([0, d3.max(crimeData, d => d.value)]).nice()
            .range([height - margin.bottom, margin.top]);
        
        var div = d3.select(".chart_crime_cat").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.select(".chart_crime_cat")
            .append("div")
            .attr("class", "label")
            .text("Crimes by Category in Englewood");

        var chart_svg = d3.select(".chart_crime_cat")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        chart_svg.selectAll('.bar')
            .data(crimeData)
            .attr("class", "bar")
            .enter().append("rect")
            .style("fill", "darkgreen")
            .attr("x", d => x(d.key))
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))
            .attr("width", x.bandwidth())
            .on("mouseover", function(d) {
                div.transition()
                .duration(200)
                .style("opacity", .9);
                div.html(d.key + "<br/>" + d.value)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
                })
            .on("mouseout", function(d) {
                div.transition()
                .duration(500)
                .style("opacity", 0);
                });
    };

    function onEachFeature(feature, layer){
        layer.on('click', function(e){
        //    console.log('Block selected',e.target.feature.properties.blockce10);
           var blockSelected = e.target.feature.properties.tract_bloc;
           console.log('Selected Block:', blockSelected);
           $(document).trigger('blockSelected', blockSelected);
        });
    }


    self.displayCensusBlocks = function(censusData){
        L.geoJSON(censusData, {weight: 0.2, onEachFeature: onEachFeature})
            .addTo(map);
    };


    self.displayGenderAgeDist = function(genAgeDist) {
        // console.log(genAgeDist);
        var margin = {top: 0, right: 5, bottom: 20, left: 10};
        var width = d3.select(".chart_crime_cat").node().getBoundingClientRect().width;
        var height = 150;
        var x0 = d3.scaleBand()
            .domain(genAgeDist.map(d => d.age))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        var keys = d3.keys(genAgeDist[0]).slice(1);
        var x1 = d3.scaleBand()
            .padding(0.3)
            .domain(keys).rangeRound([0, x0.bandwidth()]);
        var y = d3.scaleLinear()
            .domain([0, d3.max(genAgeDist, d => d.female, d => d.male )]).nice()
            .range([height - margin.bottom, margin.top]);

        var z = d3.scaleOrdinal()
            .range(["steelblue", "palevioletred"]);

        var div = d3.select(".chart_gen_age").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.select(".chart_gen_age")
            .append("div")
            .attr("class", "label")
            .text("Gender-Age Distribution");

        var chart_svg = d3.select(".chart_gen_age")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")");
        
        chart_svg.selectAll('.bar')
            .data(genAgeDist)
            .enter().append('g')
                .attr("transform", function(d) { return "translate(" + x0(d.age) + ",0)"; })
            .selectAll("rect")
            .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
            .enter().append("rect")
                .attr("x", function(d) { return x1(d.key); })
                .attr("y", function(d) { return y(d.value); })
                .attr("width", x1.bandwidth())
                .attr("height", function(d) { return height - y(d.value); })
                .attr("fill", function(d) { return z(d.key); })
                .on("mouseover", function(d) {
                    div.transition()
                      .duration(200)
                      .style("opacity", .9);
                    div.html(d.value)
                      .style("left", (d3.event.pageX) + "px")
                      .style("top", (d3.event.pageY - 28) + "px");
                    })
                .on("mouseout", function(d) {
                    div.transition()
                      .duration(500)
                      .style("opacity", 0);
                    });

        chart_svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x0))
            .call(g => g.select(".domain").remove())
            .selectAll("text")
            .style("font-size", 7);       
    };

    self.removeGenAgeDist = function() {
        d3.select('.chart_gen_age').selectAll("*").remove();
    };

    var publiclyAvailable = {
        initialize: function(){
            self.displayMap();
        },

        addCensusBlocks: function(censusData){
            self.displayCensusBlocks(censusData);
        },

        addServices: function(serviceData){
            self.displayServices(serviceData);
        },

        removeServices: function(){
            $('#numberSchools').removeClass('shift');
            $('#numberServices').remove();
            map.removeLayer(serviceGroup);
        },

        addSchools: function(schoolData){
            self.displaySchools(schoolData);
        },

        removeSchools: function(){
            $('#numberServices').removeClass('shift');
            $('#numberSchools').remove();
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

        removeRaceDist: function() {
            self.removeRaceDist();
        },

        showGenderAgeDist: function(genAgeDist) {
            self.displayGenderAgeDist(genAgeDist);
        },

        removeGenAgeDist: function() {
            self.removeGenAgeDist();
        },

        showCrimeByCat: function(crimeDist) {
            self.displayCrimesByCat(crimeDist);
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