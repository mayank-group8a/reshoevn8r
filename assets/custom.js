/*-----------------------------------------------------------------------------/
/ Custom Theme JS
/-----------------------------------------------------------------------------*/
var Shopify = Shopify || {};
// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
Shopify.money_format = theme.moneyFormat;
Shopify.formatMoney = function(cents, format) {
    if (typeof cents == 'string') {
        cents = cents.replace('.', '');
    }
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = (format || this.money_format);

    function defaultOption(opt, def) {
        return (typeof opt == 'undefined' ? def : opt);
    }

    function formatWithDelimiters(number, precision, thousands, decimal) {
        precision = defaultOption(precision, 2);
        thousands = defaultOption(thousands, ',');
        decimal = defaultOption(decimal, '.');
        if (isNaN(number) || number == null) {
            return 0;
        }
        number = (number / 100.0).toFixed(precision);
        var parts = number.split('.'),
            dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
            cents = parts[1] ? (decimal + parts[1]) : '';
        return dollars + cents;
    }
    switch (formatString.match(placeholderRegex)[1]) {
        case 'amount':
            value = formatWithDelimiters(cents, 2);
            break;
        case 'amount_no_decimals':
            value = formatWithDelimiters(cents, 0);
            break;
        case 'amount_with_comma_separator':
            value = formatWithDelimiters(cents, 2, '.', ',');
            break;
        case 'amount_no_decimals_with_comma_separator':
            value = formatWithDelimiters(cents, 0, '.', ',');
            break;
    }
    return formatString.replace(placeholderRegex, value);
};

// Austin - 11/18/20 - adding some misc Shopify functions to help with future development
Shopify.onError = function(XMLHttpRequest, textStatus) {
  // Shopify returns a description of the error in XMLHttpRequest.responseText.
  // It is JSON.
  // Example: {"description":"The product 'Amelia - Small' is already sold out.","status":500,"message":"Cart Error"}
  var data = eval('(' + XMLHttpRequest.responseText + ')');
  if (!!data.message) {
    alert(data.message + '(' + data.status  + '): ' + data.description);
  } else {
    alert('Error : ' + Shopify.fullMessagesFromErrors(data).join('; ') + '.');
  }
};

Shopify.fullMessagesFromErrors = function(errors) {
  var fullMessages = [];
  jQuery.each(errors, function(attribute, messages) {
    jQuery.each(messages, function(index, message) {
      fullMessages.push(attribute + ' ' + message);
    });
  });
  return fullMessages
}

Shopify.onCartUpdate = function(cart) {
  alert('There are now ' + cart.item_count + ' items in the cart.');
};

Shopify.onCartShippingRatesUpdate = function(rates, shipping_address) {
  var readable_address = '';
  if (shipping_address.zip) readable_address += shipping_address.zip + ', ';
  if (shipping_address.province) readable_address += shipping_address.province + ', ';
  readable_address += shipping_address.country
  alert('There are ' + rates.length + ' shipping rates available for ' + readable_address +', starting at '+ Shopify.formatMoney(rates[0].price) +'.');
};

Shopify.onItemAdded = function(line_item) {
  alert(line_item.title + ' was added to your shopping cart.');
};

Shopify.onProduct = function(product) {
  alert('Received everything we ever wanted to know about ' + product.title);
};

Shopify.resizeImage = function(image, size) {
  try {
    if(size == 'original') { return image; }
    else {
      var matches = image.match(/(.*\/[\w\-\_\.]+)\.(\w{2,4})/);
      return matches[1] + '_' + size + '.' + matches[2];
    }
  } catch (e) { return image; }
};

function refreshCart() {
  $(document).trigger('refresh-cart');
}

// Insert any custom theme js here...
$(document).ready(function() {
    $('.product-form__quantity-selector').click(function(event) {
        event.stopPropagation();
        event.preventDefault();
    });
    $('.product-card-addtocart').click(function(event) {
        refreshCart();
        $(document).on('drawer_open_start', function() {
            $('.product-form>.btn').addClass('btn--primary');
            $('.product-form>.btn').removeClass('btn--secondary');
            $('.product-form>.btn').removeClass('btn--to-secondary-transitioned');
            $('.product-form>.btn .primary-text').show();
            $('.product-form>.btn .secondary-text').hide();
            $('.product-form>p').removeClass('product__notification--success')
            $('.product-form>.btn').removeClass("ajax-cart__toggle");
        });
        $('.cart-drawer__checkout').prop("disabled", false);
    });
});




$('body').click(function() {
	 $("body").css("overflow", "scroll")
})

 $(".cart-drawer__close-button").click(function(){
   $("body").removeClass('drawer--active');
   $("body").css("overflow", "scroll")
 })
 

  
 $('.atc-trigger').click(function() {
   $("body").addClass('drawer--active');
   $('.js-ajax-cart-drawer-trigger').trigger("click");
 })
 
 

 $('.sk-home-atc').click(function() {
    $("body").addClass('drawer--active');
    $('.js-ajax-cart-drawer-trigger').trigger("click");
  })
  
 $('.sk-atc').click(function() {
   $("body").addClass('drawer--active');
   $('.js-ajax-cart-drawer-trigger').trigger("click");
//    $("body").css("overflow", "hidden");
 })
 

$(".cart-drawer__close-button").click(function(){
   $("#shoe-care-products-shoe-care-supplies-reshoevn8r").removeClass('drawer--active');
 })
 



 $('.sk-pdp-atc').click(function() {
 	$('.js-ajax-cart-drawer-trigger').trigger("click");
 })
 
 
 
 
 
