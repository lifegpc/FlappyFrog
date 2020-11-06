require.register('utils.js', function(exports, require, module) {
'use strict';

var global = require('global');

exports.preloadImage = function(key) {
  var path = 'images/' + key + '.png';
  global.phaserGame.load.image(key, path);
};

exports.preloadSpritesheet = function(key, w, h) {
  var path = 'images/' + key + '.png';
  global.phaserGame.load.spritesheet(key, path, w, h);
};

exports.preloadAudio = function(key) {
  var path = 'sounds/' + key + '.mp3';
  global.phaserGame.load.audio(key, path);
};

exports.overlapAABB = function(left1, top1, right1, bottom1, left2, top2, right2, bottom2) {
  return left1 < right2 &&
    right1 > left2 &&
    top1 < bottom2 &&
    bottom1 > top2;
};

// https://goo.gl/7K7WLu
exports.unlockAudioContext = function() {
  var context = global.phaserGame.sound.context;
  if (context && context.state === 'suspended') {
    context.resume();
  }
};


exports.parseQueryString = function(qs){
  var result = {}, pairs = qs.split('&'), keyValue;
  for(var i = 0, l = pairs.length; i < l; i++) {
    keyValue = pairs[i].split('=');
    result[keyValue[0]] = decodeURIComponent(keyValue[1]);
  }
  return result;
};

exports.loadSettingsFromUrl = function() {
  var qs = window.location.search.substr(1);
  if (!qs)
    return;

  qs = exports.parseQueryString(qs);
  var settings = global.settings, k, v;

  for (k in qs) {
    v = qs[k];
    if (!v.length)
      continue;
    else if (v === 'undefined')
      v = undefined;
    else if (v === 'null')
      v = null;
    else if (v === 'true')
      v = true;
    else if (v === 'false')
      v = false;
    else if (v[0] === "'" && v[v.length - 1] === "'")
      v = v.substring(1, v.length - 1);
    else
      v = Number(v);

    settings[k] = v;
  }
};

exports.loadHighScores = function () {
  var settings = global.settings;
  if (settings.uid != undefined && settings.mid != undefined) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/getGameHighScores?game=FlappyFrog&mid=" + settings.mid + "&uid=" + settings.uid);
    xhr.responseType = "json";
    xhr.onload = function(e) {
      /**@typedef {{first_name: string, id: number, is_bot: boolean, last_name: string, username: string, language_code: string}} TgUser
       * @typedef {{position: number, score: number, user: TgUser}} TgScore
       * @typedef {{ok: boolean, result: Array<TgScore>}} TgHighScore
       */
      /**@type {TgHighScore}*/
      var j = xhr.response;
      if (j.ok) {
        global.TgHighScore = j.result;
        j.result.forEach(function(e) {
          if (e.user.id == settings.uid) {
            global.bestScore = e.score;
          }
        })
      }
    }
    xhr.send();
  }
}

});
