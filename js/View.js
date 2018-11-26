// presentation layer

"use strict";

var App = App || {};

var View = function(){

    var self = this;
    var map;
    var schoolGroup, crimeLayer, serviceGroup, vacantLotGroup, markers, safePassageGroup, censusLayer;


    var colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, 5]);

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


    function getColor(noOfCrimes){
        return colorScale(noOfCrimes);
    }


    function setCrimeChoropleth(feature){
        return {
            weight: 0,
            fillColor: getColor(feature.properties.noOfCrimes),
            fillOpacity: 0.2
        }
    }


    self.displayCrimes = function(censusData) {

        crimeLayer = L.geoJSON(censusData, {style: setCrimeChoropleth, onEachFeature: onEachFeature});
        map.addLayer(crimeLayer);

        // markers = L.markerClusterGroup({
        //     spiderfyOnMaxZoom: false
        // });
        // crimeData.forEach(function(c){
        //     var marker = L.marker(new L.latLng(c.latitude, c.longitude));
        //     markers.addLayer(marker);
        // });
        //
        // map.addLayer(markers);
    };


    self.displayServices = function(serviceData) {

        $('#map').append('<div id="numberServices"><p class="content">'+ serviceData.length +'<span class="det_text"> Services</span></p></div>');
        if($('#numberSchools').length > 0){
            $('#numberServices').addClass('shift');
        }

        serviceGroup = L.featureGroup();

        serviceData.forEach(function(s){
            var latlng = L.latLng(s.latitude, s.longitude);
            L.circle(latlng, {radius: 25, color: '#f08a6b',weight: 0, fillOpacity: 1}).addTo(serviceGroup)
                .bindPopup("<b>" + s['name'] + "</b></br>" + "Address: " + s['address'] + "</br>" + "<a href='" + s['website'] + "' target='_blank'>Website</a></br>"
                + "Phone Number: " + "<a href='tel:" + s['phone'] + "' target='_blank'>" + s['phone'] + "</a></br>"
                + "Description: " + "<p class='service-description'>" + s['description'] + "</p>");
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
            L.circle(latlng, {radius: 20, color: '#8ca0ae', weight: 0, fillOpacity: 1}).addTo(vacantLotGroup)
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
            // var waffle = new WaffleChart()
            //     .selector(".chart_race")
            //     .data(raceDist)
            //     .useWidth(true)
            //     .label("Race Distribution")
            //     .size(10)
            //     .gap(2)
            //     .rows(10)
            //     .rounded(true)();

        var donut = donutChart()
            .width(400)
            .height(300)
            .cornerRadius(3) // sets how rounded the corners are on each slice
            .padAngle(0.015) // effectively dictates the gap between slices
            .variable('count')
            .category('race');

        d3.select('.chart_race')
            .datum(raceDist) // bind data to the div
            .call(donut); // draw chart in div
        }
    };


    self.removeRaceDist = function() {
        d3.select('.chart_race').selectAll("*").remove();
    };


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
            .style("fill", function(d, i) {
                if(d.value < 1200) return "lightgrey";
                else return "#FF6666";
            })
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
           // console.log('Selected Block:', blockSelected);
           $(document).trigger('blockSelected', blockSelected);
        });
    }


    self.displayCensusBlocks = function(censusData){
        censusLayer = L.geoJSON(censusData, {fillColor: '#A0A0A0' ,weight: 0.2, onEachFeature: onEachFeature});
        map.addLayer(censusLayer);
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

    self.displayTimeline = function(data) {

        console.log(data)
        var svg = d3.select(".timeline").append("svg").attr("width", "100%"),
            margin = {top: 5, right: 20, bottom: 70, left: 30},
            margin2 = {top: 95, right: 20, bottom: 20, left: 30},
            width = +svg.node().getBoundingClientRect().width - margin.left - margin.right,
            height = +svg.node().getBoundingClientRect().height - margin.top - margin.bottom,
            height2 = +svg.node().getBoundingClientRect().height - margin2.top - margin2.bottom;

        var parseDate = d3.timeParse("%Y-%m-%dT%H")

        data.forEach(function (d) {
            d.key = parseDate(d.key);
        });
        data.sort(function(a, b){
            return a.key - b.key
        })
        var x = d3.scaleTime().range([0, width]),
            x2 = d3.scaleTime().range([0, width]),
            y = d3.scaleLinear().range([height, 0]),
            y2 = d3.scaleLinear().range([height2, 0]);
        
        var xAxis = d3.axisBottom(x).tickSize(0),
            xAxis2 = d3.axisBottom(x2).tickSize(0),
            yAxis = d3.axisLeft(y).ticks(3);

        var brush = d3.brushX()
            .extent([[0, 0], [width, height2]])
            .on("brush end", function() {
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
                var s = d3.event.selection || x2.range();
                x.domain(s.map(x2.invert, x2));
                focus.select(".area").attr("d", area);
                focus.select(".axis--x").call(xAxis);
                svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
                    .scale(width / (s[1] - s[0]))
                    .translate(-s[0], 0));
            });
        
        var zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", function() {
                if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
                var t = d3.event.transform;
                x.domain(t.rescaleX(x2).domain());
                focus.select(".area").attr("d", area);
                focus.select(".axis--x").call(xAxis);
                context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
            });

        var area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return x(d.key); })
            .y0(height)
            .y1(function(d) { return y(d.value); });

        var line = d3.line()
            .x(function(d) { return x(d.key); })
            .y(function(d) { return y(d.value); });

        var line2 = d3.line()
            .x(function(d) { return x(d.key); })
            .y(function(d) { return y(d.value); });

        var area2 = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return x2(d.key); })
            .y0(height2)
            .y1(function(d) { return y2(d.value); });

        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);
        
        var focus = svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        var context = svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        x.domain(d3.extent(data, function(d) { return d.key; }));
        y.domain([0, d3.max(data, function(d) { return d.value; })]);
        x2.domain(x.domain());
        y2.domain(y.domain());

        focus.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area);
        // focus.append("path")
        //     .datum(data)
        //     .attr("class", "line")
        //     .attr("d", line);

        focus.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        focus.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis);

        context.append("path")
            .datum(data)
            .attr("class", "area")
            .attr("d", area2);

        // context.append("path")
        //     .datum(data)
        //     .attr("class", "line")
        //     .attr("d", line2);

        context.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height2 + ")")
            .call(xAxis2);

        context.append("g")
            .attr("class", "brush")
            .call(brush)
            .call(brush.move, x.range());
      
        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(zoom);
    }

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

        addCrimes: function(censusData){
            map.removeLayer(censusLayer);
            self.displayCrimes(censusData);
        },

        removeCrimes: function(){
          // map.removeLayer(crimeGroup);
            map.removeLayer(crimeLayer);
            map.addLayer(censusLayer);
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

        showCrimeTimeline: function(crimes) {
            self.displayTimeline(crimes);
        },

        isLayerActive: function(layer){
            if(layer === 'school')
                return map.hasLayer(schoolGroup);
            else if(layer === 'crime')
            // return map.hasLayer(crimeGroup);
                 return map.hasLayer(crimeLayer);
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