/**
mixpanel.js
**/

function base64_encode(data)
{
    /*
    http://kevin.vanzonneveld.net
    +   original by: Tyler Akins (http://rumkin.com)
    +   improved by: Bayron Guevara
    +   improved by: Thunder.m
    +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    +   bugfixed by: Pellentesque Malesuada
    +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    +   improved by: Rafał Kukawski (http://kukawski.pl)
    */

    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    enc = "",
    tmp_arr = [];

    if (!data)
    {
        return data;
    }

    do
    {
        // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1 << 16 | o2 << 8 | o3;

        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    }
    while (i < data.length);

    enc = tmp_arr.join('');
    var r = data.length % 3;
    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}

function send(url)
{
    var request = new XMLHttpRequest();

    request.onreadystatechange = function ()
    {
        if (request.readyState === request.DONE)
            boxeeAPI.logInfo('mixpanel-trackevent-response (' + request.responseText + ')');
    }

    request.open("GET", url, true);
    request.send();
}

function track(event, properties)
{
    /*
    A simple function for asynchronously logging to the mixpanel.com API.

    @param event: The overall event/category you would like to log this data under
    @param properties: A JSON object of key-value pairs that describe the event
                       See http://mixpanel.com/api/ for further detail.

    Example:
        Mixpanel.track("play-video", {"video-title": "Andrew Blum: What is the Internet, reall?"})
    */

    if (properties === undefined)
        properties = {};

    // set project token here
    var token = "f575af20895fc132d60de7df3c211b41";

    if (properties.token === undefined)
        properties.token = token;

    for (var i in properties)
    {
        properties[i] = properties[i].replace(/[\u2018-\u201B]+/g, "'");
        properties[i] = properties[i].replace(/[\u201C-\u201F]+/g, "\"");
    }

    var params = {
        event: event,
        properties: properties
    };

    var data = base64_encode(JSON.stringify(params));
    var request = "http://api.mixpanel.com/track/?data=" + encodeURIComponent(data) + "&ip=1";
    boxeeAPI.logInfo('mixpanel-trackevent (' + request + ')');
    send(request);
}
