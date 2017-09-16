// App logic.
window.myApp = {};
var audioRecord = 'record.wav';
var debug = false;
var state;
var fileURL;
var record;
var initialized = false;
document.addEventListener("deviceready", function () {
  if (!initialized)
    initialized = true;
  else return;

  if (navigator && !debug)
  //LocalFileSystem.TEMPORARY
    window.requestFileSystem(0, 0, gotFS, fail);

  function fail (e) {
    alert(JSON.stringify(e));
  }

  function gotFS (fileSystem) {
    fileSystem.root.getFile(audioRecord, {
      create: true,
      exclusive: false
    }, gotFileEntry, fail);
  }

  function gotFileEntry (fileEntry) {
    fileURL = fileEntry.toURL();
  }

  //Method to upload Audio file to server
  var uploadAudio = function () {
    var win = function (r) {
      console.log("Code = " + r.responseCode);
      console.log("Response = " + r.response);
      console.log("Sent = " + r.bytesSent);
      alert(r.response);
    }

    var fail = function (error) {
      alert("An error has occurred: Code = " + error.code);
      console.log("upload error source " + error.source);
      console.log("upload error target " + error.target);
      alert("upload error source " + error.source + "\n upload error target " + error.target);
    }

    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = "recordupload.wav";
    options.mimeType = "audio/wav";

    var ft = new FileTransfer();
    console.log(fileURL);

    if (!debug)
      ft.upload(fileURL, encodeURI("localhost/"), win, fail, options);

  }
  record = new Media(audioRecord,
    // success callback
    function () {
      uploadAudio();
    },
    function (err) {
      console.log("recordAudio():Audio Error: " + err.code);
    });
}, false);

document.addEventListener('init', function (event) {

  state = localStorage.getItem("state");
  if (!state) {
    state = {
      foodList: {},
      healthIndex: 80,
      fat: 0,
      sugar: 0,
      protein: 0
    }
    localStorage.setItem("state", JSON.stringify(state));
  } else {
    state = JSON.parse(state);
  }

  var page = event.target;

  // Each page calls its own initialization controller.
  if (myApp.controllers.hasOwnProperty(page.id)) {
    myApp.controllers[page.id](page);
  }

  $(".secret").click(function () {
    triggerNotification();
  });

  function triggerNotification () {
    var date = new Date();
    date.setSeconds(date.getSeconds() + 3);

    cordova.plugins.notification.local.schedule({
      id: 1,
      title: "Did you have Lunch?",
      message: "Insert some info about it..",
      firstAt: date, // firstAt and at properties must be an IETF-compliant RFC 2822 timestamp
      //every: "week", // this also could be minutes i.e. 25 (int)
      // sound: "file://sounds/reminder.mp3",
      // icon: "http://icons.com/?cal_id=1",
      data: {meetingId: "123#fg8"}
    });

    cordova.plugins.notification.local.on("click", function (notification) {
      document.querySelector('#myNavigator').pushPage('addFood.html');
    });
  }

  //Three buttons
  var alreadyTriggered = false;
  $(".topMain").click(function (event) {
    event.stopPropagation();
  });
  $("#pictureButton, #receiptButton").off('click');
  $("#pictureButton, #receiptButton").on('click', function (e) {
    var clicked = this.id

    e.stopPropagation();

    var type
    console.log(clicked)

    if (this.id === "pictureButton")
      type = 0
    else
      type = 1
    if (!navigator)
      return

    navigator.camera.getPicture(onCapturePhoto, onFail, {
      quality: 50,
      destinationType: 1
    });

    var retries = 0;

    function onCapturePhoto (fileURI) {
      var win = function (r) {
        clearCache();
        retries = 0;
        alert('response' + r);
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
          alert('Ups. Something wrong happened! ' + error);
        }
      }

      var options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
      options.mimeType = "image/jpeg";
      options.params = {type: type}; // if we need to send parameters to the server request
      var ft = new FileTransfer();
      alert(fileURI);
      /*if (!debug)
        ft.upload(fileURI, encodeURI("URL SERVER"), win, fail, options);
        */
    }

    function onFail (message) {
      alert('Failed because: ' + message);
    }
  });

  var animationDots;

  var touchStarted = false;
  $("#voiceButton").off('touchstart');
  $("#voiceButton").off('touchend');
  $("#voiceButton").on('touchstart', function () {
    if (touchStarted)
      return
    else
      touchStarted = true

    if (navigator && !debug) {

      record.startRecord();
    }
    var countDots = 0;
    animationDots = setInterval(function () {
      if (countDots <= 3)
        countDots++
      else
        countDots = 0;

      var output = "Listening " + Array(countDots).join(".");
      $("#dots").html(output)
    }, 1000)
    $("#recording").show();

  }).on('touchend', function () {
    $("#recording").hide();
    clearInterval(animationDots);
    if (navigator && record) {
      record.stopRecord()
    }
    touchStarted = false;

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
      value: state.healthIndex / 100,
      size: 130,
      fill: {
        gradient: ["#9cccc9", "#00b5cc"]
      }
    });
    $("#percentageHealth").html(state.healthIndex + "%");

  } else if (event.target.id == "camera") {

  }
}, false);
