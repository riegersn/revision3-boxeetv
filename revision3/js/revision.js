Qt.include('utility.js');

var waitVisible = false;
var uriPromos = "http://revision3.com/feed/promos";
var uriShows = "http://revision3.com/feed/shows";
var revShowImage = "http://videos.revision3.com/revision3/images/shows/%s/%s.jpg" //_160x160

var DataType = {
  JSON: 2,
  XML: 1,
  PLAIN: 0
}

function isFunction(f) {
  return (typeof f === 'function') ? true : false;
}

function sendWithArgs() {
  var args = Array.prototype.slice.apply(arguments);
  var func = args[0];
  return (function() {
    func.apply(this, args.slice(1));
  });
}

function print(item1, item2) {
  if (item2 === undefined)
    boxeeAPI.logInfo('revision3 [' + arguments.callee.caller.name + '] ' + item1);
  else
    boxeeAPI.logInfo('revision3 [' + item1 + '] ' + item2);
}

// logging
function printf(message) {
  var args = Array.prototype.slice.call(arguments);
  if (args.length === 1)
    boxeeAPI.logInfo('revision3 [' + arguments.callee.caller.name + '] ' + message);
  else if (args.length > 1)
    boxeeAPI.logInfo('revision3 [' + arguments.callee.caller.name + '] ' + vsprintf(message, args.slice(1)));
}

function RequestResult(_code, _response) {
  this.code = _code;
  this.isOk = (_code === -1) ? true : false;
  this.description = (_code !== -1) ? 'Error' : 'Ok';
  this.message = this.description;
  this.response = _response;
}

function uiShowWait(callback) {
  if (!waitVisible) {
    waitVisible = true;
    boxeeAPI.showWaitDialog(isFunction(callback), callback);
  }
}

function uiHideWait() {
  boxeeAPI.hideWaitDialog();
  waitVisible = false;
}

function uiOkDialog(title, message, callback, callback2) {
  if (!isFunction(callback2))
    callback2 = callback;

  printf('showing ok dialog from (%s)', arguments.callee.caller.name);
  boxeeAPI.showOkDialog((title || 'Revision3'), message, callback, callback2, 'OK', true);
}

function uiConfirmDialog(title, message, callback, callback2, cancel, ok) {
  printf('showing confirm dialog from (%s)', arguments.callee.caller.name);
  boxeeAPI.showConfirmDialog((title || 'Revision3'), message, callback, callback2, (ok || 'OK'), (cancel || 'Cancel'), true)
}

function uiFillList(data, model, clear) {
  if (clear !== undefined && clear)
    model.clear();

  for (var i = 0; i < data.length; i++)
    model.append(data[i]);
}

function linkMediaPlayer() {
  var mediaPlayer = boxeeAPI.mediaPlayer();
  mediaPlayer.onOpened = onOpenChanged;
  mediaPlayer.onError = onErrorChanged;
  mediaPlayer.onMediaStatus = onMediaStatusChanged;
}

function play(item) {
  try {
    if (!lockPlay) {
      lockPlay = true;
      var playItem = {
        url: item.url,
        title: (item.title || item.label),
        iconUrl: (item.url_icon || item.image)
      };

      print(playItem);

      boxeeAPI.mediaPlayer().open(playItem);
    }
  } catch (e) {
    lockPlay = false;
    uiOkDialog('An error occurred while trying to play video. Please try again later.')
    printf('error playing track (%s)', e.message);
  }
}

function playerStop() {
  try {
    lockPlay = false;
    boxeeAPI.mediaPlayer().stop();
    return true;
  } catch (e) {
    printf('ERROR: unable to stop playback, maybe nothing is playing? (%s)', e.message);
    return false;
  }
}

function onOpenChanged() {
  mediaOpen = boxeeAPI.mediaPlayer().isOpen();
}

function onErrorChanged() {
  lockPlay = false;
}

