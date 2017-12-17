'use strict';

var app = angular.module('mapApp',[]);

app.controller('mapController', function($scope, $http, $window, $exceptionHandler) {

	var mapboxAccessToken = 'pk.eyJ1IjoiYWxpbmFkaHVtMjAxNyIsImEiOiJjamJhcDNleGswdWpsMnF1cGRsNmRqZnM5In0.wchgRianFrALk0bMQHhA_A';
	var map = L.map('map').setView(new L.LatLng(64.9, 25), 5);
	var info = L.control();

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken,{
			id: 'mapbox.light',
			maxZoom: 10,
			minZoom: 5,
	}).addTo(map);


	var geojson = L.geoJson(finlandStatesData, {
	    style: style,
	    onEachFeature: onEachFeature
	}).addTo(map);

	function onEachFeature(feature, layer) {
	    layer.on({
	        mouseover: highlightFeature,
	        mouseout: resetHighlight,
	        click: zoomToFeature
	    });
	}

	var searchControl = new L.Control.Search({
			layer:  geojson,
			propertyName: 'name',
			marker: false,
			moveToLocation: function(latlng, title, map) {
				map.fitBounds( latlng.layer.getBounds() );
				var zoom = map.getBoundsZoom(latlng.layer.getBounds());
	  		map.setView(latlng, zoom);
			}
		});

		searchControl.on('search:locationfound', function(e) {
			e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
			info.update(e.layer.feature.properties);
			if(e.layer._popup){
				e.layer.openPopup();
			}
		}).on('search:collapsed', function(e) {
			geojson.eachLayer(function(layer) {
				geojson.resetStyle(layer);
			});
			info.update();
		});
		map.addControl(searchControl);


	function getColor(code) {
		let colors = ['#800026', '#BD0026', '#E31A1C', '#FC4E2A', '#FD8D3C', '#FEB24C', '#FED976', '#FFEDA0'];
		try {
			let codeNum = code.replace(/area/g, '');
			if (codeNum <= 100) {
				return colors[0];
			} else if (codeNum > 100 && codeNum <= 200) {
				return colors[1];
			} else if (codeNum > 200 && codeNum <= 300) {
				return colors[2];
			} else if (codeNum > 300 && codeNum <= 400) {
				return colors[3];
			} else if (codeNum > 400 && codeNum <= 500) {
				return colors[4];
			} else if (codeNum > 500 && codeNum <= 600) {
				return colors[5];
			} else if (codeNum > 600 && codeNum <= 700) {
				return colors[6];
			} else if (codeNum > 700) {
				return colors[7];
			}
		} catch (err) {
			$exceptionHandler("Error occured:", err.message || JSON.stringfy(err));
		}

	}

	function style(feature) {
	    return {
	        fillColor: getColor(feature.properties.code),
	        weight: 2,
	        opacity: 1,
	        color: 'white',
	        dashArray: '3',
					fillOpacity: 0.6
	    };
	}

	function highlightFeature(e) {
	    var layer = e.target;

	    layer.setStyle({
	        weight: 5,
	        color: '#666',
	        dashArray: '',
	        fillOpacity: 0.8
	    });

	    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
	        layer.bringToFront();
	    }
			info.update(layer.feature.properties);
	}

	function resetHighlight(e) {
	    geojson.resetStyle(e.target);
			info.update();
	}

	function zoomToFeature(e) {
	    map.fitBounds(e.target.getBounds());
	}

	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
	    this.update();
	    return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info.update = function (props) {
	    this._div.innerHTML = '<h4>Luckiest cities of Finland</h4>' +  (props ?
	        '<b>' + props.name + '</b><br />' + props.code
	        : 'Hover over a state');
	};

	info.addTo(map);

	// Disables map dragging
	// map.on('mouseover', function() {
  //   map.dragging.disable();
	// });

	$(window).on("resize", function() {
	  $("#map").height($(window).height()).width($(window).width());
	  map.invalidateSize();
	}).trigger("resize");

});
