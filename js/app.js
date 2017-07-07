var locations = [{
        title: "Plaza de España",
        address: "Av de Isabel la Católica",
        city: "41004 Sevilla",
        lat: 37.3771957,
        lng: -5.986893

    },
    {
        title: "Plaza América",
        address: "Plaza América, 3",
        city: "41013 Sevilla",
        lat: 37.3716488,
        lng: -5.98706

    },
    {
        title: "Monumento al Cid Campeador",
        address: "Av. el Cid, 1",
        city: "41004 Sevilla",
        lat: 37.3797229,
        lng: -5.9891046
    },
    {
        title: "Real Alcázar de Sevilla",
        address: "Patio de Banderas, s/n",
        city: "41004 Sevilla",
        lat: 37.3830519,
        lng: -5.9902257
    },
    {
        title: "Museo Arqueológico de Sevilla",
        address: "Plaza América, s/n",
        city: "41013 Sevilla",
        lat: 37.370905,
        lng: -5.987100
    }
];


var Place = function(title, lat, lng, address, city, map, info, bounds) { // Marker constructor
    var self = this;
    this.title = title;
    this.address = address;
    this.lat = lat;
    this.lng = lng;
    this.city = city;
    this.position = {
        lat: this.lat,
        lng: this.lng
    };
    this.check = ko.observable(true); // Observable to hide/show list elements
    this.marker = new google.maps.Marker({
        position: self.position,
        lat: self.lat,
        lng: self.lng,
        map: map,
        title: self.title,
        animation: google.maps.Animation.DROP,
        address: self.address,
        city: self.city
    });
    bounds.extend(self.position); // Extends map boundaries by the marker position
    self.marker.addListener("click", function() {

        populateInfoWindow(self.marker, info, map, locations);
        zoom(self.marker, map);
    });
};

var lastMarker;
var flickrUrl;
var farm_id;
var server_id;
var photo_id;
var secret;
var photoUrl;
var key = '77943fb46dee2981cd17dd7d4a7533c9'; // flickr key

function defaultInfoWindow(marker, infowindow, map, locations, spin) {
    if (lastMarker !== undefined && lastMarker != marker) {
        lastMarker.setAnimation(null); // Changes the last marker to default animation
        lastMarker.setIcon('http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png'); // Changes the last marker to default icon
    }
    lastMarker = marker; // Replaced clunky loop that would slow down the app(big data) with this variable
    marker.setIcon('https://mt.google.com/vt/icon?psize=30&font=fonts/arialuni_t.ttf&color=ff304C13&name=icons/spotlight/spotlight-waypoint-a.png&ax=43&ay=48&text=%E2%80%A2'); // Sets current marker to green icon
    marker.setAnimation(google.maps.Animation.BOUNCE);
    infowindow.marker = marker;
    if (spin === false) {
        infowindow.setContent('<div class="markerWindow"><div class="infoWindow">' +
            '<strong class="title">' + marker.title + '</strong>' + '<p>' + marker.address + '<br>' + marker.city + '</p></div></div>');
    } else {
        infowindow.setContent('<i class="fa fa-cog fa-spin fa-3x fa-fw margin-bottom spin"></i><div class="markerWindow"><div class="infoWindow">' +
            '<strong class="title">' + marker.title + '</strong>' + '<p>' + marker.address + '<br>' + marker.city + '</p></div></div>');
    }
    infowindow.open(map, marker);
    infowindow.addListener("closeclick", function() {
        marker.setAnimation(null); // Changes the selected marker to default animation
        infowindow.setContent(null);
        infowindow.close();
        marker.setIcon('http://mt.googleapis.com/vt/icon/name=icons/spotlight/spotlight-poi.png'); // Changes the selected marker to default icon
    });
}

function ajaxSuccess(marker, infowindow, map, locations, data) {
    farm_id = data.photos.photo[1].farm;
    server_id = data.photos.photo[1].server;
    photo_id = data.photos.photo[1].id;
    secret = data.photos.photo[1].secret;
    photoUrl = 'https://farm' + farm_id + '.staticflickr.com/' + server_id + '/' + photo_id + '_' + secret + '.jpg';
    $(".spin").replaceWith('<img class="markerPhoto" src="' + photoUrl + '">');
}

function ajaxFail(marker, infowindow, map, locations) {
    alert('Flickr api failed to load, reverting back to default. [Please reload or try again later...] ');
    window.alert = function() {};
    defaultInfoWindow(marker, infowindow, map, locations, false);
}