function onMediaStatusChanged() {
  mediaStatus = boxeeAPI.mediaPlayer().mediaStatus();
}

function returnResponse(status, response, handler) {
  if (status === 200 && response !== undefined && response)
    handler.target(new RequestResult(-1, response), handler);
  else {
    printf("ERROR: status returned was %d", status);
    handler.target(new RequestResult(0, response), handler);
  }
}

function handleResponse(type, responseText) {
  try {
    if (type === DataType.XML) {
      responseText = boxeeAPI.xmlToJson(responseText)
      responseText = eval('(' + responseText + ')');
    } else if (type === DataType.JSON)
      responseText = eval('(' + responseText + ')');
  } catch (e) {
    responseText = undefined;
  }

  return responseText;
}

function getData(url, type, handler) {
  printf("url: %s", url)

  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState === request.DONE) {
      var response = handleResponse(type, request.responseText);

      if (handler.params.loader === undefined || handler.params.loader)
        uiHideWait();

      returnResponse(request.status, response, handler);
    }
  }

  request.open("GET", url, true);

  if (handler.params.loader === undefined || handler.params.loader)
    uiShowWait();

  request.send();
}

function getPromos(params) {
  getData(uriPromos, DataType.XML, {
    target: handle_getPromos,
    params: params
  });
}

function handle_getPromos(request, handler) {
  if (request.isOk) {
    var result = [];
    var promos = request.response.promos.promo;

    for (var i = 0; i < promos.length; i++) {
      if (promos[i].media === undefined)
        continue;

      print(JSON.stringify(promos[i]));
      var promo = {
        label: promos[i].name,
        description: promos[i].description,
        image: promos[i].image,
        show_image: promos[i].logo,
        url: null
      }

      for (var n = 0; n < promos[i].media.item.length; n++) {
        var item = promos[i].media.item[n];
        if (!promo.url && item._quality === 'hd' && item._type === 'video/mp4') {
          promo.url = item._url;
          break;
        }
      }

      if (promo.url)
        result.push(promo);
    }

    uiFillList(result, promoList.model, true);
  }
}

function getShows(params) {
  getData(uriShows, DataType.XML, {
    target: handle_getShows,
    params: params
  });
}

function handle_getShows(request, handler) {
  if (request.isOk) {
    var result = [];
    var shows = request.response.shows.show;

    for (var i = 0; i < shows.length; i++) {
      var show = {
        label: shows[i].name,
        id: shows[i].link.split('/').pop(),
        url: shows[i].defaultFeed
      }

      show.image = sprintf(revShowImage, show.id, show.id);
      result.push(show);
    }

    uiFillList(result, showList.model, true);
  }
}

function getEpisodes(url, params) {
  getData(url, DataType.XML, {
    target: handle_getEpisodes,
    params: params
  });
}

function handle_getEpisodes(request, handler) {
  episodeList.model.clear();

  if (request.isOk) {
    var result = [];
    var episodes = request.response.rss.channel.item;

    for (var i = 0; i < episodes.length; i++) {
      var episode = {
        label: episodes[i].title,
        description: episodes[i].description.trim(),
        url: null,
        image: null
      }

      var label = episode.label.split(' - ');
      label.pop();
      episode.label = label.join(' - ');

      if (episodes[i].media_content !== undefined) {
        episode.url = episodes[i].media_content._url;
        if (episodes[i].media_content.media_thumbnail !== undefined)
          episode.image = episodes[i].media_content.media_thumbnail._url.replace('-mini.', '-medium.');

        result.push(episode);
      }
    }

    uiFillList(result, episodeList.model, true);
  }

  if (isFunction(handler.params.callback))
    handler.params.callback();
}

function exitConfirmed() {
  playerStop();
  windowManager.pop();
  boxeeAPI.appStopped();
}

function exit() {
  uiConfirmDialog("Revision3", "Would you like to exit this application?", exitConfirmed, undefined, "No Thanks", "Yes");
}
