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

  StatusBar.backgroundColorByHexString("#2dcc70");

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
  function getFood () {
    /*
        $.ajax({
          type: "POST",
          //url: ,
          data: {token: token},
          success: function (data) {
            //set state to data
            //generateFood(image, name, carbs, protein, fat);
          },
        });
        */

    var image = 'images/apple.jpg';
    var name = 'Apple';
    var carbs = 30;
    var protein = 50;
    var fat = 20;
    var item = generateFood(name, image, carbs, protein, fat);
    $("#wrapper").html("<br>");
    $("#wrapper").append(item);

    var image = 'images/salad.jpg';
    var name = 'Greek Salad';
    var itemFood = generateEaten(image, name);
    $("#listEaten").html("");
    $("#listEaten").append(itemFood);
  }

  function generateFood (name, image, carbs, protein, fat) {
    return `
  <div class="foodItem">
    <div class="topFood" style="background-image: url(${image});">
    </div>
    <div class="bottomFood">
    <div class="foodName">${name}</div>
    <div class="foodText">
    <div id="carbs" class="nutrient n1">Carb
    <div class="progress p1">
    <div  class="determinate d1" style="width: 70%"></div>
    </div>
    <div class="carbsPercentage">${carbs}%</div>
    </div>
    <div id="proteins" class="nutrient n1">Protein
    <div class="progress p1">
    <div  class="determinate d1" style="width: 70%"></div>
    </div>
    <div class="proteinsPercentage">${protein}%</div>
    </div>
    <div id="fat" class="nutrient n1">Fat
    <div class="progress p1">
    <div class="determinate d1" style="width: 70%"></div>
    </div>
    <div class="fatsPercentage">${fat}%</div>
    </div>
    </div>
    </div>
    </div>
    `
  }

  function generateEaten (image, name) {
    return `<div class="brandItem">
      <div class="indicator"><img src="${image}"></div>
      <div class="brand">${name}</div>
    </div>
    <div class="smallDivider"></div>`;
  }

  state = localStorage.getItem("state");

  if (!state || !state.token) {
    $("#loginPage").show();
  }
  if (!state) {
    state = {
      foodList: {},
      healthIndex: 80,
      fats: 50,
      carbs: 60,
      proteins: 30,
      history: {},
      token: undefined
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

  $("#loginButton").click(function () {
    $("#loadingScreen").show();
    $("#loginPage").hide();
    getFood();
    setTimeout(function () {
      $("#loadingScreen").hide();
    }, 200)

    /*
    var username=$(".inputForm")[0].value;
    var password=$(".inputForm")[1].value;
    $.ajax({
      type: "POST",
      //url: ,
      data: { username: username, password: password },
      success: function(data){
        //set state to data
        $("#loginPage").hide();
        $("#loadingScreen").hide();
      },
    });
    */

  });

  $("#yesAnswer").click(function () {
    $("#notifModal").hide();
    menu.setAttribute('data-mfb-state', 'open');
  });
  $("#noAnswer").click(function () {
    $("#notifModal").hide();
    document.querySelector('#myNavigator').pushPage('html/deals.html');
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
      //document.querySelector('#myNavigator').pushPage('html/profile.html');
      $("#notifModal").show();
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
    $("#fatsBar").css("width", state.fats);
    $("#proteinsBar").css("width", state.proteins);
    $("#carbsBar").css("width", state.carbs);

    $("#carbsPercentage").html(state.carbs + "%");
    $("#fatsPercentage").html(state.fats + "%");
    $("#proteinsPercentage").html(state.proteins + "%");

  } else if (event.target.id == "camera") {

  }
}, false);

function goToShop () {
  document.querySelector('#myNavigator').pushPage('shop.html');
  $("#loadingScreen").hide();
  $("#loginPage").hide();
}