//  $(".main-content").click(function(e) { 
//        e.stopPropagation();
//        $("#shoe-care-products-shoe-care-supplies-reshoevn8r").removeClass('drawer--active');
//  })
 

// global variable for the player
var player;

// this function gets called when API is ready to use
function onYouTubePlayerAPIReady() {
    // create the global player from the specific iframe (#video)
    player = new YT.Player('video', {
        events: {
            // call this function when player is ready to use
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {

    // bind events
    var playButton = document.getElementById("play-button");
    playButton.addEventListener("click", function() {
        player.playVideo();
    });

    var pauseButton = document.getElementById("pause-button");
    pauseButton.addEventListener("click", function() {
        player.pauseVideo();
    });

    var stopButton = document.getElementById("stop-button");
    stopButton.addEventListener("click", function() {
        player.stopVideo();
    });

}

// Inject YouTube API script
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


//BLOG POSTS NAVIGATION
$(".how-to-nav li a[href]").each(function() {
    if (this.href == window.location.href) {
        $(this).addClass("current");
    }
});



$('.hamburger-menu').click(function(e) {
  var clicked = "false";
  console.log(clicked);
  
  e.preventDefault();
  var overflowState = 'auto'

  if (clicked == "false") {
  overflowState = 'hidden';
  clicked = "true";
  } else {
  overflowState = 'auto';
  clicked = "false";
  }
  
  $('html, body').css('overflow', overflowState);
  
});


$('.qty-btn').click(function (e) {
	e.preventDefault();
})



$(window).scroll(function(){
  var sticky = $('.site-header'),
      scroll = $('body').scrollTop() || $('html').scrollTop();

  if (scroll >= 10) sticky.addClass('site-header--fixed')
  else sticky.removeClass('site-header--fixed');
});


$(".close-button").click(function(){
	$("html").css({ 'overflow' : ''});
})


$("body").click(function(){
	$("html").css({ 'overflow' : ''});
})




$('.sk-search-a').click(function(e) {
  e.preventDefault();
   e.stopPropagation();
	$('.sk-search').slideDown();
  $('.sk-search-field').focus();
  
  
  
  //     $(this).css('display', 'none');
//   $('.sk-search-x').css('display', 'inline-block')
})

$('.sk-search-x').click(function(e) {
  $('.sk-search').slideUp();
  
//   e.preventDefault();
//    $(this).css('display', 'none');
//   $('.sk-search-a').css('display', 'inline-block')
})

$('body').click(function() {
	$('.sk-search').slideUp();
})


$('.sk-search-a-mob').click(function(e) {
  e.preventDefault();
  e.stopPropagation();
   $('.sk-search').slideDown();
   $('.sk-search-field').focus();
  
//     $(this).css('display', 'none');
//   $('.sk-search-x-mob').css('display', 'inline-block')
})

$('.sk-search-x-mob').click(function(e) {
  $('.sk-search').slideUp();

//   e.preventDefault();
//    $(this).css('display', 'none');
//   $('.sk-search-a-mob').css('display', 'inline-block')
})


$('body').click(function (e) {
    $('.sk-search').slideUp();
});

/* SV 03.04.20 - Switch image on scroll */
function observeProductScroll(p_options) {
  document.querySelectorAll(p_options.selector).forEach(function(item) {
    let itemHeight = item.clientHeight;
    let windowHeight = window.innerHeight;
    let m = windowHeight/2 + itemHeight/2;

    let options = {
      root: null,
      rootMargin: p_options.margin,
    };

    let observer = new IntersectionObserver(function(entries) {
      p_options.callback(entries[0]);
    }, options);

    observer.observe(item);
  });
}

function onPageScrollApplyHoverEffect(p_options) {
  observeProductScroll({
    selector: p_options.selector,
    margin: p_options.margin,
    callback: function(entry) {
      //console.log({entry});
      let itemActive = entry.intersectionRatio > 0;
      entry.target.classList[itemActive ? 'add' : 'remove']('hover-active');
    }
  });
}

function observeMutations(elementSelector, callback) {
  var observer = new MutationObserver(callback);
  var config = { attributes: true, childList: true, characterData: false };
  observer.observe(document.querySelector(elementSelector), config);

  return observer;
}  

function getCart() {
  return $.getJSON('/cart.js');
}

function getProductJson(handle) {
  return $.getJSON(`/products/${handle}.js`);
}

$(document).ready(function() {
  console.log('READY');
  
  /* Apply hover effect on scroll - Home page, collections page */
  onPageScrollApplyHoverEffect({
    selector: '.sk-featured-product-a',
    margin: `0px 0px -65% 0px`
  });
  
  /* Apply hover effect on scroll - Recommended products on PDP */
  $(document).on('product-recommendations-added', function(e) {
    //console.log(e);
    onPageScrollApplyHoverEffect({
      selector: '.sk-featured-product-a',
      margin: `0px 0px -35% 0px`
    });
  });  

  /* On Subscription option selected, hide Buy Now Buttons */
  $(document).on('change', '#rc_container input[type="radio"]', function(e) {
    var isSubscription = $('.rc_radio__autodeliver').prop('checked');
    $('.buy-now-div')[isSubscription ? 'addClass' : 'removeClass']('hide');
  });
  
  /* On Subscription page, hide subscription price if currency is not USD */
  observeMutations('#rc_container', function(m) {
    var isUSD = Shopify.currency.active === "USD";
    if (!isUSD) {
      $('.rc_label__discount').text($('.rc_label__discount').text().replace(':', ''));
      $('#rc_price_autodeliver').hide();
    }
  });
});