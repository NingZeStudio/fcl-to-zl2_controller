// ZL2 控件系统类型定义

export interface ZL2ControlLayout {
  info: ZL2Info
  layers: ZL2Layer[]
  styles: ZL2ButtonStyle[]
  special: ZL2SpecialConfig
  editorVersion: number
}

export interface ZL2SpecialConfig {
  joystickStyle: ZL2JoystickStyle | null
}

export interface ZL2JoystickStyle {
  alpha: number
  backgroundColor: string
  joystickColor: string
  joystickCanLockColor: string
  joystickLockedColor: string
  backgroundShape: number
  joystickShape: number
  joystickSize: number
}

export interface ZL2Info {
  name: ZL2TranslatableString
  author: ZL2TranslatableString
  description: ZL2TranslatableString
  versionCode: number
  versionName: string
}

export interface ZL2TranslatableString {
  default: string
  matchQueue: Array<{
    language_tag: string
    value: string
  }>
}

export interface ZL2Layer {
  name: string
  uuid: string
  hide: boolean
  hideWhenMouse: boolean
  hideWhenGamepad: boolean
  hideWhenJoystick: boolean
  visibilityType: 'always' | 'in_game' | 'in_menu'
  normalButtons: ZL2NormalButton[]
  textBoxes: ZL2TextBox[]
}

export interface ZL2TextBox {
  text: ZL2TranslatableString
  uuid: string
  position: {
    x: number
    y: number
  }
  buttonSize: ZL2ButtonSize
  buttonStyle: string | null
  textAlignment?: 'Start' | 'Center' | 'End'
  textBold?: boolean
  textItalic?: boolean
  textUnderline?: boolean
  visibilityType: 'always' | 'in_game' | 'in_menu'
}

export interface ZL2NormalButton {
  text: ZL2TranslatableString
  uuid: string
  position: {
    x: number
    y: number
  }
  buttonSize: ZL2ButtonSize
  buttonStyle: string | null
  textAlignment?: 'Start' | 'Center' | 'End'
  textBold?: boolean
  textItalic?: boolean
  textUnderline?: boolean
  visibilityType: 'always' | 'in_game' | 'in_menu'
  clickEvents: ZL2ClickEvent[]
  isSwipple: boolean
  isPenetrable: boolean
  isToggleable: boolean
}

export interface ZL2ButtonSize {
  type: 'dp' | 'percentage' | 'wrap_content'
  widthDp: number
  heightDp: number
  widthPercentage: number
  heightPercentage: number
  widthReference: 'screen_width' | 'screen_height'
  heightReference: 'screen_width' | 'screen_height'
}

export interface ZL2ClickEvent {
  type: 'key' | 'launcher_event' | 'switch_layer' | 'show_layer' | 'hide_layer' | 'send_text'
  key: string
}

export interface ZL2ButtonStyle {
  name: string
  uuid: string
  animateSwap: boolean
  commonStyle: boolean
  lightStyle: ZL2StyleConfig
  darkStyle: ZL2StyleConfig
}

export interface ZL2StyleConfig {
  alpha: number
  pressedAlpha: number
  backgroundColor: string  // 使用字符串避免 JSON 精度问题
  pressedBackgroundColor: string
  contentColor: string
  pressedContentColor: string
  fontSize: number | null
  pressedFontSize: number | null
  borderWidth: number
  pressedBorderWidth: number
  borderColor: string
  pressedBorderColor: string
  borderRadius: ZL2ButtonShape
  pressedBorderRadius: ZL2ButtonShape
}

export interface ZL2ButtonShape {
  topStart: number
  topEnd: number
  bottomEnd: number
  bottomStart: number
}
