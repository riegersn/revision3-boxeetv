/**
 * Revision3 : Main.qml
 * revision3/main.qml
 */

import QtQuick 1.1
import boxee.components 1.0
import "components";
import "js/style.js" as Style
import "js/revision.js" as Revision
import "js/mixpanel.js" as Mixpanel

Window {
  id: root

  // define our properties
  property bool appStarted: false
  property bool lockPlay: false
  property bool mediaOpen: false
  property int mediaStatus: 0

  // monitor mediaOpen
  onMediaOpenChanged: if (mediaOpen) lockPlay = false;

  // define remote events
  Keys.onPressed: {
    switch (event.key) {
      case Qt.Key_H:
      case Qt.Key_Home:
      case Qt.Key_HomePage: {
        if (mediaOpen || lockPlay) {
          Revision.playerStop();
        } else {
          Revision.exit();
        }
        break;
      }
      case Qt.Key_G:
        guides.visible = !guides.visible;
        break;
    }
  }

  // wait for component onComplete event
  Component.onCompleted: {
    // starting off in false state so the splash stays visible
    // while the images load.
    appStarted = false;
    forceFocus(promoList);
    Revision.linkMediaPlayer();
    Revision.getPromos({ loader: false });
    Revision.getShows({ loader: false });
  }

  // background
  Rectangle {
    width: parent.width
    height: parent.height
    color: Style.DarkGrey
  }

  Item {
    height: 915
    width: parent.width
    y: (episodeList.activeFocus) ? -140 : 165

    Behavior on y {
      NumberAnimation {
        duration: 300
      }
    }

    Item {
      id: promoContainer
      height: 440
      width: parent.width

      Image {
        width: parent.width
        height: parent.height
        source: "media/rev3_promo_background.png"
      }

      ListView {
        id: promoList
        spacing: 50
        height: 400
        width: parent.width
        cacheBuffer: 895 * 3
        keyNavigationWraps: true
        highlightMoveDuration: 300
        preferredHighlightBegin: 513
        preferredHighlightEnd: 1408
        orientation: ListView.Horizontal
        highlightRangeMode: ListView.StrictlyEnforceRange
        anchors.verticalCenter: parent.verticalCenter
        KeyNavigation.down: showList
        model: ListModel {}

        delegate: PromoItem {
          parentView: promoList

          // hack to make sure the splash stays up until promo image is ready
          onFirstImageLoaded: {
            if (!appStarted) {
              boxeeAPI.appStarted(true);
            }
            appStarted = true;
          }
        }

        Keys.onReturnPressed: {
          Revision.play(model.get(currentIndex));
          Mixpanel.track("play-video", {
            "video-title": model.get(currentIndex).label,
            "category": "Promo"
          });
        }
      }
    }

    ListView {
      id: showList
      spacing: 30
      height: 340
      width: parent.width
      cacheBuffer: 300 * 7
      keyNavigationWraps: true
      highlightMoveDuration: 300
      preferredHighlightBegin: 830
      preferredHighlightEnd: 1030
      orientation: ListView.Horizontal
      highlightRangeMode: ListView.StrictlyEnforceRange
      anchors.topMargin: 44
      anchors.top: promoContainer.bottom
      KeyNavigation.up: promoList
      Keys.onEscapePressed: forceFocus(promoList)

      model: ListModel {}
      delegate: ShowItem {}

      function handle_episodesLoaded() {
        forceFocus(episodeList);
      }

      Keys.onReturnPressed: {
        var url = showList.model.get(currentIndex).url;
        Revision.getEpisodes(url, {
          callback: handle_episodesLoaded
        });
      }

      Keys.onDownPressed: {
        var url = showList.model.get(currentIndex).url;
        Revision.getEpisodes(url, {
          callback: handle_episodesLoaded
        });
      }
    }

    ListView {
      id: episodeList
      spacing: 30
      height: 318
      width: parent.width
      cacheBuffer: 320 * 5
      keyNavigationWraps: true
      highlightMoveDuration: 300
      preferredHighlightBegin: 800
      preferredHighlightEnd: 1120
      highlightRangeMode: ListView.StrictlyEnforceRange
      orientation: ListView.Horizontal
      anchors.topMargin: -20
      anchors.top: showList.bottom
      KeyNavigation.up: showList
      opacity: (episodeList.activeFocus) ? 1.0 : 0.0

      Keys.onEscapePressed: forceFocus(showList)

      Keys.onReturnPressed: {
        Revision.play(model.get(currentIndex));
        Mixpanel.track("play-video", {
          "video-title": model.get(currentIndex).label,
          "category": showList.model.get(showList.currentIndex).label
        });
      }

      Behavior on opacity {
        NumberAnimation {
          duration: 300
        }
      }

      delegate: EpisodeItem {}
      model: ListModel {}
    }
  }

  Image {
    y: 80
    x: 140
    height: 72
    width: 300
    source: "media/logo.png"
  }

  Rectangle {
    color: Style.Black
    width: root.width
    height: root.height
    opacity: 0.0
    visible: lockPlay
    onVisibleChanged: opacity = (visible) ? 0.8 : 0.0

    Behavior on opacity {
      NumberAnimation {
        properties: "opacity"
        duration: 300
      }
    }

    WaitNote {
      id: playerNote
      anchors.centerIn: parent
      visible: parent.visible
    }
  }

  Image {
    id: guides
    width: parent.width
    height: parent.height
    source: "media/overscan-safe-zone.png"
    visible: false
  }
}
