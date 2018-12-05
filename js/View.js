// presentation layer

"use strict";

var App = App || {};

var View = function(controller){

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
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            // subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);

        // L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        //     subdomains: 'abcd',
        //     maxZoom: 19
        // }).addTo(map);

    };


    self.displaySchools = function(schoolData) {
        $('#map').append('<div id="numberSchools"><p class="content">'+ schoolData.length +'<span class="det_text"> Schools</span></p></div>');
        if($('#numberServices').length > 0){
            $('#numberSchools').addClass('shift');
        }
        schoolGroup = L.featureGroup();

        schoolData.forEach(function(s, index){
            var latlng = L.latLng(s.Latitude, s.Longitude);
            L.circle( latlng, {radius: 30, color: '#2d97f2', weight: 0, fillOpacity: 1}).addTo(schoolGroup)
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
            return '#eecbc7';
        }
        else if(crimes >= 10 && crimes < 20){
            return '#e4a2a4';
        }
        else if(crimes >= 20 && crimes < 30){
            return '#c98496'
        }
        else if(crimes >= 30 && crimes < 40){
            return '#a25a72'
        }
        else {
            return '#843c54'
        }
    }

    function setCrimeChoropleth(feature){
        return {
            weight: 0,
            // fillColor: colorScale(feature.properties.noOfCrimes),
            fillColor: getColor(feature.properties.noOfCrimes),
            fillOpacity: 0.5
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
            L.circle(latlng, {radius: 25, color: '#e57287',weight: 0, fillOpacity: 1}).addTo(serviceGroup)
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
            L.circle(latlng, {radius: 20, color: '#7a7a7a', weight: 0, fillOpacity: 0.6}).addTo(vacantLotGroup)
                .bindTooltip("Address: " + v['Address'] + "</br> Area: " + v['Sq. Ft.'] + " sq. ft");
        });

        map.addLayer(vacantLotGroup);
    };


    self.displaySafePassages = function(safePassagesData){
        safePassageGroup = L.featureGroup();

        safePassagesData.forEach(function(s){
            L.geoJSON(s['the_geom'], {fillColor: "#2d97f2", weight: 2}).addTo(safePassageGroup);
        });

        map.addLayer(safePassageGroup);
    };


    self.displayRaceDist = function(raceDist, container) {
        if(raceDist === undefined) {
            d3.select(container).append("p").text("No Data Available").attr("class", "no-data-avail");
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
                .height($('.chart_race').height() - 15)
                .cornerRadius(3) // sets how rounded the corners are on each slice
                .padAngle(0.015) // effectively dictates the gap between slices
                .variable('count')
                .category('race')
                .margin({top: 13, right: 0, bottom: 0, left: 0})
                .id(container.replace('#', 'donut'));

            d3.select(container)
                .datum(raceDist) // bind data to the div
                .call(donut); // draw chart in div
        }
    };


    self.removeRaceDist = function(container) {
        d3.select(container).selectAll("*").remove();
    };


    self.displayCrimesByCat = function(crimeData, container) {

        var margin = {top: 13, right: 5, bottom: 0, left: 10};
        var width = $(container).width() - margin.left - margin.right;
        var height = $('.chart_crime_cat').height() - margin.top;

        var barWidth = Math.min(20, (width/crimeData.length + 1))

        var x = d3.scaleBand()
            .domain(crimeData.map(d => d.key))
            .range([margin.left, Math.min(width, (crimeData.length + 1) * barWidth)])
            .padding(0.1);
        var y = d3.scaleLinear()
            .domain([0, d3.max(crimeData, d => d.value)]).nice()
            .range([height - margin.bottom, margin.top]);
        
        var div = d3.select(container).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // d3.select(container)
        //     .append("div")
        //     .attr("class", "label")
        //     .text("Crimes by Category in Englewood");

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
                else return "#986c7a";
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

        chart_svg.append("text")
            .attr("x", (width * 0.5))             
            .attr("y", 5)
            .attr("text-anchor", "middle")  
            .style("font-size", "13px")
            .text("Crimes by Type");
    };


    self.displayCrimesByHourHeatmap = function(data) {
        var margin = {top: 30, right: 5, bottom: 20, left: 40};
        // var width = d3.select('#hour-heatmap').node().getBoundingClientRect().width - margin.left - margin.right,
            // height = 100 - margin.top - margin.bottom,
        var width = $('#timeline-heatmap').width()/2 - margin.left - margin.right,
            height = $('#timeline-heatmap').height() - margin.top - margin.bottom,
            gridSize = Math.floor(width / 24),
            buckets = 9,
            // colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
            colors = ["#fef1ec","#eecbc7","#e4a2a4","#c98496","#a25a72","#843c54"],
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
            // colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
            colors = ["#fef1ec","#eecbc7","#e4a2a4","#c98496","#a25a72","#843c54"],
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

    self.removeBlockHighlight = function(target) {
        if(target) {
            censusLayer.resetStyle(target);
        }
    }


    self.displayCensusBlocks = function(censusData){
        censusLayer = L.geoJSON(censusData, {fillColor: '#A0A0A0' ,weight: 0.2, onEachFeature: onEachFeature});
        map.addLayer(censusLayer);
    };


    self.displayGenderAgeDist = function(genAgeDist, container) {
        // console.log(genAgeDist);
        var margin = {top: 13, right: 5, bottom: 20, left: 10};
        var width = $(container).width() - margin.left - margin.right;
        var height = $('.chart_gen_age').height() - margin.top - margin.bottom;
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
            .range(["#6ca5dd", "#c98496"]);

        var div = d3.select(container).append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // d3.select(container)
        //     .append("div")
        //     .attr("class", "label")
        //     .text("Gender-Age Distribution");

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
            chart_svg.append("text")
            .attr("x", (width * 0.5))             
            .attr("y", 5)
            .attr("text-anchor", "middle")  
            .style("font-size", "13px")
            .text("Gender and Age");  
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
            height2 = svgHt * 0.24,
            margin = {top: svgHt * 0.05, right: svgwd * 0.05, bottom: svgHt * 0.35, left: svgwd * 0.05},
            margin2 = {top: svgHt * 0.68, right: svgwd * 0.05, bottom: svgHt * 0.05, left: svgwd * 0.05},
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

    function clearInterface() {
        if(map.hasLayer(crimeLayer)){
            map.removeLayer(crimeLayer);
            $('#crime').parent().removeClass('highlight');
            map.addLayer(censusLayer);
        }
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
        if(map.hasLayer(vacantLotGroup)){
            map.removeLayer(vacantLotGroup);
            $('#vacant-lot').parent().removeClass('highlight');
        }
        if(map.hasLayer(safePassageGroup)){
            map.removeLayer(safePassageGroup);
            $('#safe-passage').parent().removeClass('highlight');
        }
    }

    var markergroup1 = L.layerGroup();
    var markergroup2 = L.layerGroup();

    self.showContentForIndex = function(index) {
        // var content = d3.select('.story-content');
        //change the content
        //remove the current content
        // content.selectAll("*").remove();

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
                    'lots provided a breeding ground for crime. <br> <br> <b> By this time Englewood and West Englewood had become a part of the most ' +
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
                    '<p id="final-step-content" class="overlay-content">Despite all these efforts, Englewood still is one of the Chicago\'s most troubled neighborhood. The senseless killing of kids, sound of gunshots ' +
                    ', helplessness of mothers to protect their children is aggravating Englewood\'s conditions. <br> <br>' +
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
        //change story progress
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

        removeBlockHighlight: function(target) {
            self.removeBlockHighlight(target);
        },

        showContentForIndex: function(index) {
            self.showContentForIndex(index);
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