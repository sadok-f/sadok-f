// save the original function object
var _superScrollSpy = $.fn.scrollspy;

// add a array of id's that need to be excluded
$.extend(_superScrollSpy.defaults, {
    excluded_ids: []
});

// create a new constructor
var ScrollSpy = function (element, options) {
    _superScrollSpy.Constructor.apply(this, arguments)
}

// extend prototypes and add a super function
ScrollSpy.prototype = $.extend({}, _superScrollSpy.Constructor.prototype, {
    constructor: ScrollSpy
    , _super: function () {
        var args = $.makeArray(arguments)
        // call bootstrap core
        _superScrollSpy.Constructor.prototype[args.shift()].apply(this, args)
    }
    , activate: function (target) {
        //if target is on our exclusion list, prevent the scrollspy to activate
        if ($.inArray(target, this.options.excluded_ids) > -1) {
            return
        }
        this._super('activate', target)
    }
});

// override the old initialization with the new constructor
$.fn.scrollspy = $.extend(function (option) {
    var args = $.makeArray(arguments),
        option = args.shift()

    //this runs everytime element.scrollspy() is called
    return this.each(function () {
        var $this = $(this)
        var data = $this.data('scrollspy'),
            options = $.extend({}, _superScrollSpy.defaults, $this.data(), typeof option == 'object' && option)

        if (!data) {
            $this.data('scrollspy', (data = new ScrollSpy(this, options)))
        }
        if (typeof option == 'string') {
            data[option].apply(data, args)
        }
    });
}, $.fn.scrollspy);

/* Google Maps API */


function initializeMap(el, options) {
    if (typeof google == 'undefined')
        return false;

    var map = new google.maps.Map(document.getElementById(el), options);
    var marker = new google.maps.Marker({
        position: map_latlng,
        title: 'My Location',
        shadow: markerIconDefault_shadow,
        icon: markerIconDefault_image,
        map: map
    });
}

function scrollTo(id) {
    if ($(id).length)
        $('html,body').animate({scrollTop: $(id).offset().top}, 'slow');
}

