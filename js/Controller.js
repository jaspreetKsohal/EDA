// handles user interaction

"use strict";

var App = App || {};

var Controller = function(model, view){

    var model = model || new Model();
    var view = view || new View();


    $('input[type=radio]').click(function(e){
        var selectedValue = $('input[name=radio1]:checked').val();
        // console.log(selectedValue);
        if(selectedValue == 'heatmap'){
            // console.log('heatmap selected');
            $('.heatmapDIV').show();
            $('.timelineDIV').hide();
        }
        else {
            // console.log('timeline selected');
            $('.heatmapDIV').hide();
            $('.timelineDIV').show();
        }
    });


    $('input[name=checkbox]').change(function(e){
        var arr = [];
        $('input.chkbox:checkbox:checked').each(function () {
            arr.push($(this).val());
        });

        if(view.isLayerActive('service')){
            view.removeServices();
        }
        view.addServices(model.getFilteredServices(arr));
    });


    $('td').on('click', function(event){

        // $('.filter-option').on('click', function(event){
        // console.log(view.isLayerActive());
        var filter = $(event.currentTarget).find(':first-child').attr('id');

        // $('#'+filter).toggleClass("highlight");
        $(event.currentTarget).toggleClass("highlight");

        if(filter === 'service'){
            $('#service-types').toggleClass('hide-services');
            if(view.isLayerActive(filter)){
                view.removeServices();
            } else {
                $('.chkbox').prop('checked', true);
                view.addServices(model.getServiceData());
            }
        }//if-service
        else if(filter === 'school'){
            if(view.isLayerActive(filter)){
                view.removeSchools();
            } else {
                view.addSchools(model.getSchoolData()[0]);
            }
        }//if-school
        else if(filter === 'crime'){
            if(view.isLayerActive(filter)){
                console.log('choropleth was active');
                view.removeCrimes();
            } else {
                // view.addCrimes(model.getCrimeData()[0]);
                console.log('choropleth was not active');
                view.addCrimes(model.getCensusData());
            }
        }//if-crime
        else if(filter === 'vacant-lot'){
            if(view.isLayerActive(filter)){
                view.removeVacantLots();
            } else {
                view.addVacantLots(model.getVacantLots());
            }
        }//if-vacant-lots
        else if(filter === 'safe-passage'){
            if(view.isLayerActive(filter)){
                view.removeSafePassages();
            } else {
                view.addSafePassages(model.getSafePassagesData());
            }
        }//if-safe-passage

    });

    $(document).on('loadCensus', function(e) {
        // total race dist from the model
        view.addCensusBlocks(model.getCensusData());
        
        view.showRaceDist(model.getTotalRaceDist());
        view.showGenderAgeDist(model.getTotalGenderAgeDist());
    });

    $(document).on('loadCrime', function(e) {
        console.log('crime loaded');
        view.showCrimeByCat(model.getCrimesByCat());

        view.showCrimeTimeline(model.getCrimeTimeline());

        var data = model.getCrimesDayVsHours(model.getCrimeData());
        view.addCrimesByHourHeatmap(data);

        var data2 = model.getCrimesDayVsMonth(model.getCrimeData());
        view.addCrimesByMonthHeatmap(data2);

    });

    $(document).on('blockSelected', function(e, info) {
        $("#censusTitle").text("Census Data - Block No.: " + info);
        view.removeRaceDist();
        view.removeGenAgeDist();
        view.removeCrimesByCat();

        // var data = model.getCrimesDayVsHours(model.getBlockCrimeData(info));
        // view.addCrimesByHourHeatmap(data);

        view.showRaceDist(model.getBlockRaceDist(info));
        view.showGenderAgeDist(model.getBlockGenAgeDist(info));
        view.showCrimeByCat(model.getCrimesByCat(info));
    });

    $(document).on('dateUpdate', function(e, info) {
        console.log(info);
        var data = model.getDateFilteredCrime(info);
        if(view.isLayerActive("crime")){
            console.log('choropleth was active');
            view.removeCrimes();
            view.addCrimes(data, true);
        }
    });
};