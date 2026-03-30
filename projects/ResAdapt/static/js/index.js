window.HELP_IMPROVE_VIDEOJS = false;


$(document).ready(function () {
    var options = {
        slidesToScroll: 1,
        slidesToShow: 1,
        loop: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 5000,
    }

    if (document.querySelectorAll('.carousel').length) {
        bulmaCarousel.attach('.carousel', options);
    }

    if (typeof bulmaSlider !== 'undefined' && bulmaSlider.attach) {
        bulmaSlider.attach();
    }
})
