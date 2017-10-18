'use strict';

var keys = [];
var controlAlt = [ 'ctrl', 'alt' ];
var margin = 0;
var increment = 0.1

function log() {
  Phoenix.log(JSON.stringify(arguments[0], true, 2));
}

var Displays = {
  Internal: 1,
  External: 0
}

Window.prototype.midCenter = function () {
  var currScreenFrame = this.screen().flippedVisibleFrame();

  var newWindowFrame = {
    width: currScreenFrame.width * 0.75,
    height: currScreenFrame.height * 0.75,
    x: currScreenFrame.x + currScreenFrame.width * 0.125,
    y: currScreenFrame.y + currScreenFrame.height * 0.125
  }

  this.setFrame(newWindowFrame);
}

Window.prototype.sideLeft = function (proportion) {
  var coefficient = proportion || 0.5;
  var currScreenFrame = this.screen().flippedVisibleFrame();
  var newWindowFrame = {
    width: currScreenFrame.width * coefficient,
    height: currScreenFrame.height,
    x: currScreenFrame.x,
    y: currScreenFrame.y
  }

  this.setFrame(newWindowFrame);
  return this;
}

Window.prototype.sideRight = function (proportion) {
  var coefficient = proportion || 0.5;
  var currScreenFrame = this.screen().flippedVisibleFrame();
  var newWindowFrame = {
    width: currScreenFrame.width * coefficient,
    height: currScreenFrame.height,
    x: currScreenFrame.x + currScreenFrame.width * (1 - coefficient),
    y: currScreenFrame.y
  }

  this.setFrame(newWindowFrame);
  return this;
}

Window.prototype.throwTo = function (screen) {
  var currScreenFrame = this.screen().flippedVisibleFrame();
  var currWindowFrame = this.frame();
  var aspectRatios = {
    width: currWindowFrame.width / currScreenFrame.width,
    height: currWindowFrame.height / currScreenFrame.height,
    x: Math.abs((currScreenFrame.x - currWindowFrame.x) / currScreenFrame.width),
    y: Math.abs((currScreenFrame.y - currWindowFrame.y) / currScreenFrame.height)
  }

  var screens = Screen.all();
  var targetScreenFrame = screens[screen].flippedVisibleFrame();

  var newWindowFrame = {
    width: targetScreenFrame.width * aspectRatios.width,
    height: targetScreenFrame.height * aspectRatios.height,
    x: targetScreenFrame.x + targetScreenFrame.width * aspectRatios.x,
    y: targetScreenFrame.y + targetScreenFrame.height * aspectRatios.y
  }

  this.setFrame(newWindowFrame);
  return this;
}

keys.push(Key.on('up', controlAlt, function () {
  Window.focused() && Window.focused().maximize();
}));
//
keys.push(Key.on('down', controlAlt, function () {
  Window.focused() && Window.focused().midCenter();
}));
//
keys.push(Key.on('left', controlAlt, function () {
  Window.focused() && Window.focused().sideLeft()
}));
//
keys.push(Key.on('right', controlAlt, function () {
  Window.focused() && Window.focused().sideRight()
}));

keys.push(Key.on('[', controlAlt, function () {
  Window.focused() && Window.focused().throwTo(Displays.Internal);
}));

keys.push(Key.on(']', controlAlt, function () {
  Window.focused() && Window.focused().throwTo(Displays.External);
}));

var AppsConfig = {
  get: function () {
    return AppsConfig.test[AppsConfig.selector()];
  },
  selector: function () {
    return Screen.all().length;
  },
  test: {
    1: {
      'Skype': function (window){
        window.throwTo(Displays.External).sideLeft(0.45);
      },
      'Telegram': function (window) {
        window.throwTo(Displays.External).sideRight();
      },
       'Slack': function (window) {
        window.throwTo(Displays.Internal).sideRight(0.55);
      }
    },
    2: {
      'Skype': function (window){
        window.throwTo(Displays.Internal).sideLeft(0.45);
      },
      'Telegram': function (window) {
        window.throwTo(Displays.Internal).sideRight();
      },
      'Slack': function (window) {
        window.throwTo(Displays.Internal).sideRight(0.55);
      }
    }
  }
};

keys.push(Key.on('delete', ['ctrl', 'alt', 'cmd'], function () {
  var apps = App.all();
  var appsConfig = AppsConfig.get();

  _.each(apps, function (app) {
    appsConfig[app.name()] && appsConfig[app.name()](app.mainWindow());
  })
}));

Phoenix.set({
  daemon: false,
  openAtLogin: true
});