/**
 * EpisodeItem
 * revision3/components/EpisodeItem.qml
 */

import QtQuick 1.1
import boxee.components 1.0
import "../js/style.js" as Style

Item {
  id: wrapper
  width: 390
  height: 318
  opacity: ListView.isCurrentItem ? 1.0 : 0.2

  Behavior on opacity {
    NumberAnimation { duration: 200 }
  }

  Item {
    id: episodeImage
    width: 390
    height: 219

    Image {
      width: parent.width
      height: parent.height
      source: "../media/rev3_episode_missing.png"
      visible: (imageSource.opacity !== 1)
    }

    Image {
      id: imageSource
      width: parent.width
      height: parent.height
      sourceSize.width: parent.width
      sourceSize.height: parent.height
      source: image
      opacity: 0
      onStatusChanged: if (status === Image.Ready) opacity = 1;

      Behavior on opacity {
        NumberAnimation { duration: 200 }
      }
    }
  }

  Image {
    width: 396
    height: 225
    source: "../media/rev3_episode_border.png"
    anchors.centerIn: episodeImage
    opacity: wrapper.ListView.isCurrentItem ? 1.0 : 0.0

    Behavior on opacity {
      NumberAnimation { duration: 200 }
    }
  }

  Label {
    text: label
    width: 700
    color: Style.White
    font.bold: true
    font.pixelSize: 36
    wrapMode: Text.WordWrap
    horizontalAlignment: Text.AlignHCenter
    anchors.topMargin: 26
    anchors.top: episodeImage.bottom
    anchors.horizontalCenter: episodeImage.horizontalCenter
    opacity: wrapper.ListView.isCurrentItem ? 1.0 : 0.0

    Behavior on opacity {
      NumberAnimation {
        duration: 200
      }
    }
  }
}
