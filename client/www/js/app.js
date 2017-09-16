// App logic.
window.myApp = {};
audioRecord = 'record.wav';
var debug = true;
document.addEventListener('init', function (event) {
  var page = event.target;

  if (navigator && !debug)
    window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, gotFS, fail);

  function gotFS (fileSystem) {
    fileSystem.root.getFile(audioRecord, {
      create: true,
      exclusive: false
    }, gotFileEntry, fail);
  }

  function gotFileEntry (fileEntry) {
    fileURL = fileEntry.toURL();
  }

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  //Method to upload Audio file to server
  var uploadAudio = function () {
    var win = function (r) {
      console.log("Code = " + r.responseCode);
      console.log("Response = " + r.response);
      console.log("Sent = " + r.bytesSent);
    }

    var fail = function (error) {
      alert("An error has occurred: Code = " + error.code);
      console.log("upload error source " + error.source);
      console.log("upload error target " + error.target);
    }

    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = "recordupload.wav";
    options.mimeType = "audio/wav";

    var ft = new FileTransfer();
    ft.upload(fileURL, encodeURI("URL AUDIO"), win, fail, options);
  }

  $("#secret").click(function () {
    var modal = $('#recording');
    modal.show();

    modal.click(function () {
      this.hide();
    });
  });

  //Three buttons

  $("#pictureButton, #receiptButton").click(function () {
    var clicked = this.id

    var type
    if (clicked !== "voiceButton" || clicked !== "pictureButton" || clicked !== "receiptButton")
      return
    else if (this.id === "pictureButton")
      type = 0
    else
      type = 1
    if (!navigator)
      return

    navigator.camera.getPicture(onCapturePhoto, onFail, {
      quality: 50,
      destinationType: destinationType.FILE_URI
    });

    var retries = 0;

    function onCapturePhoto (fileURI) {
      var win = function (r) {
        clearCache();
        retries = 0;
        alert('Done!');
      }

      var fail = function (error) {
        if (retries == 0) {
          retries++
          setTimeout(function () {
            onCapturePhoto(fileURI)
          }, 100)
        } else {
          retries = 0;
          clearCache();
          alert('Ups. Something wrong happened!');
        }
      }

      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
      options.mimeType = "image/jpeg";
      options.params = {type: type}; // if we need to send parameters to the server request
      var ft = new FileTransfer();
      ft.upload(fileURI, encodeURI("URL SERVER"), win, fail, options);
    }

    function onFail (message) {
      alert('Failed because: ' + message);
    }
  });
  var record;
  var animationDots;

  $("#voiceButton").bind('touchstart mousedown', function () {
    if (navigator && !debug) {
      record = new Media(audioRecord,
        // success callback
        function () {
          uploadAudio();
        },

        // error callback
        function (err) {
          console.log("recordAudio():Audio Error: " + err.code);
        });
      record.startRecord();
    }
    var countDots = 0;
    animationDots = setInterval(function () {
      if (countDots <= 4)
        countDots++
      else
        countDots = 0;

      var output = "Listening " + Array(countDots).join(".");
      $("#dots").html(output)
    }, 500)
    $("#recording").show();

  }).bind('touchend mouseup', function () {
    clearInterval(animationDots);
    if (navigator && record) {
      record.stopRecord()
    }

    $("#recording").hide();
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
        gradient: ["#9cccc9", "#00b5cc"]
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
