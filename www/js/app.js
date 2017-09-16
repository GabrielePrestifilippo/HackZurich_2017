// App logic.
window.myApp = {};

document.addEventListener('init', function (event) {
  var page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  $("#secret").click(function () {
    var modal = $('#modal');
    modal.show();

    modal.click(function () {
      this.hide();
    });
  });

});

function successShare () {

  setTimeout(function () {
    $(" #modal2").show();
  }, 2500);

  $("#modal2").click(function () {
    this.hide();
    $('#rewardPage').click();
  });
}

var firstMap = false;
var firstProfile = false;
document.addEventListener("show", function (event) {
  if (event.target.id == "deals" && !firstMap) {
    firstMap = true;
    var mymap = L.map('mapid').setView([47.3721001, 8.5382902], 16);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
      id: 'mapbox.streets'
    }).addTo(mymap);

    L.marker([47.3721001, 8.5382902]).addTo(mymap);

    var polygon = L.circle([47.3721001, 8.5382902], {
      color: '#73dc85',
      fillColor: '#73dc85',
      fillOpacity: 0.3,
      radius: 180,
    }).addTo(mymap);

    polygon.setStyle({weight: 1});
    var LeafIcon = L.Icon.extend({
      options: {
        iconSize: [22, 20],
        iconAnchor: [0, 0],
        popupAnchor: [0, 0]
      }
    });
    var shop = new LeafIcon({iconUrl: 'icons/shop.png'});

    L.marker([47.3721001, 8.5382902], {icon: shop}).addTo(mymap).bindPopup("Prada");
    L.marker([47.3731418, 8.5395735], {icon: shop}).addTo(mymap).bindPopup("Lacoste");
    L.marker([47.3729072, 8.5384889], {icon: shop}).addTo(mymap).bindPopup("Micheal Kors");
    L.marker([47.3724014, 8.5388109], {icon: shop}).addTo(mymap).bindPopup("Vero Moda");

  } else if (event.target.id == "profile" && !firstProfile) {
    firstProfile = true;

    $('#circle').circleProgress({
      value: 0.75,
      size: 130,
      fill: {
        gradient: ["#9cccc9","#00b5cc"]
      }
    });

  } else if (event.target.id == "camera") {

    if (typeof cordova !== 'undefined') {
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          startWin(70);
          setTimeout(function () {
            $("#outfit").show();
          }, 1200);
        },
        function (error) {
          startWin(70);
          setTimeout(function () {
            $("#outfit").show();
          }, 1200);
        },
        {
          preferFrontCamera: false, // iOS and Android
          showFlipCameraButton: true, // iOS and Android
          showTorchButton: true, // iOS and Android
          torchOn: false, // Android, launch with the torch switched on (if available)
          prompt: "Place a barcode inside the scan area", // Android
          resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
          formats: "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
          orientation: "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
          disableAnimations: true // iOS
        }
      );
    }
  }
}, false);
