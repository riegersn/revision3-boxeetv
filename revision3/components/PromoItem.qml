/**
 * PromoItem
 * revision3/components/PromoItem.qml
 */

import QtQuick 1.1
import boxee.components 1.0
import "../js/style.js" as Style

Item {
  id: wrapper

  property bool imageLoaded: false
  property ListView parentView: null

  width: 895
  height: 400
  opacity: (wrapper.ListView.isCurrentItem && parentView.activeFocus) ? 1 : 0.2

  onImageLoadedChanged: firstImageLoaded();

  signal firstImageLoaded;

  Behavior on opacity {
    NumberAnimation { duration: 400 }
  }

  Rectangle {
    width: 895
    height: 400
    color: Style.DarkGrey

    Image {
      height: 72
      width: 300
      source: "../media/logo.png"
      anchors.centerIn: parent
      opacity: (imageSource.status === Image.Ready) ? 0.0 : 1.0

      Behavior on opacity {
        NumberAnimation { duration: 300 }
      }
    }
  }

  Image {
    id: imageSource
    source: image
    opacity: 0
    cache: true
    width: 895
    height: 400
    asynchronous: true
    sourceSize.width: 895
    sourceSize.height: 400
    onStatusChanged: {
      if (status === Image.Ready) {
        opacity = 1;
        if (wrapper.ListView.isCurrentItem)
          imageLoaded = true
      }
    }

    Behavior on opacity {
      NumberAnimation { duration: 300 }
    }

  }

  Image {
    height: 117
    width: parent.width
    source: "../media/rev3_promo_text_background.png"
    anchors.bottom: parent.bottom
    opacity: (wrapper.ListView.isCurrentItem && parentView.activeFocus) ? 1 : 0

    Behavior on opacity {
      NumberAnimation { duration: 300 }
    }

    Column {
      height: 102
      width: 772
      spacing: 4
      clip: true
      anchors.topMargin: 15
      anchors.leftMargin: 15
      anchors.top: parent.top
      anchors.left: parent.left

      Label {
        id: promoLabel
        text: label
        width: parent.width
        font.pixelSize: 38
        color: Style.White
        elide: Text.ElideRight
        font.family: Style.font_Medium
      }

      Label {
        id: promoDescription
        text: description
        width: parent.width
        font.pixelSize: 26
        color: Style.White
        wrapMode: Text.WordWrap
        font.family: Style.font_Medium
      }
    }

    Image {
      width: 117
      height: 117
      source: show_image
      anchors.rightMargin: 20
      anchors.right: parent.right
    }
  }
}
