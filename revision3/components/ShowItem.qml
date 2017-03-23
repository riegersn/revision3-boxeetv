/**
 * ShowItem
 * revision3/components/ShowItem.qml
 */

import QtQuick 1.1
import boxee.components 1.0
import "../js/style.js" as Style

Item {
  id: wrapper
  width: 260
  height: 340

  Item {
    id: showImage
    width: 260
    height: 260
    opacity: (wrapper.ListView.isCurrentItem && (showList.activeFocus || episodeList.activeFocus)) ? 1 : 0.1

    Behavior on opacity {
      NumberAnimation { duration: 200 }
    }

    Image {
      width: parent.width
      height: parent.height
      visible: (imageSource.opacity !== 1)
      source: "../media/rev3_show_missing.png"
    }

    Image {
      id: imageSource
      source: image
      width: parent.width
      height: parent.height
      sourceSize.width: parent.width
      sourceSize.height: parent.height
      opacity: 0
      onStatusChanged: if (status === Image.Ready) opacity = 1;

      Behavior on opacity {
        NumberAnimation { duration: 200 }
      }
    }
  }

  Image {
    width: 266
    height: 266
    source: "../media/rev3_show_border.png"
    anchors.centerIn: showImage
    opacity: (wrapper.ListView.isCurrentItem && showList.activeFocus) ? 1 : 0.0

    Behavior on opacity {
      NumberAnimation { duration: 200 }
    }
  }

  Label {
    text: label
    width: parent.width
    color: Style.White
    font.pixelSize: 30
    font.family: Style.font_Medium
    anchors.topMargin: 20
    anchors.top: showImage.bottom
    wrapMode: Text.WordWrap
    horizontalAlignment: Text.AlignHCenter
    opacity: (wrapper.ListView.isCurrentItem && showList.activeFocus) ? 1 : 0.0

    Behavior on opacity {
      NumberAnimation { duration: 200 }
    }
  }
}
