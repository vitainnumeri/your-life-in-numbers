/* =========================================================================
   SITE CONFIGURATION
   -------------------------------------------------------------------------
   This is the ONLY file you need to edit to connect your services.
   When you have your Google AdSense / Analytics codes, paste them below
   and set "enabled: true". Nothing else to touch.
   ========================================================================= */

window.SITE_CONFIG = {

  // -------------------- GOOGLE ADSENSE (advertising) --------------------
  // ✅ Publisher ID ca-pub-2466362384448460 is loaded via a static <script> in
  // the <head> of every page, using Auto Ads (Google places ads automatically).
  // Ads start showing once Google approves the AdSense account.
  //
  // HYBRID / HIGH-EARNING SETUP (do this AFTER approval, for maximum revenue):
  // In your AdSense dashboard create "Display" ad units, then paste each unit's
  // slot ID below. The site will then place a guaranteed, high-visibility ad in
  // each spot (these usually out-earn Auto Ads alone). Leave empty = Auto Ads only.
  adsense: {
    publisherId: "ca-pub-2466362384448460",
    slots: {
      afterResult: "8796618300",   // ⭐ best spot: right under the result the user just got
      midStats: "1355709611",      // between the statistics, while scrolling
      bottom: "3518838520"         // bottom of the page
    }
  },

  // -------------------- GOOGLE ANALYTICS (visitor stats) --------------------
  analytics: {
    enabled: false,                 // set to true once you have the code
    measurementId: "G-XXXXXXXXXX"   // <- your measurement ID
  }

};
