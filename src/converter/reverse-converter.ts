import type { 
  FCLController, 
  FCLButton, 
  FCLViewGroup, 
  FCLButtonStyle,
  FCLBaseInfo,
  FCLButtonEvent,
  FCLEventData
} from '@/types/fcl'
import type { 
  ZL2ControlLayout, 
  ZL2Layer, 
  ZL2NormalButton, 
  ZL2ButtonStyle,
  ZL2ClickEvent
} from '@/types/zl2'
import { FCL_TO_GLFW_KEYMAP, FCL_SPECIAL_EVENTS } from './keymap'

export class ZL2ToFCLConverter {
  private glfwToFclKeymap: Record<string, number> = {}
  private specialToFclEvent: Record<string, string> = {}

  constructor() {
    // 初始化反向键码映射
    Object.entries(FCL_TO_GLFW_KEYMAP).forEach(([fclKey, glfwKey]) => {
      this.glfwToFclKeymap[glfwKey] = parseInt(fclKey)
    })

    // 初始化反向特殊事件映射
    Object.entries(FCL_SPECIAL_EVENTS).forEach(([fclEvent, zl2Event]) => {
      this.specialToFclEvent[zl2Event] = fclEvent
    })
  }

  convert(zl2Layout: ZL2ControlLayout): FCLController {
    return {
      id: zl2Layout.info.name.default.toLowerCase().replace(/\s+/g, '_') || 'converted_fcl',
      name: zl2Layout.info.name.default,
      version: zl2Layout.info.versionName,
      versionCode: zl2Layout.info.versionCode,
      author: zl2Layout.info.author.default,
      description: zl2Layout.info.description.default,
      controllerVersion: 3,
      buttonStyles: this.convertStyles(zl2Layout.styles),
      directionStyles: [], // ZL2 没有专门的方向键样式
      viewGroups: this.convertLayers(zl2Layout.layers)
    }
  }

  private convertLayers(layers: ZL2Layer[]): FCLViewGroup[] {
    return layers.map(layer => ({
      id: layer.uuid,
      name: layer.name,
      visibility: layer.hide ? 'INVISIBLE' : 'VISIBLE',
      viewData: {
        // 遵从用户反馈：ZL2 的所有按钮统一转为 FCL 的 buttonList。
        // 不尝试自动识别/转换方向盘（directionList），因为系统自动判断效果较差且不灵活。
        buttonList: layer.normalButtons.map(btn => this.convertButton(btn)),
        directionList: []
      }
    }))
  }

  private convertButton(zl2Btn: ZL2NormalButton): FCLButton {
    return {
      id: zl2Btn.uuid,
      text: zl2Btn.text.default,
      style: zl2Btn.buttonStyle || 'default',
      baseInfo: this.convertBaseInfo(zl2Btn),
      event: this.convertEvents(zl2Btn)
    }
  }

  private convertBaseInfo(zl2Btn: ZL2NormalButton): FCLBaseInfo {
    const size = zl2Btn.buttonSize
    const baseInfo: FCLBaseInfo = {
      xPosition: Math.round(zl2Btn.position.x / 10),
      yPosition: Math.round(zl2Btn.position.y / 10),
      sizeType: size.type === 'dp' ? 'ABSOLUTE' : 'PERCENTAGE',
      visibilityType: this.convertVisibilityType(zl2Btn.visibilityType)
    }

    if (size.type === 'dp') {
      baseInfo.absoluteWidth = size.widthDp
      baseInfo.absoluteHeight = size.heightDp
    } else {
      baseInfo.percentageWidth = {
        reference: size.widthReference === 'screen_width' ? 'SCREEN_WIDTH' : 'SCREEN_HEIGHT',
        size: Math.round(size.widthPercentage / 10)
      }
      baseInfo.percentageHeight = {
        reference: size.heightReference === 'screen_width' ? 'SCREEN_WIDTH' : 'SCREEN_HEIGHT',
        size: Math.round(size.heightPercentage / 10)
      }
    }

    return baseInfo
  }

  private convertVisibilityType(zl2Type: string): 'ALWAYS' | 'IN_GAME' | 'MENU' {
    switch (zl2Type) {
      case 'in_game': return 'IN_GAME'
      case 'in_menu': return 'MENU'
      default: return 'ALWAYS'
    }
  }

  private convertEvents(zl2Btn: ZL2NormalButton): FCLButtonEvent {
    const pressEvent: FCLEventData = {
      outputKeycodes: [],
      bindViewGroup: [],
      autoKeep: zl2Btn.isToggleable,
      pointerFollow: zl2Btn.isPenetrable
    }

    zl2Btn.clickEvents.forEach(event => {
      switch (event.type) {
        case 'key':
          const fclKey = this.glfwToFclKeymap[event.key]
          if (fclKey !== undefined) {
            pressEvent.outputKeycodes!.push(fclKey)
          }
          break
        case 'launcher_event':
          this.handleLauncherEvent(event.key, pressEvent)
          break
        case 'switch_layer':
          pressEvent.bindViewGroup!.push(event.key)
          break
        case 'send_text':
          pressEvent.outputText = event.key
          break
      }
    })

    return {
      pressEvent,
      pointerFollow: zl2Btn.isPenetrable
    }
  }

  private handleLauncherEvent(zl2Event: string, eventData: FCLEventData) {
    const fclSpecial = this.specialToFclEvent[zl2Event]
    if (fclSpecial) {
      switch (fclSpecial) {
        case 'switch_ime':
          eventData.quickInput = true
          break
        case 'switch_menu':
          eventData.switchMouseMode = true
          break
        case 'switch_touch_mode':
          eventData.switchTouchMode = true
          break
        case 'open_menu':
          eventData.openMenu = true
          break
      }
    } else if (zl2Event.startsWith('launcher.event.')) {
      // 如果是滚动事件等，可能在 keymap 中
      const fclKey = this.glfwToFclKeymap[zl2Event]
      if (fclKey !== undefined) {
        eventData.outputKeycodes!.push(fclKey)
      }
    }
  }

  private convertStyles(zl2Styles: ZL2ButtonStyle[]): FCLButtonStyle[] {
    return zl2Styles.map(style => {
      const config = style.lightStyle
      return {
        name: style.uuid,
        textColor: this.convertColor(config.contentColor),
        textSize: config.fontSize || 12,
        strokeWidth: (config.borderWidth || 0) * 10,
        strokeColor: this.convertColor(config.borderColor),
        cornerRadius: (config.borderRadius?.topStart || 0) * 10,
        fillColor: this.convertColor(config.backgroundColor),
        textColorPressed: this.convertColor(config.pressedContentColor),
        textSizePressed: config.pressedFontSize || 12,
        strokeWidthPressed: (config.pressedBorderWidth || 0) * 10,
        strokeColorPressed: this.convertColor(config.pressedBorderColor),
        cornerRadiusPressed: (config.pressedBorderRadius?.topStart || 0) * 10,
        fillColorPressed: this.convertColor(config.pressedBackgroundColor)
      }
    })
  }

  private convertColor(zl2Color: string): number {
    try {
      // ZL2 颜色是 Long 字符串，高 32 位是 ARGB
      // FCL 颜色是 32 位 ARGB 整数
      return Number(BigInt(zl2Color) >> 32n)
    } catch (e) {
      // 默认返回白色或透明
      return -1
    }
  }
}
