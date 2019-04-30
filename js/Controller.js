// handles user interaction

"use strict";

var App = App || {};

var Controller = function(model, view){

    var model = model || new Model();
    var view = view || new View();

    //Current step for the story progress
    var storyIndex = 0;

    //demographics data year
    var year = 2017;
    var baseYear = 2010; //with respect to which percent change will be computed
    var allLayers = ['green-spaces, historic-sites, service, school, safe-passage, vacant-lots, demographics'];
    var greenSpaces = ['gs-community-garden', 'gs-school-garden', 'gs-parks', 'gs-urban-farm', 'gs-green-roofs', 'gs-other'];
    var services = ['BN', 'EC', 'ED', 'EM', 'FS', 'HW', 'VP', 'YE'];

    //about button
    $('#about').css({width: $('.filters')[0].getBoundingClientRect().width});


    // about button selected
    $('#about').on('click', function(){
        $('#about-overlay').fadeIn('slow', function() {
            $(this).removeClass('hideAbout');
            $(this).addClass('showAbout');
        });
    });


    $('#close-about').on('click', function(){
        $('#about-overlay').fadeOut('slow', function() {
            $(this).removeClass('showAbout');
            $(this).addClass('hideAbout');
        });
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


    $(document).on('loadCensus', function(e) {
        view.addCensusTracts(model.getCensusTractsData());
    });


    //on clicking the sub-types of green spaces
    $('.gs-inner-flex').on('click', function(event){
        var subType = event.target.id;

        $("#"+ subType).toggleClass('gs-selected');

        // view.updateGreenSpaces(model.getGreenSpaceData(), subType);
        var arr = [];
        $('.gs-selected').each(function(){
           arr.push(this.id);
        });

        if(view.isLayerActive('green-spaces')){
            view.removeGreenSpaces();
        }

        if(subType === 'gs-all'){
            if($('#gs-all').hasClass('gs-selected')){
                $('.gs-inner-flex').addClass('gs-selected');
                view.addGreenSpaces(model.getFilteredGreenSpaces(greenSpaces));
            }
            else {
                $('.gs-inner-flex').removeClass('gs-selected');
                view.addGreenSpaces(model.getFilteredGreenSpaces([]));
            }
        }
        else {
            $('#gs-all').removeClass('gs-selected');
            view.addGreenSpaces(model.getFilteredGreenSpaces(arr));
        }
    });


    //on clicking the sub services
    $('.services-inner-flex').on('click', function(event){
        var subService = event.target.id;

        $("#"+ subService).toggleClass('srv-selected');

        var arrServices = [];
        $('.srv-selected').each(function(){
            arrServices.push(this.id);
        });

        if(view.isLayerActive('service')){
            view.removeServices();
        }

        if(subService === 'services-all'){
            if($('#services-all').hasClass('srv-selected')){
                $('.services-inner-flex').addClass('srv-selected');
                view.addServices(model.getFilteredServices(services));
            } else {
                $('.services-inner-flex').removeClass('srv-selected');
                view.addServices(model.getFilteredServices([]));
            }
        }
        else {
            $('#services-all').removeClass('srv-selected');
            view.addServices(model.getFilteredServices(arrServices));
        }

    });


    function resetDemogrTypesSelection(currentlyActive){
        $('#demographics-sub-types > li').removeClass('demogr-selected');
        if(currentlyActive){
        $("#" + currentlyActive).toggleClass('demogr-selected');
        }
    }


    //on clicking sub categories of demographics - race, age_gender, income
    $('.demographics-inner-flex').on('click', function(event){
        var demogrType = event.target.id;

        if(!view.isDemogrTypeActive()){
            view.removeDemographics();
        }

        var genderFilter = $('input[name=radioBtn]:checked').val();

        view.addDemographicsData(year, demogrType, model.getDemographicsData(), genderFilter);

        resetDemogrTypesSelection(demogrType);
    });


    // function checkGenderFilterStatus(){
    //     var filter = [];
    //
    //     $('input:checkbox').each(function(){
    //         var id = $(this).attr('id');
    //         if($(this).is(':checked')){
    //             filter.push(id);
    //         }
    //     });
    //
    //     return filter;
    // }


    //gender filter
    $(".radioBtn").change(function(e){
        var value = $('input[name=radioBtn]:checked').val();

       $('#age-gender-line-plot').empty();
       var result = model.computePopShare(model.getOverviewDemographicsData());
       view.updateAgeGenderPlot(result, value);

       if($('#age_gender').hasClass('demogr-selected')){
           view.removeDemographics();
           view.addDemographicsData(year, 'age_gender', model.getDemographicsData(), value);
       }

    });



    $('td').on('click', function(event){

        var filter = $(event.currentTarget).find(':first-child').attr('id');

        $(event.currentTarget).toggleClass("highlight");

        if(filter === 'green-spaces'){
            if(view.isLayerActive(filter)){
                view.removeGreenSpaces();
                $('.gs-inner-flex').removeClass('gs-selected');
            } else {
                // view.addGreenSpaces(model.getGreenSpaceData());
                $('#gs-community-garden').addClass('gs-selected');
                view.addGreenSpaces(model.getFilteredGreenSpaces(['gs-community-garden']));
            }
        }
        else if(filter === 'historic-sites'){
            if(view.isLayerActive(filter)){
                view.removeHistoricSites();
            } else {
                view.addHistoricSites(model.getHistoricSitesData());
            }
        }
        else if(filter === 'service'){
            if(view.isLayerActive(filter)){
                view.removeServices();
                $('.services-inner-flex').removeClass('srv-selected');
            } else {
                // view.addServices(model.getServiceData());
                $('#BN').addClass('srv-selected');
                view.addServices(model.getFilteredServices(['BN']));
            }
        }//if-service
        else if(filter === 'school'){
            if(view.isLayerActive(filter)){
                view.removeSchools();
            } else {
                view.addSchools(model.getSchoolData()[0]);
            }
        }//if-school
        else if(filter === 'safe-passage'){
            if(view.isLayerActive(filter)){
                view.removeSafePassages();
            } else {
                view.addSafePassages(model.getSafePassagesData());
            }
        }//if-safe-passage
        else if(filter === 'vacant-lots'){
            if(view.isLayerActive(filter)){
                view.removeLots();
            } else {
                view.addLots(model.getLotsData());
            }
        }
        else if(filter === 'demographics'){
            $('#demographics-flex-item').toggleClass('show-demographics-controls');

            if(!view.isDemogrTypeActive()){
                resetDemogrTypesSelection();
                view.removeDemographics();
            }

            if($('#demographics-flex-item').hasClass('show-demographics-controls')){
                var result = model.computePopShare(model.getOverviewDemographicsData());
                // var resultPctChange = model.computePercentChange(model.getOverviewDemographicsData(), baseYear);
                // console.log(model.getOverviewDemographicsData());
                // console.log('result', resultPctChange);
                view.showOverviewPlots(result);
            } else {
                $('.demogr-plot').empty();
                $('#tooltip-container-div').empty();
                view.removeDemogrPopup();
            }
        }


        var arr = [];

        $('#filter-options td').each(function(){
            if( $(this).hasClass("highlight") ){
                arr.push($(this).text());
            }
        });

        if(arr.length != 0){
            $('#secondary-controls-container').show();
        }
        else {
            $('#secondary-controls-container').hide();
        }

    });


    // explanatory phase
    $('#beginBtn').on('click', function () {
        // console.log('begin');
        $('.landing-page').fadeOut('slow', function() {
            $('.landing-page').remove();
            $('.overlay').fadeIn( 'slow', function() {
                $('.overlay').removeClass('hidden');
                $('.overlay').addClass('show');
                view.showContentForIndex(storyIndex);
            });
        });
    });

    $('.next').on('click', function() {
        if(storyIndex == 2 || storyIndex == 5) storyIndex++;
        storyIndex++;
        view.showContentForIndex(storyIndex);
    });

    $('.prev').on('click', function() {
        storyIndex--;
        view.showContentForIndex(storyIndex);
    });

    $('#skipBtn').on('click', function() {
        $('.overlay').fadeOut('slow');
    });
};