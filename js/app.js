/**
 * Main AngularJS Web Application
 */
var app = angular.module('imagexapp', [
    'ngRoute'
]);

/**
 * Configure the Routes
 */
app.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "partials/mapview.html",
            controller: "mapviewCtrl"
        })
        // Pages
        .when("/mapview", {
            templateUrl: "partials/mapview.html",
            controller: "mapviewCtrl"
        })
        .when("/worldwind", {
            templateUrl: "partials/worldwind.html",
            controller: "worldwindCtrl"
        })
        .when("/about", {
            templateUrl: "partials/about.html",
            controller: "PageCtrl"
        })
        // else 404
        .otherwise("/404", {
            templateUrl: "partials/404.html",
            controller: "PageCtrl"
        });
}]);


/*Services */

app.factory('Maptasks', function() {
    var CONSTURL = "https://d2xy2u667w9tvp.cloudfront.net/LAYDB-1-BlueMarbleWithBathymetry-data/1072915200000/"
    var FORMAT = '.jpg';
    var INILAT = -90.0;
    var INILON = -180.0;
    var FINLAT = 90.0;
    var factory = {};
    factory.createLevels = function(r, c, z, constIncrement) {
        var levelArray = [];
        var minx = INILAT,
            miny = INILON,
            maxx = INILAT + constIncrement,
            maxy = INILON + constIncrement;
        for (var y = 0; y <= c; y++) {
            if (y != 0) {
                miny = miny + constIncrement;
                maxy = maxy + constIncrement;

            }
            minx = INILAT;
            maxx = INILAT + constIncrement;
            for (var x = 0; x <= r; x++) {
                if (x != 0) {
                    maxx = maxx + constIncrement;
                    minx = minx + constIncrement;
                }
                levelArray.push({
                    level: z,
                    row: x,
                    col: y,
                    imageUrl: CONSTURL + z + "/" + x + "/" + x + "_" + y + FORMAT,
                    bottomLeft: [minx, miny],
                    topRight: [maxx, maxy]
                });
            }
        }
        return levelArray;
    };

    factory.loadtiles = function(m, t, b, z) {

        // loadtiles on demand
        t.forEach(function(imgObj) {
            var sw = L.latLng(imgObj.bottomLeft);
            var ne = L.latLng(imgObj.topRight);
            var bounds = L.latLngBounds(sw, ne);
            if (b.intersects(bounds)) {
                var imageBounds = [
                    imgObj.bottomLeft,
                    imgObj.topRight
                ];
                L.imageOverlay(imgObj.imageUrl, imageBounds).addTo(m);
                //    console.log("Loaded :" + imgObj.imageUrl);
            }
        });


    };
    return factory;
});

app.service('Levels', function(Maptasks) {
    this.levels = function(x, y, z, ci) {
        return Maptasks.createLevels(x, y, z, ci);
    };
    this.tilesonDemand = function(map, tiles, mapBounds, mapZoom) {

        return Maptasks.loadtiles(map, tiles, mapBounds, mapZoom);
    };
});


