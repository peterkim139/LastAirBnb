LastAirBnb.Routers.Router = Backbone.Router.extend({
  routes: {
    '': 'welcome',
    'reservations': 'reservations',
    'listings/:id': 'show',
    'listings': 'index',
    'search': 'search',
  },

  initialize: function (options) {
    this.$rootEl = options.$rootEl;
    this.listings = new LastAirBnb.Collections.Listings();
    this.loginModal = new LastAirBnb.Modals.LoginModal();
    
    $('#login').on('click', function(e){
      e.preventDefault();
      $('.login-modal').html(this.loginModal.render().el);
    }.bind(this));
  },

  show: function (id) {
    var listing = this.listings.getOrFetch(id);
    var view = new LastAirBnb.Views.ListingShow({
      model: listing
    });
    this._swapView(view);
  },

  index: function () {
    var listings = new LastAirBnb.Collections.Listings();
    listings.fetch();
    var view = new LastAirBnb.Views.ListingsIndex({
      collection: listings
    });
    this._swapView(view);
  },

  welcome: function () {
    var view = new LastAirBnb.Views.WelcomeView();
    this._swapView(view);
  },

  search: function (city) {
    var view  = new LastAirBnb.Views.ListingsSearch({
      collection: this.listings
    });
    this._swapView(view);
  },

  reservations: function (city) {
    var reservations = new LastAirBnb.Collections.Reservations();
    reservations.fetch();
    var view = new LastAirBnb.Views.ReservationsIndex({
      collection: this.reservations,
    });
    this._swapView(view);
  },

  _swapView: function (view) {
    this._currentView && this._currentView.remove();
    this._currentView = view;
    this.$rootEl.html(view.$el);
    view.render();
  }

});
