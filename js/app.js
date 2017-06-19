// Our model, or data.
var locations = [{
        title: "Plaza de España, Sevilla, España",
        lat: 37.377200,
        lng: -5.986905

    },
    {
        title: "Plaza América, Sevilla, España",
        lat: 37.3716488,
        lng: -5.98706

    },
    {
        title: "Acuario, Sevilla, España",
        lat: 37.370565,
        lng: -5.991229
    }
    // Add two more
    // {title: , location: {lat: , lng: },
    // {title: , location: {lat: , lng: }
];

// Global variables
var map;

var marker = function(title, lat, lng, map, info, bounds) { // Marker constructor
    var self = this;
    this.title = title;
    this.lat = lat;
    this.lng = lng;
    this.position = {
        lat: this.lat,
        lng: this.lng
    };

    this.marker = new google.maps.Marker({
        position: self.position,
        map: map,
        title: self.title,
        animation: google.maps.Animation.DROP,
    });
    bounds.extend(self.position); // Extends map boundaries by the marker position
    self.marker.addListener("click", function() {
        populateInfoWindow(self.marker, info, map);
    });
}


function populateInfoWindow(marker, infowindow, map) {
    if (!$('.' + marker.title).length) {
        console.log("current marker infowindow = ", infowindow);
        infowindow.marker = marker;
        infowindow.setContent('<div class="' + marker.title + '">' + marker.title + '</div>');

        infowindow.open(map, marker);
        infowindow.addListener("closeclick", function() {
            infowindow.setContent(null);
            infowindow.close();
        });
    }
}

var ViewModel = function() {
    var self = this;
    self.map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 37.389092,
            lng: -5.984459
        },
        zoom: 15
    });

    self.ob = ko.observableArray(locations);
    self.info = new google.maps.InfoWindow(); // Info Window for selected marker
    self.listMarkerAppear = function(marker, infowindow, map) {

        if (!$('.' + marker.title).length) {
            console.log("current marker infowindow = ", infowindow);
            infowindow.marker = marker;
            infowindow.setContent('<div class="' + marker.title + '">' + marker.title + '</div>');
            console.log("map detected=", map);
            console.log("marker detected=", marker.title);
            infowindow.open(map, marker); // This line breaks the code
            // infowindow.addListener("closeclick", function() {
            //     infowindow.setContent(null);
            //     infowindow.close();
            // });
        }
    }
    var bounds = new google.maps.LatLngBounds(); // Get current bounds of the map
    for (var i = 0; i < locations.length; i++) {
        locations[i].marker = new marker(locations[i].title, locations[i].lat, locations[i].lng, self.map, self.info, bounds); // Loop to initiate each marker, it's saved on locations.
    }

    self.map.fitBounds(bounds); // Fits map to markers bound
};

function initMap() {
    ko.applyBindings(new ViewModel());
}
