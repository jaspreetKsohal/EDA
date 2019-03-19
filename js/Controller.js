// handles user interaction

"use strict";

var App = App || {};

var Controller = function(model, view){

    var model = model || new Model();
    var view = view || new View();

    //Current step for the story progress
    var storyIndex = 0;

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


    function getServiceTypePanelHeight() {
        var height = $('#map')[0].getBoundingClientRect().height;
        return height;
    };


    $(document).on('loadCensus', function(e) {
        view.addCensusTracts(model.getCensusTractsData());
    });


    $('td').on('click', function(event){

        // $('.filter-option').on('click', function(event){
        // console.log(view.isLayerActive());
        var filter = $(event.currentTarget).find(':first-child').attr('id');

        // $('#'+filter).toggleClass("highlight");
        $(event.currentTarget).toggleClass("highlight");

        if(filter === 'green-spaces'){
            if(view.isLayerActive(filter)){
                view.removeGreenSpaces();
            } else {
                view.addGreenSpaces(model.getGreenSpaceData());
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
            $('#service-types').toggleClass('hide-services');
            $('#service-types').css({height: getServiceTypePanelHeight()});
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
        else if(filter === 'safe-passage'){
            if(view.isLayerActive(filter)){
                view.removeSafePassages();
            } else {
                view.addSafePassages(model.getSafePassagesData());
            }
        }//if-safe-passage
        else if(filter === 'lots'){
            if(view.isLayerActive(filter)){
                view.removeLots();
            } else {
                view.addLots(model.getLotsData());
            }
        }

    });


    // explanatory phase
    $('#beginBtn').on('click', function () {
        console.log('begin');
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
};