$(function () {
    $("[data-spy='scroll']").scrollspy({
        excluded_ids: ['#themer'],
        offset: 150
    });

    $('#menu a').not('[data-toggle]').click(function (e) {
        e.preventDefault();
        scrollTo($(this).attr('href'));
    });

    $('.gallery').on('mouseenter', 'ul li .thumb', function () {
        $(this).find('.hover').stop().fadeIn(150);
    }).on('mouseleave', 'ul li .thumb', function () {
        $(this).find('.hover').stop().fadeOut(150);
    }).find('.hover').hide();

    // main menu -> submenus
    $('#menu .collapse').on('show', function () {
        $(this).parents('.hasSubmenu:first').addClass('active');
    })
        .on('hidden', function () {
            $(this).parents('.hasSubmenu:first').removeClass('active');
        });

    $('.navbar.main #menu > li').on('mouseleave', function () {
        $('#menu .menu').not('.hide').addClass('hide');
    });

    // main menu visibility toggle
    $('.btn-navbar.main').click(function () {
        $('.container:first').toggleClass('menu-hidden');
        $('#menu').toggleClass('hidden-phone');

        if (typeof masonryGallery != 'undefined')
            masonryGallery();
    });

    // tooltips
    $('[data-toggle="tooltip"]').tooltip();

    $(window).resize(function () {
        if (!$('#menu').is(':visible') && !$('.container:first').is('menu-hidden'))
            $('.container:first').addClass('menu-hidden');
    });

    $(window).resize();

    $('a[data-toggle="prettyPhoto"]').prettyPhoto();

    function initGallery(filters, no_quicksand) {
        if (!$('#portfolio-list-temp').length)
            $('body').append('<ul id="portfolio-list-temp" class="hidden"></ul>');
        else
            $('#portfolio-list-temp').empty();

        var filter_selector = '#portfolio-list-master li'; // all

        if (filters)
            filter_selector += '[data-type*="' + filters + '"]';

        $(filter_selector).clone().appendTo('#portfolio-list-temp');

        if (!no_quicksand) {
            $('.quicksand-gallery ul').quicksand($('#portfolio-list-temp li'), {
                    duration: 0,
                    useScaling: false,
                    adjustHeight: false
                },
                function () {
                    if ($('.lightBox').size() > 0) $(".lightBox ul a").lightBox({maxWidth: $(document).width() - 40});
                    masonryGallery();
                });
        }
        else {
            $('.quicksand-gallery ul').empty().append($('#portfolio-list-temp li'));
            masonryGallery();
        }

        // PrettyPhoto
        if ($('.lightBox').size() > 0) $(".lightBox ul a").lightBox({maxWidth: $(document).width() - 40});
    }

    if (!$('#portfolio-list-master').length) {
        // Auto-set data-id for each list item as index / required by quicksand
        $('.quicksand-gallery ul li').each(function (index) {
            $(this).attr('data-id', index);
        });

        // Create master list if there is none to assist with filtering and pagination
        $('body').append('<ul id="portfolio-list-master" class="hidden"></ul>');
        $('.quicksand-gallery ul li').clone().appendTo('#portfolio-list-master');

        // init portfolio
        initGallery(false);
    }

    // Category filter click
    $('.nav-gallery-filter li').click(function () {
        // update active filter
        $('.nav-gallery-filter li').removeClass('active');
        $(this).addClass('active');

        // Update gallery to match filter, return to page 1
        initGallery($(this).attr('data-type'), true);
    });


    if ($('.progress').length) {
        $.each($('.progress'), function (k, v) {
            var b = $(this).find('.bar');
            b.width(b.attr('data-width'));
        });
    }

    $('#blog-listing').on('mouseenter', '.blog ul li .item', function () {
        $(this).find('.hover').css({height: $(this).outerHeight()});
    }).on('mouseleave', '.blog ul li .item', function () {
        $(this).find('.hover').css({height: '40'});
    });

    $('#blog-item').on('click', '.showBlogListing', function (e) {
        e.preventDefault();

        $('#blog-item').addClass('hide');
        $('#blog-listing').show();

        var h = (parseInt($('#blog-listing').height()) - 200);

        $('#blog-listing')
            .find('.ajax-loading').height(h).show()
            .parent().find('.ajax-loaded').empty().hide();

        var targetUrl = $(this).attr('href');

        $.ajax({
            url: targetUrl,
            type: 'GET',
            success: function (html) {
                $('#blog-listing .ajax-loading').hide();
                $('#blog-listing .ajax-loaded').html(html).show();
            }
        });
    });

    $('#blog-listing').on('click', '.pagination a', function (e) {
        e.preventDefault();

        if ($(this).parent().is('.disabled'))
            return;

        var h = (parseInt($('#blog-listing').height()) - 200);
        $('#blog-listing')
            .find('.ajax-loading').height(h).show()
            .parent().find('.ajax-loaded').empty().hide();

        var targetUrl = $(this).attr('href');

        $.ajax({
            url: targetUrl,
            type: 'GET',
            success: function (html) {
                $('#blog-listing .ajax-loading').hide();
                $('#blog-listing .ajax-loaded').html(html).show();
            }
        });
    });

    $('#blog-listing').on('click', '.blog a', function (e) {
        e.preventDefault();
        var item_id = $(this).attr('href').split('#blog-item-')[1];

        $('#blog-listing').hide();
        $('#blog-item')
            .find('.ajax-loading').show()
            .parent().find('.ajax-loaded').empty().hide().parent().removeClass('hide');

        $.ajax({
            url: 'ajax.php?section=blog-item&item_id=' + item_id,
            type: 'GET',
            success: function (html) {
                $('#blog-item .ajax-loading').hide();
                $('#blog-item .ajax-loaded').html(html).show();
            }
        });
    });

});