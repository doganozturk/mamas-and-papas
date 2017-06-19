var app  = app || {};

app.init = app.init || {};
app.utils = app.utils || {};

// App config
app.config = {
  apiUrl: 'http://localhost:3002',
  endpoints: {
    search: '/search/quick'
  }
};

// Check if user is on a mobile device
app.utils.isMobile = function() {
  return $(window).width() < 960;
};

// Get host's base url
app.utils.getBaseUrl = function() {
  var location = window.location;
  var url = location.protocol + '//' + location.hostname;

  if (location.port != 80 && location.port)
    url = url + ':' + location.port;

  return url;
};

// AJAX configuration
app.utils.ajaxConfig = function () {
  // Adds abort all functionality for all ongoing XHR requests
  $.xhrPool = [];

  $.xhrPool.abortAll = function () {
    // cycle through list of recorded connection
    $(this).each(function (i, jqXHR) {
      // aborts connection
      jqXHR.abort();
      // removes from list by index
      $.xhrPool.splice(i, 1);
    });
  };

  // Setting config here
  $.ajaxSetup({
    // and connection to list
    beforeSend: function (jqXHR) {
      $.xhrPool.push(jqXHR);
    },
    complete: function (jqXHR) {
      // get index for current connection completed
      var i = $.xhrPool.indexOf(jqXHR);

      // removes from list by index
      if (i > -1)
        $.xhrPool.splice(i, 1);
    }
  });
};

// Init slider on homepage
app.init.slider = function () {
  var $carouselContent = $('#carouselContent');

  $carouselContent.slick({
    autoplay: true,
    autoplaySpeed: 2000,
    dots: false,
    arrows: false,
    infinite: true,
    speed: 300,
    fade: true,
    cssEase: 'linear'
  });
};

// Init search for desktop
app.init.search = function () {
  // Main UI elements
  var $searchInput = $('#searchInput');
  var $searchSubmit = $('#seachSubmit');
  var $searchSuggestions = $('#searchSuggestions');
  var $searchSuggestionsList = $('#searchSuggestions ul');
  var $loading = $('.search__suggestions__loading');

  // Init
  search();
  suggestionsVisibilityControl();

  // Empty list UI func.
  function emptyList() {
    $.xhrPool.abortAll();
    $searchSuggestionsList.empty();
    $searchSuggestions.slideUp();
  }

  // On keyup search
  function search() {
    $searchInput.on('keyup', function (e) {
      $loading.show();

      var keyword = $(this).val();

      if (keyword.length > 2) {
        var url = app.config.apiUrl + app.config.endpoints.search + '?keyword=' + keyword;
        var searchRequest = $.get(url);

        $.when(searchRequest)
          .then(function (result) {
            $loading.hide();

            var data = result;

            if (data.length)
              fillList(data);
            else
              emptyList();
          });
      } else
        emptyList();
    });
  }

  // fill suggestions-list with li elements
  // according to the data provided
  function fillList(data) {
    $searchSuggestionsList.empty();

    var html = "";

    $.each(data, function (key, value) {
      html += '<li class="search__suggestions__item">' + value.name + '</li>'
    });

    $searchSuggestionsList.append(html);
    $searchSuggestions.slideDown();
  };

  // If user clicks somewhere outside
  // suggestions-list slides up.
  function suggestionsVisibilityControl() {
    $(document).on('click', function (e) {

      var isVisible = $searchSuggestions.is(':visible');
      var hasClass = $(e.target).hasClass('search__suggestions') || $(e.target).hasClass('search__suggestions__item');

      if (!hasClass && isVisible)
        $searchSuggestions.slideUp();
    });
  }
};

(function() {
  'use strict';

  app.utils.ajaxConfig();

  app.init.slider();

  if (!app.utils.isMobile())
    app.init.search();

})();
