var dataSites;
var dataWindows;
var mgr;
var map;
//var here_icon = "http://www.mapize.com/generator/generatorSource/images_mapize/library/mapize_marker_pink.png";
var infoWindow = null;
var gridBounds;
var geocoder = new google.maps.Geocoder();
var defaultZoom;
var markerClusterActive = 0;
var minZoomToShowMarkers;
var zoomAfterSearchAction;
var zoomAfterSelectOneByName;
var mapCenterLatitude;
var mapCenterLongitude;

function setupMap(elId) {
    var myOptions = {
        zoom: defaultZoom,
        center: new google.maps.LatLng(mapCenterLatitude, mapCenterLongitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById(elId), myOptions);
    mgr = new MarkerManager(map);

    setupMarkers();
}

function setupSiteSelector(el) {
    el.append('<option></option>');

    $.each(dataSites, function () {
        var data = this;
        el.append('<option data-site-id="' + data.site_id + '" data-latitude="' + data.latitude + '" data-longitude="' + data.longitude + '" value="' + data.site_id + '">' + data.site_title + '</option>');
    });

    el.chosen().change(function () {
        var $this = $(this).find('option:selected');
        var lat = $this.attr('data-latitude');
        var lng = $this.attr('data-longitude');

        map.setCenter(new google.maps.LatLng(lat, lng));
        map.setZoom(zoomAfterSelectOneByName);
    });
}

function refreshMarkers() {
    mgr.clearMarkers();
    mgr.addMarkers(getMarkers(), minZoomToShowMarkers);
    mgr.refresh();
}

function setupMarkers() {
    markers = getMarkers();

    google.maps.event.addDomListener(mgr, 'loaded', function () {
        mgr.addMarkers(markers, minZoomToShowMarkers);
        mgr.refresh();
    });

    if (markerClusterActive) {
        var markerCluster = new MarkerClusterer(map, markers);
    }
}

function getMarkers() {
    var markers = [];
    var currentBounds = map.getBounds();

    $.each(dataWindows, function () {
        var markerData = this;

        if (markerData.latitude && markerData.longitude) {

            var infoWindowContent = markerData.infoWindowContent;
            var markerPosition = new google.maps.LatLng(markerData.latitude, markerData.longitude);

            if (markerData.icon != null) {
                iconUrl = '/media/original/' + markerData.icon;
            } else if (!dataIcon) {
                iconUrl = '';
                if (markerData.nb > 1) {
                    // see http://stackoverflow.com/questions/2890670/google-maps-place-number-in-marker
                    iconUrl = 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + markerData.nb + '|FE6256|000000';
                }
            } else {
                iconUrl = '/media/original/' + dataIcon['fileName'];
            }

            var marker = new google.maps.Marker({
                position: markerPosition,
                // see http://stackoverflow.com/questions/2890670/google-maps-place-number-in-marker
                icon: iconUrl,
                shadowStyle: 1,
                padding: 0,
                backgroundColor: 'rgb(57,57,57)',
                borderRadius: 4,
                arrowSize: 10,
                borderWidth: 1,
                borderColor: '#2c2c2c',
                disableAutoPan: true,
                hideCloseButton: true,
                arrowPosition: 30,
                arrowStyle: 2,
                scaledSize: 5
            });
            markers.push(marker);

            google.maps.event.addListener(marker, 'click', function () {
                if (infoWindow) {
                    infoWindow.close();
                }

                infoWindow = new google.maps.InfoWindow({
                    content: infoWindowContent
                });

                infoWindow.open(map, marker);
            });
        }
    });

    return markers;
}


function mapSearch(id) {
    var input = document.getElementById(id);
    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
       var place = autocomplete.getPlace();

        if (!place.geometry) {
            return;
        }

        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(zoomAfterSearchAction);
        }
    });
}
