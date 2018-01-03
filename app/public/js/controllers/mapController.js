'use strict';

angular.module('mapApp', ['ngRoute', 'ngMessages'])
.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'index.html',
    controller: 'mapController'
  });
}])

.controller('mapController', function($scope, $http, $window, $exceptionHandler, apiService) {

	var mapboxAccessToken = 'pk.eyJ1IjoiYWxpbmFkaHVtMjAxNyIsImEiOiJjamJhcDNleGswdWpsMnF1cGRsNmRqZnM5In0.wchgRianFrALk0bMQHhA_A';
	var map = L.map('map').setView(new L.LatLng(64.9, 30), 5);
	var stateInfo = L.control({position: 'bottomright'});

	$scope.layers = [];
	$scope.cities = [];
	$scope.citiesFromJson = [];

	var lotteryEntities = {
		'EuroJackpot': '#5E3177',
		'Lotto': '#EC342B',
		'Keno': '#E99D3B'
	};

	L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken,{
			id: 'mapbox.light',
			maxZoom: 10,
			minZoom: 5,
	}).addTo(map);

	var geojson = L.geoJson(finlandStatesData, {
	    style: style,
	    onEachFeature: onEachFeature
	}).addTo(map);

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
      if($scope.series && $scope.series.length > 0){
        $scope.reserveSeries = [];
        $scope.reserveTopCities = $scope.topCities;
        for (var i = 0; i < $scope.series.length; i++) {
          let serie = $scope.series[i];
          let serieCopy = Object.assign({}, serie);
          $scope.reserveSeries.push(serieCopy);
          if(serie && serie.data && serie.data.length > 0){
            serie['data'] = [parseInt(e.layer.feature.properties['code'].replace(/area/g, ''))]
          }
        }
        $scope.topCities = [e.layer.feature.properties['name']];
        generateHighChart();

      }
			stateInfo.update(e.layer.feature.properties);
			if(e.layer._popup){
				e.layer.openPopup();
			}
		}).on('search:collapsed', function(e) {
			geojson.eachLayer(function(layer) {
				geojson.resetStyle(layer);
			});
      if($scope.reserveSeries && $scope.reserveSeries.length > 0 && $scope.reserveTopCities && $scope.reserveTopCities.length > 0){
         $scope.series = $scope.reserveSeries;
         $scope.topCities = $scope.reserveTopCities;
        generateHighChart();
      }
			stateInfo.update();
		});
		map.addControl(searchControl);

    stateInfo.onAdd = function (map) {
  	    this._div = L.DomUtil.create('div', 'info legend');
  			this._div.innerHTML = "<div id='stateInfo' style='min-width: 310px; height: 400px; margin: 0 auto'></div>";
  	    this.update();
  	    return this._div;
  	};

  	// method that we will use to update the control based on feature properties passed
  	stateInfo.update = function (props) {
	    // this._div.innerHTML = '<h4>Luckiest cities of Finland</h4>' +  (props ?
	    //     '<b>' + props.name + '</b><br />' + props.code
	    //     : 'Hover over a state');
  	};
  	stateInfo.addTo(map);

		$scope.getLotteryCitiesFromJson = function(){
      Promise.resolve().then(function() {
        return apiService.get('../../data/citiesLottery.json').then(function(result){
  				if(result && result.data){
            return Promise.resolve(result.data.lottery);
  				}
          return Promise.reject({message: 'getLotteryCitiesFromJson(): Could not get data from json file'});
  			});
      }).then(function(cities){
        if(cities && cities.length > 0){
          if($scope.layers && $scope.layers.length > 0){
            let citiesFromLayers = [];
            for (var i = 0; i < $scope.layers.length; i++) {
              let layerProperty = $scope.layers[i].feature.properties;
              let city = {name: layerProperty.name, lotteryGames: null};
              citiesFromLayers.push(city);
            }
            if(citiesFromLayers && citiesFromLayers.length > 0){
              return Promise.resolve([citiesFromLayers, cities]);
            }
            return Promise.resolve();
          }
        } else {
          return Promise.reject({message: 'getLotteryCitiesFromJson(): cities array is null rejecting..'});
        }
      }).then(function([citiesFromLayers, cities]){
        let filteredCities = [];
        for (let object of cities) {
          if(citiesFromLayers.includes(object.city.name) > -1){
            citiesFromLayers.filter(function(cityFromLayers){
              if(cityFromLayers.name == object.city.name){
                cityFromLayers.lotteryGames = object.city.mostPlayedGames
                filteredCities.push(cityFromLayers);
              }
            });
          }
        }
        if(filteredCities && filteredCities.length > 0){
          return Promise.resolve(filteredCities);
        }
        return Promise.reject({message: 'getLotteryCitiesFromJson(): filteredCities array is either empty or null'});
      }).then(function(filteredCities){
        $scope.topCities = filteredCities.map(a => a.name).sort();
        $scope.series = [];
        if(filteredCities[0].lotteryGames && Object.keys(filteredCities[0].lotteryGames).length === 3){
          let serie = {};
          for(let lotteryGame in filteredCities[0].lotteryGames){
            serie = {}
            let lotteryData = [];
            serie['name'] = lotteryGame;
            serie['color'] = lotteryEntities[lotteryGame];
            for (let i = 0; i < filteredCities.length; ++i) {
              let filterCityLotteryGames = filteredCities[i].lotteryGames;
              lotteryData.push(parseInt(filterCityLotteryGames[lotteryGame]));
            }
            serie['data'] = lotteryData;
            $scope.series.push(serie);
          }
        }
        generateHighChart();
      }).catch(function(err){
        $exceptionHandler("Error occured: getLotteryCitiesFromJson():", err.message || err);
      });
		}();

	function getColor(code) {
		let colors = Object.values(lotteryEntities);
		try {
			let codeNum = code.replace(/area/g, '');
			if (codeNum <= 300) {
				return colors[0];
			} else if (codeNum > 300 && codeNum <= 600) {
				return colors[1];
			} else if (codeNum > 600) {
				return colors[2];
			}
		} catch (err) {
			$exceptionHandler("Error occured: getColor():", err.message || JSON.stringfy(err));
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
			stateInfo.update(layer.feature.properties);
	}

	function resetHighlight(e) {
	    geojson.resetStyle(e.target);
			stateInfo.update();
	}

	function zoomToFeature(e) {
	    map.fitBounds(e.target.getBounds());
	}

	function onEachFeature(feature, layer) {
	    layer.on({
	        mouseover: highlightFeature,
	        mouseout: resetHighlight,
	        click: zoomToFeature
	    });
			$scope.layers.push(layer);
	}

  function generateHighChart(){
    Highcharts.chart('stateInfo', {
        chart: {
            type: 'column'
        },
        title: {
            text: 'Luckiest cities of Finland'
        },
        xAxis: {
            categories: $scope.topCities
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Lottery win'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.percentage:.0f}%)<br/>',
            shared: true
        },
        plotOptions: {
            column: {
                stacking: 'percent'
            }
        },
        series: $scope.series
      });
  }


	// Disables map dragging
	// map.on('mouseover', function() {
  //   map.dragging.disable();
	// });

	$(window).on("resize", function() {
	  $("#map").height($(window).height()).width($(window).width());
	  map.invalidateSize();
	}).trigger("resize");

});
