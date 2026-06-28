/* =========================================================================
   SITE CONFIGURATION
   -------------------------------------------------------------------------
   This is the ONLY file you need to edit to connect your services.
   When you have your Google AdSense / Analytics codes, paste them below
   and set "enabled: true". Nothing else to touch.
   ========================================================================= */

window.SITE_CONFIG = {

  // -------------------- GOOGLE ADSENSE (advertising) --------------------
  adsense: {
    enabled: false,                          // set to true once you have the codes
    publisherId: "ca-pub-XXXXXXXXXXXXXXXX",  // <- your AdSense publisher ID
    autoAds: true,                           // true = Google places the ads automatically (easiest)
    // If instead you want banners in specific spots, set autoAds:false and put
    // your slot IDs below (one for each ad space already built into the site):
    slots: {
      top: "XXXXXXXXXX",
      middle: "XXXXXXXXXX",
      bottom: "XXXXXXXXXX"
    }
  },

  // -------------------- GOOGLE ANALYTICS (visitor stats) --------------------
  analytics: {
    enabled: false,                 // set to true once you have the code
    measurementId: "G-XXXXXXXXXX"   // <- your measurement ID
  }

};
