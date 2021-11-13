export const BEST_POSTS_SLIDER_CONFIG = {
  slidesToShow: 3,
  slidesToScroll: 3,
  dots: true,
  infinite: false,
  speed: 300,
  loop: false,
  autoplay: false,
  autoplayTimeout: 1000,
  autoplayHoverPause: false,
  responsive: [
    {
      breakpoint: 1000,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        infinite: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        infinite: true,
      },
    },
  ],
};
