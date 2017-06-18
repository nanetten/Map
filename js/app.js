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

    // {title: , location: {lat: , lng: },
    // {title: , location: {lat: , lng: }
];

// Global variables
var map;
var markers = [];
var marker = function(title, lat, lng, map, info, bounds){
  var self = this;
  this.title = title;
  this.lat = lat;
  this.lng = lng;
  this.position =  {lat: this.lat, lng: this.lng};

  this.marker = new google.maps.Marker({
              position: self.position,
              map: map,
              title: self.title,
              animation: google.maps.Animation.DROP,
          });
  bounds.extend(self.position);
  self.marker.addListener("click", function() {
    populateInfoWindow(self.marker, info);
  });
  markers.push(self.marker);

}

function appendList(title, id) {
    $(".locationsList").append('<li><button id="' + id + '"data-bind="click: listMarkerAppear">' + title + '</button></li>');
}

function populateInfoWindow(marker, infowindow) {



          if (!$('.'+marker.title).length){

              console.log("current marker infowindow = ", infowindow);
              infowindow.marker = marker;
              infowindow.setContent('<div class="' +marker.title+ '">' + marker.title + '</div>');
              infowindow.open(map, marker);
              infowindow.addListener("closeclick", function() {
                  infowindow.setContent(null);
                  infowindow.close();

              });

          }

}

var ViewModel = function () {
  map = new google.maps.Map(document.getElementById("map"), {
      center: {
          lat: 37.389092,
          lng: -5.984459
      },
      zoom: 15
  });
    this.ob = ko.observableArray(locations);

    info = new google.maps.InfoWindow(); // Info Window for selected marker
    this.listMarkerAppear = function(locations, event){
      populateInfoWindow(markers[event.target.id], info);
    }
    var bounds = new google.maps.LatLngBounds(); // Get current bounds of the map
    for (var i = 0; i < locations.length; i++){
      locations[i].maker = new marker(locations[i].title, locations[i].lat, locations[i].lng, map, info, bounds); // Use this with knockout
      // appendList(locations[i].title, i);
    }
    map.fitBounds(bounds); // Fits map to markers bound







};



function initMap() {



    ko.applyBindings(new ViewModel());


}