function populateInfoWindow(marker, infowindow, map, locations) {
    defaultInfoWindow(marker, infowindow, map, locations, true);
    flickrUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search' + '&per_page=2&api_key=' + key + '&text=' + marker.title + '&lat=' + marker.lat + '&lon=' + marker.lng + '&format=json';

    $.when(ajaxRequest()).done(function(data) {
        ajaxSuccess(marker, infowindow, map, locations, data);
    });
    $.when(ajaxRequest()).fail(function(data) {
        ajaxFail(marker, infowindow, map, locations);
    });

    function ajaxRequest() {
        return $.ajax({
            url: flickrUrl,
            dataType: 'jsonp',
            jsonp: 'jsoncallback'
        });
    }
}

function zoom(marker, map) {
    map.panTo(marker.position);
    if ($(window).innerHeight() <= 720) {
        map.panBy(0, -80);
    }
}

var ViewModel = function() {
    var self = this;

    self.isMenuOpen = ko.observable(false); // Menu closed by default
    self.menuSlide = function() { // Handles opening/closing menu
        var menuCheck = self.isMenuOpen();
        self.isMenuOpen(false);
        if (menuCheck === true) {
            self.isMenuOpen(false);
        } else {
            self.isMenuOpen(true);
        }
    };

    self.listMarkerAppear = function(place, infowindow, map) { // Handles functionality of marker list on menu
        populateInfoWindow(place.marker, infowindow, map, locations);
        zoom(place.marker, map);
    };

    self.filterDivs = function() { // This.. you got it right, it filter divs(from the menu)
        var observer = self.observableLocations();
        var data = self.observableInput().toLowerCase();
        var infowindow = self.info;
        for (var i = 0; i < observer.length; i++) {
            if ((observer[i].place.title.toLowerCase()).indexOf(data) == -1) {
                observer[i].place.check(false);
                observer[i].place.marker.setVisible(false);
                infowindow.close();
            } else {

                observer[i].place.marker.setVisible(true);
                observer[i].place.check(true);
            }
        }
    };

    self.onEnter = function() { // To use enter in the filter input
        if (event.keyCode == 13) {
            self.filterDivs();
        }
    };

    self.reload = function() { // Reloads app
        location.reload();
    };

    self.styles = [{ // Styles for google maps
            elementType: 'labels.text.stroke',
            stylers: [{
                color: '#ffffff'
            }]
        },
        {
            elementType: 'labels.text.fill',
            stylers: [{
                color: '#000000'
            }]
        },
        {
            featureType: 'landscape.man_made',
            stylers: [{
                color: '#CBE6A3'
            }]
        },
        {
            featureType: 'poi.park',
            stylers: [{
                color: '#f4eb97'
            }]
        },
        {
            featureType: 'water',
            stylers: [{
                color: '#FEEE54'
            }]
        },
        {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{
                color: '#83d353'
            }]
        },
        {
            featureType: 'landscape.natural',
            elementType: 'geometry',
            stylers: [{
                color: '#fff'
            }]
        }
    ];

    self.map = new google.maps.Map(document.getElementById("map"), { // Initiates google-maps Map
        center: {
            lat: 37.377200,
            lng: -5.986905
        },
        zoom: 13,
        styles: self.styles,
        disableDefaultUI: true
    });

    self.observableLocations = ko.observableArray(locations); // Used in filterDivs
    self.observableInput = ko.observable(""); // Observable that gets the input in the search bar (used in filterDivs)
    self.info = new google.maps.InfoWindow(); // Info Window for selected marker
    var bounds = new google.maps.LatLngBounds(); // Get current bounds of the map
    for (var i = 0; i < locations.length; i++) {
        locations[i].place = new Place(locations[i].title, locations[i].lat, locations[i].lng, locations[i].address, locations[i].city, self.map, self.info, bounds); // Loop to initiate each marker, it's saved on locations.
    }
    google.maps.event.addDomListener(window, 'resize', function() {
        self.map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
    });
    self.map.fitBounds(bounds); // Fits map to markers bound
};



function googleMapsError() {
    alert('Google maps failed to load, please check that your connection is working or try again later...');
}

function initMap() {
    var vm = new ViewModel();
    ko.applyBindings(vm);
    vm.observableInput.subscribe(function() {
        vm.filterDivs();
    });
}
