var map;
var markersInfo = [
    {   
    title: "Golden Gate Bridge",
    lat: 37.819929, 
    lng: -122.478255,
    id: "nav0",
    visible: ko.observable(true),
    boolTest: true
    },
    {   
    title: "Alcatraz Island",
    lat: 37.826977, 
    lng: -122.422956,
    id: "nav1",
    visible: ko.observable(true),
    boolTest: true
    },
    {   
    title: "Fishermans Wharf San Francisco",
    lat: 37.808000, 
    lng: -122.417743,
    id: "nav2",
    visible: ko.observable(true),
    boolTest: true
    },
    {   
    title: "Chinatown San Francisco",
    lat: 37.794138, 
    lng: -122.407791,
    id: "nav3",
    visible: ko.observable(true),
    boolTest: true
    },
    {
    title: "Lombard Street San Francisco",
    lat: 37.802139, 
    lng: -122.418740,
    id: "nav4",
    visible: ko.observable(true),
    boolTest: true
    },   
];

// Load relevant wikipedia articles for each marker
function loadWikipediaArticles(subject){
    var $wikiSearchHeading = $('#wikipedia-search-heading');
    var $wikiElem = $('#relevant-wikipedia-articles');

    $wikiSearchHeading.text(subject + " Wikipedia Articles");

    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + subject +
    '&format=json&callback=wikiCallback';

    // Error handling for wikipedia jsonp request
    var wikiRequestTimeout = setTimeout(function(){
        $wikiSearchHeading.text("Failed to get wikipedia resources.");
    }, 6000);

    $.ajax({
        url: wikiUrl,
        dataType: 'jsonp',
        success: function(response){
            $wikiElem.empty();
            articleList = response[1];
            for(var i = 0; i < articleList.length; i++){
                var articleStr = articleList[i];
                var url = 'https://en.wikipedia.org/wiki/' + articleStr;
                $wikiElem.append('<li><a href="' + url +'">' + articleStr + '</a></li>');            
            }
            clearTimeout(wikiRequestTimeout);
        }
    });
}

function setMarkers(location) {   
    for(i=0; i<location.length; i++) {
        location[i].holdMarker = new google.maps.Marker({
          position: new google.maps.LatLng(location[i].lat, location[i].lng),
          map: map,
          title: location[i].title,
          animation: google.maps.Animation.DROP  
        });
        var subject = location[i].title;
        location[i].contentString = "<h4>" + subject + "</h4>";
        var infowindow = new google.maps.InfoWindow({
            content: markersInfo[i].contentString
        });

        // Marker on click behavior
        new google.maps.event.addListener(location[i].holdMarker, 'click', (function(marker, i) {
          return function() {
            infowindow.setContent(location[i].contentString);
            loadWikipediaArticles(location[i].title);
            location[i].holdMarker.setAnimation(google.maps.Animation.BOUNCE);
            infowindow.open(map,this);
            var windowWidth = $(window).width();

            if(windowWidth <= 1080) {
                map.setZoom(14);
            } else if(windowWidth > 1080) {
                map.setZoom(16);  
            }

            map.setCenter(marker.getPosition());
          }; 
        })(location[i].holdMarker, i));
        
        var searchNav = $('#nav' + i);
        searchNav.click((function(marker, i) {
          return function() {
            infowindow.setContent(location[i].contentString);
            loadWikipediaArticles(location[i].title);
            infowindow.open(map,marker);
            map.setZoom(16);
            map.setCenter(marker.getPosition());
          }; 
        })(location[i].holdMarker, i));
    }
}

function setAllMap() {
  for (var i = 0; i < markersInfo.length; i++) {
    if(markersInfo[i].boolTest === true) {
    markersInfo[i].holdMarker.setMap(map);
    } else {
    markersInfo[i].holdMarker.setMap(null);
    }
  }
}

// Initialize map and load all markers
function initMap() {
    map = new google.maps.Map(document.getElementById('map'),{
       center: new google.maps.LatLng(37.774929, -122.419416),
       mapTypeControl: true,
       disableDefaultUI: false,
       zoom: 12
    });

    setMarkers(markersInfo);
    setAllMap(); 
}

var viewModel = {
    query: ko.observable(''),
};

viewModel.markersInfo = ko.dependentObservable(function() {
    var self = this;
    var search = self.query().toLowerCase();
    return ko.utils.arrayFilter(markersInfo, function(marker) {
    if (marker.title.toLowerCase().indexOf(search) >= 0) {
            marker.boolTest = true;
            return marker.visible(true);
        } else {
            marker.boolTest = false;
            setAllMap();
            return marker.visible(false);
        }
    });       
}, viewModel);

ko.applyBindings(viewModel);

$("#input").keyup(function() {
setAllMap();
});