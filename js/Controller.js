// handles user interaction

"use strict";

var App = App || {};

var Controller = function(model, view){

    var model = model || new Model();
    var view = view || new View();

    var block1 = '';
    var block2 = '';
    var isCompare = false,
        lastChanged = 2;


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
                view.removeCrimes();
            } else {
                // view.addCrimes(model.getCrimeData()[0]);
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
        
        view.showRaceDist(model.getTotalRaceDist(), '#block1race');
        view.showGenderAgeDist(model.getTotalGenderAgeDist(), '#block1gen');
    });

    $(document).on('loadCrime', function(e) {
        console.log('crime loaded');
        view.showCrimeByCat(model.getCrimesByCat(), '#block1crime');

        view.showCrimeTimeline(model.getCrimeTimeline());

        var data = model.getCrimesDayVsHours(model.getCrimeData());
        view.addCrimesByHourHeatmap(data);

        var data2 = model.getCrimesDayVsMonth(model.getCrimeData());
        view.addCrimesByMonthHeatmap(data2);

    });

    $(document).on('blockSelected', function(e, info) {
        if(isCompare) {
            if (lastChanged == 1) {
                block2 = info;
                lastChanged = 2;
            } else {
                block1 = info;
                lastChanged = 1;
            }
        } else {
            block1 = info;
            lastChanged = 1;
        }
        view.removeRaceDist('#block' + lastChanged + 'race');
        view.removeGenAgeDist('#block' + lastChanged + 'gen');
        view.removeCrimesByCat('#block' + lastChanged + 'crime');

        //hide the compare text
        $('#b' + lastChanged + 'CompTxt').removeClass('show')
        


        view.showRaceDist(model.getBlockRaceDist(info), '#block' + lastChanged + 'race');
        view.showGenderAgeDist(model.getBlockGenAgeDist(info), '#block' + lastChanged + 'gen');
        view.showCrimeByCat(model.getCrimesByCat(info), '#block' + lastChanged + 'crime');

        
    });

    $(document).on('blockDeselected', function(e, info) {
        console.log(info)
        if(block1 == info) {
            block1 = '';
        }
        console.log('block1 ', block1);        
    });

    $(document).on('dateUpdate', function(e, info) {
        // console.log(info);
        var data = model.getDateFilteredCrime(info);
        if(view.isLayerActive("crime")){
            view.removeCrimes(true);
            view.addCrimes(data, true);
        }
    });

    $("#overviewBtn").on('click', function (e) {
        //hide details for block2
        showOverview()
        
    });

    $('#compareBtn').on('click', function() {
        isCompare = !isCompare;
        if(isCompare) {
            $('#compareBtn').attr('value', 'Stop Comparing');
            //split the details for 2 blocks
            view.removeRaceDist('#block1race');
            view.removeGenAgeDist('#block1gen');
            view.removeCrimesByCat('#block1crime');
            $('.detailblock1').addClass('compare')
            $('.detailblock2').addClass('compare')
            $('#b2CompTxt').addClass('show')
            if(block1 == '') {
                $('#b1CompTxt').addClass('show')
            } else {
                view.showRaceDist(model.getBlockRaceDist(block1), '#block' + lastChanged + 'race');
                view.showGenderAgeDist(model.getBlockGenAgeDist(block1), '#block' + lastChanged + 'gen');
                view.showCrimeByCat(model.getCrimesByCat(block1), '#block' + lastChanged + 'crime');
            }
        }
        else {
            showOverview();
        } 
    });

    function showOverview() {
        $('.detailblock1').removeClass('compare')
        $('.detailblock2').removeClass('compare')
        view.removeRaceDist('#block1race');
        view.removeGenAgeDist('#block1gen');
        view.removeCrimesByCat('#block1crime');
        view.removeRaceDist('#block2race');
        view.removeGenAgeDist('#block2gen');
        view.removeCrimesByCat('#block2crime');

        $('#compareBtn').attr('value', 'Compare Blocks');

        // var data = model.getCrimesDayVsHours(model.getBlockCrimeData(info));
        // view.addCrimesByHourHeatmap(data);

        view.showRaceDist(model.getTotalRaceDist(), '#block1race');
        view.showGenderAgeDist(model.getTotalGenderAgeDist(), '#block1gen');
        view.showCrimeByCat(model.getCrimesByCat(), '#block1crime');
    }

    $('#beginBtn').on('click', function () {
        console.log('begin');
        $('.landing-page').fadeOut('slow', function() { $('.landing-page').remove(); })
    });
};