LastAirBnb.Views.MapShow = Backbone.View.extend({

  attributes: {
    id: "map-canvas"
  },

  initialize: function () {
    this._markers = {};

    this.listenTo(this.collection, 'add', this.addMarker);
    this.listenTo(this.collection, 'remove', this.removeMarker);
  },

  initMap: function () {
    console.log('initializing map');

    var MAP_TYPE = "avatar";

    // Normalizes the coords that tiles repeat across the x axis (horizontally)
    // like the standard Google map tiles.
    var getNormalizedCoord = function(coord, zoom) {
      var y = coord.y;
      var x = coord.x;

      // tile range in one direction range is dependent on zoom level
      // 0 = 1 tile, 1 = 2 tiles, 2 = 4 tiles, 3 = 8 tiles, etc
      var tileRange = 1 << zoom;

      // don't repeat across y-axis (vertically)
      if (y < 0 || y >= tileRange) {
        return null;
      }

      // repeat across x-axis
      if (x < 0 || x >= tileRange) {
        x = (x % tileRange + tileRange) % tileRange;
      }

      return {
        x: x,
        y: y
      };
    }

    var avatarTypeOptions = {
      getTileUrl: function(coord, zoom) {
          var coord = getNormalizedCoord(coord, zoom);
          if (!coord) {
            return null;
          }
          return "https://s3-us-west-1.amazonaws.com/lastairbnb/map/tile_" +
            zoom + "_" + coord.x + "-" + (coord.y) + ".png";
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 5,
      minZoom: 0,
      radius: 1738000,
      name: "Avatar"
    };

    var avatarMapType = new google.maps.ImageMapType(avatarTypeOptions);

    var mapOptions = {
      center: { lat: 27.21555620902969, lng: 2.1807861328125},
      zoom: 3,
      streetViewControl: false,
      mapTypeControlOptions: {
         mapTypeIds: [MAP_TYPE]
      },
    };


    this._map = new google.maps.Map(this.el, mapOptions);
    this._map.mapTypes.set(MAP_TYPE, avatarMapType);
    this._map.setMapTypeId(MAP_TYPE);




    this.collection.each(this.addMarker.bind(this));
    this.attachMapListeners();
  },

  attachMapListeners: function () {
    google.maps.event.addListener(this._map, 'idle', this.search.bind(this));

    // testing
    google.maps.event.addListener(this._map, 'click', this.displayLatLng.bind(this));
  },

  search: function (event) {
    // console.log('searching');
    var mapBounds = this._map.getBounds();
    var ne = mapBounds.getNorthEast();
    var sw  = mapBounds.getSouthWest();

    var filterData = {
      lat: [sw.lat(), ne.lat()],
      lng: [sw.lng(), ne.lng()],
    };

    this.collection.fetch({
      data: { filter_data: filterData }
    });
  },

  addMarker: function (listing) {
    if (this._markers[listing.id]) { return };
    var view = this;

    var latLng = new google.maps.LatLng(
      listing.get('lat'), listing.get('lng')
    );

    var marker = new google.maps.Marker({
      position: latLng,
      map: this._map,
      title: listing.get('title')
    });

    google.maps.event.addListener(marker, 'click', function (event) {
      view.showMarkerInfo(event, marker);
    });

    this._markers[listing.id] = marker;
  },

  removeMarker: function (listing) {
    if (!this._markers[listing.id]) { return };
    var marker = this._markers[listing.id];
    marker.setMap(null);
    delete this._markers[listing.id];
  },

  showMarkerInfo: function (event, marker) {
    var infoWindow = new google.maps.InfoWindow({
      content: marker.title
    });
    infoWindow.open(this._map, marker);
  },

  displayLatLng: function (event) {
    console.log('lat: ' + event.latLng.lat() + ', lng: ' + event.latLng.lng());
  },

});