/*Controllers*/
app.controller('mapviewCtrl', function($scope, $location, $timeout, Levels) {
    // create a map in the "map" div, set the view to a given place and zoom
    var mapct = L.map("mapid", {
        zoomControl: false
    }).setView([0, 0], 3);
    var zoomHome = L.Control.zoomHome();
    zoomHome.addTo(mapct);
    $scope.mapZoomLevel = 3;
    $scope.displayBounds = {
        sw: '',
        ne: ''
    };
    mapct.setMaxBounds(L.point(-90, -180), L.point(90, 180));
    mapct.setMaxZoom(14);
    // add an OpenStreetMap tile layer
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapct);
    mapct.on('load', function(evt) {
        var mapBounds = mapct.getBounds();
        var zoom = mapct.getZoom();
        $scope.mapZoomLevel = zoom;
        $scope.checkIntersection(mapBounds, zoom);

    });

    // on map zooming
    mapct.on('zoom', function(evt) {
        var mapBounds = mapct.getBounds();
        //  alert(evt.target._zoom + "   " + mapBounds);
        // clear map overlayPane
        while (mapct.getPanes().overlayPane.firstChild) {
            mapct.getPanes().overlayPane.removeChild(mapct.getPanes().overlayPane.firstChild);
        }
        $scope.checkIntersection(mapBounds, evt.target._zoom);
    });

    // end of panning
    mapct.on('moveend', function(evt) {
        var mapBounds = mapct.getBounds();
        var zoom = mapct.getZoom();
        $scope.checkIntersection(mapBounds, zoom);
    });

    //Get tiles on demand
    $scope.checkIntersection = function(mapBounds, mapZoom) {
        $scope.mapZoomLevel = parseInt(mapZoom);
        $scope.displayBounds = {
            sw: mapBounds.getSouthWest().lat.toFixed(3) +","+mapBounds.getSouthWest().lng.toFixed(3)  ,
            ne: mapBounds.getNorthEast().lat.toFixed(3) +","+mapBounds.getSouthWest().lng.toFixed(3)
        };

        // set loading images on Map zoom levels
        // on zoom level changes add the respective imageoverlays on the map
        console.log("BOUNDS:" + mapBounds.getSouthWest() + "," + mapBounds.getNorthEast() + " ZOOM:" + mapZoom);
        var z = mapZoom;
        if (z > 0 && z <= 3) {
            Levels.tilesonDemand(mapct, $scope.firstlevel, mapBounds, mapZoom);
            $scope.imagesLevel = 0;
        }
        if (z > 3 && z <= 5) {
            Levels.tilesonDemand(mapct, $scope.secondlevel, mapBounds, mapZoom);
            $scope.imagesLevel = 1;
        }
        if (z > 5 && z <= 7) {
            Levels.tilesonDemand(mapct, $scope.thirdlevel, mapBounds, mapZoom);
            $scope.imagesLevel = 2;
        }
        if (z > 7 && z <= 9) {
            Levels.tilesonDemand(mapct, $scope.fourthlevel, mapBounds, mapZoom);
            $scope.imagesLevel = 3;
        }
        if (z > 9 && z <= 18) {
            Levels.tilesonDemand(mapct, $scope.fifthlevel, mapBounds, mapZoom);
            $scope.imagesLevel = 4;
        }
        $timeout(function() {
           $scope.$apply()
       }, 100);
    }


    //create the matrices for all zoom levels
    $scope.firstlevel = Levels.levels(3, 7, 0, 45);
    $scope.secondlevel = Levels.levels(7, 15, 1, 22.5);
    $scope.thirdlevel = Levels.levels(15, 31, 2, 11.25);
    $scope.fourthlevel = Levels.levels(31, 63, 3, 5.625);
    $scope.fifthlevel = Levels.levels(63, 127, 4, 2.8125);

    var loadL1Images = function() {
        var mapBounds = mapct.getBounds();
        var zoom = mapct.getZoom();
        $scope.checkIntersection(mapBounds, zoom);
    };

    loadL1Images();
    console.log("Map!!");
});



app.controller('worldwindCtrl', function($scope, $location, $http) {

      // Create a World Window for the canvas.
    var wwd = new WorldWind.WorldWindow("canvasOne");

    //   Add some image layers to the World Window's globe.
     wwd.addLayer(new WorldWind.BMNGOneImageLayer());

    // Add a compass, a coordinates display and some view controls to the World Window.
    wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
    wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

   // API page : http://worldwindserver.net/webworldwind/api-doc/TiledImageLayer.html
   // It is not work because there is :  "-layer/"
   //at line # 220  WebWorldWind/src/layer/TiledImageLayer.js => TiledImageLayer.prototype.createTile function which is not the format of the Cache URL
   // this is wrong: https://d2xy2u667w9tvp.cloudfront.net/LAYDB-1-BlueMarbleWithBathymetry-data/1072915200000/-layer/0/0/0_1.jpg

    var sector = new WorldWind.Sector(-90, 90, -180, 180);
    var location = new WorldWind.Location(45, 45); //tile size in degree
    var numLevels = 5;
    var imageFormat = "image/jpeg";
    var cachePath = "https://d2xy2u667w9tvp.cloudfront.net/LAYDB-1-BlueMarbleWithBathymetry-data/1072915200000/";
    var tileWidth = 256;
    var tileHeight = 256;
    var tm = new WorldWind.TiledImageLayer(sector, location, numLevels, imageFormat, cachePath, tileWidth, tileHeight)
    tm.prePopulate(wwd);
    tm.refresh();
    wwd.addLayer(tm);

    console.log("WW Loaded");
});


/**
 * Controls all other Pages
 */
app.controller('PageCtrl', function($scope) {
    console.log("Page Controller");

    $('.carousel').carousel({
        interval: 5000
    });

    // Activates Tooltips for Social Links
    $('.tooltip-social').tooltip({
        selector: "a[data-toggle=tooltip]"
    })
});
