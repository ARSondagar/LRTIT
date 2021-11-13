export const TARIFF_SLIDER_CONFIG = {
  slidesToShow: 4,
  slidesToScroll: 0,
  dots: true,
  infinite: false,
  speed: 300,
  loop: false,
  autoplay: false,
  autoplayTimeout: 1000,
  autoplayHoverPause: false,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        dots: false,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
      },
    },
  ],
};
