// FCL 控件系统类型定义

export interface FCLController {
  id: string
  name: string
  version: string
  versionCode: number
  author: string
  description: string
  controllerVersion: number
  buttonStyles: FCLButtonStyle[]
  directionStyles: FCLDirectionStyle[]
  viewGroups: FCLViewGroup[]
}

export interface FCLViewGroup {
  id: string
  name: string
  visibility: 'VISIBLE' | 'INVISIBLE'
  viewData: {
    buttonList: FCLButton[]
    directionList: FCLDirection[]
  }
}

export interface FCLButton {
  id: string
  text: string
  style: string
  baseInfo: FCLBaseInfo
  event: FCLButtonEvent
}

export interface FCLDirection {
  id: string
  style: string
  baseInfo: FCLBaseInfo
  event: FCLDirectionEvent
}

export interface FCLBaseInfo {
  visibilityType: 'ALWAYS' | 'IN_GAME' | 'MENU'
  xPosition: number
  yPosition: number
  sizeType: 'PERCENTAGE' | 'ABSOLUTE'
  absoluteWidth?: number
  absoluteHeight?: number
  percentageWidth?: {
    reference: 'SCREEN_WIDTH' | 'SCREEN_HEIGHT'
    size: number
  }
  percentageHeight?: {
    reference: 'SCREEN_WIDTH' | 'SCREEN_HEIGHT'
    size: number
  }
}

export interface FCLButtonEvent {
  pointerFollow: boolean
  Movable: boolean
  pressEvent: FCLEvent
  longPressEvent: FCLEvent
  clickEvent: FCLEvent
  doubleClickEvent: FCLEvent
}

export interface FCLEvent {
  autoKeep: boolean
  autoClick: boolean
  openMenu: boolean
  switchTouchMode: boolean
  switchMouseMode: boolean
  input: boolean
  quickInput: boolean
  outputText: string
  outputKeycodes: number[]
  bindViewGroup: string[]
}

export interface FCLDirectionEvent {
  upKeycode: number
  downKeycode: number
  leftKeycode: number
  rightKeycode: number
  followOption: 'FIXED' | 'CENTER_FOLLOW' | 'FOLLOW'
  sneak: boolean
  sneakKeycode: number
}

export interface FCLButtonStyle {
  name: string
  textColor: number
  textSize: number
  strokeWidth: number
  strokeColor: number
  cornerRadius: number
  fillColor: number
  textColorPressed: number
  textSizePressed: number
  strokeWidthPressed: number
  strokeColorPressed: number
  cornerRadiusPressed: number
  fillColorPressed: number
}

export interface FCLDirectionStyle {
  name: string
  strokeWidth: number
  strokeColor: number
  fillColor: number
  strokeWidthPressed: number
  strokeColorPressed: number
  fillColorPressed: number
}
