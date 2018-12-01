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

    function getColor(crimes){
        if(crimes == undefined){
            return 'white';
        }
        else if (crimes == 0){
            return '#fef1ec';
        }
        else if(crimes >= 0 && crimes < 10){
            return '#fcbba1';
        }
        else if(crimes >= 10 && crimes < 20){
            return '#fb6a4a';
        }
        else if(crimes >= 20 && crimes < 30){
            return '#cb181d'
        }
        else if(crimes >= 30 && crimes < 40){
            return '#a50f15'
        }
        else {
            return '#67000d'
        }
    }

    function setCrimeChoropleth(feature){
        return {
            weight: 0,
            // fillColor: colorScale(feature.properties.noOfCrimes),
            fillColor: getColor(feature.properties.noOfCrimes),
            fillOpacity: 0.6
        }
    }


    self.displayCrimes = function(censusData, isUpdate = false) {
        //update is true if a timeperiod is selected/modified in the timeline
        if(!crimeLayer || isUpdate){
            if(isUpdate){
                crimeLayer.clearLayers();
            }
            crimeLayer = L.geoJSON(censusData, {style: setCrimeChoropleth, onEachFeature: onEachFeature})
                .bindTooltip(function (layer) {
                    return String(layer.feature.properties.noOfCrimes); //merely sets the tooltip text
                });
        }

        map.addLayer(crimeLayer);

        //check which layer active - if any other layer active bring it to top
        if(map.hasLayer(schoolGroup)){
            schoolGroup.bringToFront();
        }
        if(map.hasLayer(serviceGroup)){
            serviceGroup.bringToFront();
        }
        if(map.hasLayer(safePassageGroup)){
            safePassageGroup.bringToFront();
        }
        if(map.hasLayer(vacantLotGroup)){
            vacantLotGroup.bringToFront();
        }

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


    self.displayRaceDist = function(raceDist, container) {
        if(raceDist === undefined) {
            d3.select(container).append("h2").text("No Data Available");
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
            .width($(container).width())
            .height($('.wrapper').height() * 0.25)
            .cornerRadius(3) // sets how rounded the corners are on each slice
            .padAngle(0.015) // effectively dictates the gap between slices
            .variable('count')
            .category('race');

        d3.select(container)
            .datum(raceDist) // bind data to the div
            .call(donut); // draw chart in div
        }
    };


    self.removeRaceDist = function(container) {
        d3.select(container).selectAll("*").remove();
    };


    self.displayCrimesByCat = function(crimeData, container) {

        var margin = {top: 0, right: 5, bottom: 10, left: 10};
        var width = d3.select(container).node().getBoundingClientRect().width;
        var height = $('.wrapper').height() * 0.25;
        var x = d3.scaleBand()
            .domain(crimeData.map(d => d.key))
            .range([margin.left, Math.min(width - margin.right, crimeData.length * 25)])
            .padding(0.1);
        var y = d3.scaleLinear()
            .domain([0, d3.max(crimeData, d => d.value)]).nice()
            .range([height - margin.bottom, margin.top]);
        
        var div = d3.select(container).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.select(container)
            .append("div")
            .attr("class", "label")
            .text("Crimes by Category in Englewood");

        var chart_svg = d3.select(container)
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
                if(i > 2) return "lightgrey";
                else return "#FF6666";
            })
            .attr("x", d => x(d.key))
            .attr("y", d => y(d.value))
            .attr("height", d => y(0) - y(d.value))
            .attr("width", 20)
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


    self.displayCrimesByHourHeatmap = function(data) {
        var margin = {top: 30, right: 5, bottom: 20, left: 40};
        // var width = d3.select('#hour-heatmap').node().getBoundingClientRect().width - margin.left - margin.right,
            // height = 100 - margin.top - margin.bottom,
        var width = $('#timeline-heatmap').width()/2 - margin.left - margin.right,
            height = $('#timeline-heatmap').height() - margin.top - margin.bottom,
            gridSize = Math.floor(width / 24),
            buckets = 9,
            colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
            days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            times = ["1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12a", "1p", "2p", "3p", "4p", "5p", "6p", "7p", "8p", "9p", "10p", "11p", "12p"];

        var svg = d3.select('#hour-heatmap').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

        var dayLabels = svg.selectAll('.dayLabel')
            .data(days)
            .enter().append('text')
                .text(function(d) { return d; })
                .attr('x', 0)
                .attr('y', function(d, i) { return i * gridSize; })
                .style('text-anchor', 'end')
                .style('font-size', '10px')
                .attr("transform", "translate(-4," + gridSize / 1.5 + ")")
                .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

        var timeLabels = svg.selectAll(".timeLabel")
            .data(times)
            .enter().append("text")
                .text(function(d) { return d; })
                .attr("x", function(d, i) { return i * gridSize; })
                .attr("y", 0)
                .style("text-anchor", "middle")
                .style('font-size', '10px')
                .attr("transform", "translate(" + gridSize / 2 + ", -6)")
                .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

        var arr = [];
        data.forEach(function(d){
            arr.push(d.value);
        });

        var colorScale = d3.scaleQuantile()
            .domain(arr)
            // .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
            .range(colors);


        var cards = svg.selectAll(".hour")
            .data(data, function(d) {return d.day+':'+d.hour;});

        cards.enter().append("rect")
            .attr("x", function(d) { return (d.hour - 1) * gridSize; })
            .attr("y", function(d) { return (d.day - 1) * gridSize; })
            // .attr("rx", 1)
            // .attr("ry", 1)
            .attr("class", "hour bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", function(d) { return colorScale(d.value); })
            .append('title')
                .text(function(d) { return d.value; });

        cards.exit().remove();
    };


    self.displayCrimesByMonthHeatmap = function(data) {
        var margin = {top: 30, right: 5, bottom: 20, left: 40};
        // var width = d3.select('#month-heatmap').node().getBoundingClientRect().width - margin.left - margin.right,
        //     height = 200 - margin.top - margin.bottom,
        var width = $('#timeline-heatmap').width()/3 - margin.left - margin.right,
            height = $('#timeline-heatmap').height() - margin.top - margin.bottom,
            gridSize = Math.floor(($('#timeline-heatmap').width()/2 - margin.left - margin.right) / 24),
            buckets = 9,
            colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
            days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
            months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

        var svg = d3.select('#month-heatmap').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

        var dayLabels = svg.selectAll('.dayLabel')
            .data(days)
            .enter().append('text')
            .text(function(d) { return d; })
            .attr('x', 0)
            .attr('y', function(d, i) { return i * gridSize; })
            .style('text-anchor', 'end')
            .style('font-size', '10px')
            .attr("transform", "translate(-4," + gridSize / 1.5 + ")")
            .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

        var monthLabels = svg.selectAll(".monthLabel")
            .data(months)
            .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .style('font-size', '10px')
            .attr("transform", "translate(" + gridSize / 2 + ", -6)");

        var arr = [];
        data.forEach(function(d){
            arr.push(d.value);
        });

        var colorScale = d3.scaleQuantile()
            .domain(arr)
            .range(colors);


        var cards = svg.selectAll(".month")
            .data(data, function(d) {return d.day+':'+d.month;});

        cards.enter().append("rect")
            .attr("x", function(d) { return (d.month - 1) * gridSize; })
            .attr("y", function(d) { return (d.day - 1) * gridSize; })
            .attr("class", "month bordered")
            .attr("width", gridSize)
            .attr("height", gridSize)
            .style("fill", function(d) { return colorScale(d.value); })
            .append('title')
            .text(function(d) { return d.value; });

        cards.exit().remove();
    };


    function onEachFeature(feature, layer){
        layer.on('click', function(e){
        //    console.log('Block selected',e.target.feature.properties.blockce10);
            var blockSelected = e.target.feature.properties.tract_bloc;
            if(!e.target.feature.properties.isSelected) {
                console.log('Selected Block:', blockSelected);
                e.target.feature.properties.isSelected = true;
                e.target.setStyle({
                    weight: 0.7,
                    fillColor: '#666',
                    color: '#666'
                });
                $(document).trigger('blockSelected', blockSelected);
            } else {
                e.target.feature.properties.isSelected = false;
                e.target.setStyle({
                    fillColor: '#A0A0A0',
                    color: '#A0A0A0', 
                    weight: 0.2
                });
                $(document).trigger('blockDeselected', blockSelected);
            }
           
        });
    };


    self.displayCensusBlocks = function(censusData){
        censusLayer = L.geoJSON(censusData, {fillColor: '#A0A0A0' ,weight: 0.2, onEachFeature: onEachFeature});
        map.addLayer(censusLayer);
    };


    self.displayGenderAgeDist = function(genAgeDist, container) {
        // console.log(genAgeDist);
        var margin = {top: 0, right: 5, bottom: 20, left: 10};
        var width = d3.select(container).node().getBoundingClientRect().width;
        var height = $('.wrapper').height() * 0.25;
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

        var div = d3.select(container).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        d3.select(container)
            .append("div")
            .attr("class", "label")
            .text("Gender-Age Distribution");

        var chart_svg = d3.select(container)
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


    self.removeGenAgeDist = function(container) {
        d3.select(container).selectAll("*").remove();
    };

    self.removeCrimesByCat = function(container) {
        d3.select(container).selectAll("*").remove();
    };

    self.displayTimeline = function(data) {

        console.log(data);
        var svg = d3.select(".timelineDIV").append("svg").attr("width", "100%").attr('height', "100%"),
            svgHt = $('.timelineDIV').height(),
            svgwd = $('.timelineDIV').width(),
            height = svgHt * 0.55,
            height2 = svgHt * 0.35,
            margin = {top: svgHt * 0.05, right: svgwd * 0.05, bottom: svgHt * 0.4, left: svgwd * 0.05},
            margin2 = {top: svgHt * 0.6, right: svgwd * 0.05, bottom: svgHt * 0.05, left: svgwd * 0.05},
            width = $('.timelineDIV').width() - margin.left - margin.right;

        var parseDate = d3.timeParse("%Y-%m-%dT%H");

        data.forEach(function (d) {
            d.key = parseDate(d.key);
        });
        data.sort(function(a, b){
            return a.key - b.key
        });
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
                $(document).trigger('dateUpdate', {"start": xAxis.scale().domain()[0], "end": xAxis.scale().domain()[1]});
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

        addCrimes: function(censusData, isUpdate){
            if(!isUpdate){
                console.log('removed census layer');
                map.removeLayer(censusLayer);
            }

            self.displayCrimes(censusData, isUpdate);
        },

        addCrimesByHourHeatmap: function(data){
            self.displayCrimesByHourHeatmap(data);
        },

        addCrimesByMonthHeatmap: function(data){
            self.displayCrimesByMonthHeatmap(data);
        },

        removeCrimes: function(isUpdate){
            map.removeLayer(crimeLayer);
            if(!isUpdate){
                console.log('added census layer');
                map.addLayer(censusLayer);
            }
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


        showRaceDist: function(raceDist, container) {
            self.displayRaceDist(raceDist, container);
        },

        removeRaceDist: function(container) {
            self.removeRaceDist(container);
        },

        showGenderAgeDist: function(genAgeDist, container) {
            self.displayGenderAgeDist(genAgeDist, container);
        },

        removeGenAgeDist: function(container) {
            self.removeGenAgeDist(container);
        },

        removeCrimesByCat: function(container) {
            self.removeCrimesByCat(container);
        },

        showCrimeByCat: function(crimeDist, container) {
            self.displayCrimesByCat(crimeDist, container);
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