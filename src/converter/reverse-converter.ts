import type { 
  FCLController, 
  FCLButton, 
  FCLViewGroup, 
  FCLButtonStyle,
  FCLBaseInfo,
  FCLButtonEvent,
  FCLEvent
} from '@/types/fcl'
import type { 
  ZL2ControlLayout, 
  ZL2Layer, 
  ZL2NormalButton, 
  ZL2ButtonStyle,
  ZL2ClickEvent,
  ZL2TextBox
} from '@/types/zl2'
import { FCL_TO_GLFW_KEYMAP, FCL_SPECIAL_EVENTS } from './keymap'

export class ZL2ToFCLConverter {
  private glfwToFclKeymap: Record<string, number> = {}
  private specialToFclEvent: Record<string, string> = {}
  private styleIdMap: Map<string, string> = new Map() // ZL2 UUID -> FCL Name
  private viewGroupIdMap: Map<string, string> = new Map() // ZL2 UUID -> FCL ID

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
    // 1. 初始化映射
    this.styleIdMap.clear()
    this.viewGroupIdMap.clear()
    this.initializeStyleMap(zl2Layout.styles)
    this.initializeViewGroupMap(zl2Layout.layers)

    // 2. 转换层和按钮
    const viewGroups = this.convertLayers(zl2Layout.layers)

    return {
      id: this.generateFclId(),
      name: zl2Layout.info.name.default,
      version: zl2Layout.info.versionName,
      versionCode: zl2Layout.info.versionCode,
      author: zl2Layout.info.author.default,
      description: zl2Layout.info.description.default,
      controllerVersion: 3,
      buttonStyles: this.convertStyles(zl2Layout.styles, zl2Layout.layers),
      directionStyles: [],
      viewGroups: viewGroups
    }
  }

  private initializeViewGroupMap(layers: ZL2Layer[] | undefined) {
    if (!layers) return
    layers.forEach(layer => {
      this.viewGroupIdMap.set(layer.uuid, this.generateFclId())
    })
  }

  private initializeStyleMap(zl2Styles: ZL2ButtonStyle[] | undefined) {
    // 处理内置样式映射 (保持与 converter.ts 一致)
    const builtInStyles: Record<string, string> = {
      '21b054786830': '右上圆角',
      '43f4fb63f80a': '左上圆角',
      '0fa337d97f90': '右下圆角',
      'a5824dc0029d': '左下圆角',
      'd8cd25b80d5d': '右边圆角',
      'ea3ab7bc621f': '左边圆角',
      'cac8c754ffa0': '全圆角',
      'd1096cf91caa': '默认样式'
    }

    Object.entries(builtInStyles).forEach(([uuid, name]) => {
      this.styleIdMap.set(uuid, name)
    })

    // 处理布局中的自定义样式
    if (zl2Styles) {
      zl2Styles.forEach(style => {
        // 如果不是内置样式，则优先使用 ZL2 中的名称
        if (!builtInStyles[style.uuid]) {
          const name = style.name || `样式_${style.uuid.substring(0, 4)}`
          this.styleIdMap.set(style.uuid, name)
        }
      })
    }
  }

  private generateFclId(): string {
    // FCL 通常使用 8 位随机字符串
    return Math.random().toString(36).substring(2, 10)
  }

  private convertLayers(layers: ZL2Layer[] | undefined): FCLViewGroup[] {
    if (!layers) return []
    return layers.map(layer => ({
      id: this.viewGroupIdMap.get(layer.uuid) || this.generateFclId(),
      name: layer.name,
      visibility: layer.hide ? 'INVISIBLE' : 'VISIBLE',
      viewData: {
        buttonList: [
          ...(layer.normalButtons || []).map(btn => this.convertButton(btn)),
          ...(layer.textBoxes || []).map(text => this.convertTextBox(text))
        ],
        directionList: []
      }
    }))
  }

  private convertTextBox(zl2Text: ZL2TextBox): FCLButton {
    return {
      id: this.generateFclId(),
      text: `T:${zl2Text.text.default}`, // 添加 T: 前缀以便识别
      style: this.getFclStyleName(zl2Text.buttonStyle),
      baseInfo: this.convertBaseInfo(zl2Text as any),
      event: {
        pressEvent: this.createEmptyEvent(),
        longPressEvent: this.createEmptyEvent(),
        clickEvent: this.createEmptyEvent(),
        doubleClickEvent: this.createEmptyEvent(),
        pointerFollow: false,
        Movable: false
      }
    }
  }

  private createEmptyEvent(): FCLEvent {
    return {
      autoKeep: false,
      autoClick: false,
      openMenu: false,
      switchTouchMode: false,
      switchMouseMode: false,
      input: false,
      quickInput: false,
      outputText: '',
      outputKeycodes: [],
      bindViewGroup: []
    }
  }

  private convertButton(zl2Btn: ZL2NormalButton): FCLButton {
    return {
      id: this.generateFclId(),
      text: zl2Btn.text.default,
      style: this.getFclStyleName(zl2Btn.buttonStyle),
      baseInfo: this.convertBaseInfo(zl2Btn),
      event: this.convertEvents(zl2Btn)
    }
  }

  private getFclStyleName(zl2StyleId: string | null): string {
    if (!zl2StyleId) return '默认样式'
    return this.styleIdMap.get(zl2StyleId) || `样式_${zl2StyleId.substring(0, 4)}`
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
    const pressEvent = this.createEmptyEvent()
    pressEvent.autoKeep = zl2Btn.isToggleable

    if (zl2Btn.clickEvents) {
      zl2Btn.clickEvents.forEach(event => {
        switch (event.type) {
          case 'key':
            const fclKey = this.glfwToFclKeymap[event.key]
            if (fclKey !== undefined) {
              pressEvent.outputKeycodes.push(fclKey)
            }
            break
          case 'launcher_event':
            this.handleLauncherEvent(event.key, pressEvent)
            break
          case 'switch_layer':
            const fclLayerId = this.viewGroupIdMap.get(event.key)
            if (fclLayerId) {
              pressEvent.bindViewGroup.push(fclLayerId)
            } else {
              // 如果找不到映射，可能是外部引用或直接使用的 ID
              pressEvent.bindViewGroup.push(event.key)
            }
            break
          case 'send_text':
            pressEvent.outputText = event.key
            break
        }
      })
    }

    return {
      pressEvent,
      longPressEvent: this.createEmptyEvent(),
      clickEvent: this.createEmptyEvent(),
      doubleClickEvent: this.createEmptyEvent(),
      pointerFollow: zl2Btn.isPenetrable,
      Movable: false
    }
  }

  private handleLauncherEvent(zl2Event: string, eventData: FCLEvent) {
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
        eventData.outputKeycodes.push(fclKey)
      }
    }
  }

  private convertStyles(zl2Styles: ZL2ButtonStyle[] | undefined, layers: ZL2Layer[] | undefined): FCLButtonStyle[] {
    const fclStyles: FCLButtonStyle[] = (zl2Styles || []).map(style => {
      const config = style.lightStyle
      return {
        name: this.getFclStyleName(style.uuid),
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

    // 收集所有被按钮引用的样式名称
    const referencedStyleNames = new Set<string>()
    if (layers) {
      layers.forEach(layer => {
        if (layer.normalButtons) {
          layer.normalButtons.forEach(btn => {
            referencedStyleNames.add(this.getFclStyleName(btn.buttonStyle))
          })
        }
        if (layer.textBoxes) {
          layer.textBoxes.forEach(text => {
            referencedStyleNames.add(this.getFclStyleName(text.buttonStyle))
          })
        }
      })
    }

    // 确保所有引用的样式都在 buttonStyles 中
    referencedStyleNames.forEach(name => {
      if (!fclStyles.some(s => s.name === name)) {
        fclStyles.push(this.createDefaultFclStyle(name))
      }
    })

    // 确保“默认样式”始终存在
    if (!fclStyles.some(s => s.name === '默认样式')) {
      fclStyles.push(this.createDefaultFclStyle('默认样式'))
    }

    return fclStyles
  }

  private createDefaultFclStyle(name: string): FCLButtonStyle {
    // 根据名称尝试猜测一些基本样式
    let cornerRadius = 10
    if (name.includes('左上')) cornerRadius = 100 // 假设圆角按钮
    if (name.includes('右上')) cornerRadius = 100
    
    return {
      name: name,
      textColor: -1,
      textSize: 12,
      strokeWidth: 10,
      strokeColor: -12303292,
      cornerRadius: cornerRadius,
      fillColor: 0,
      textColorPressed: -1,
      textSizePressed: 12,
      strokeWidthPressed: 10,
      strokeColorPressed: -12303292,
      cornerRadiusPressed: cornerRadius,
      fillColorPressed: -3355444
    }
  }

  private convertColor(zl2Color: string): number {
    try {
      // ZL2 颜色是 Long 字符串，高 32 位是 ARGB
      // FCL 颜色是 32 位有符号 ARGB 整数
      const argb = BigInt(zl2Color) >> 32n
      return Number(BigInt.asIntN(32, argb))
    } catch (e) {
      // 默认返回白色或透明
      return -1
    }
  }
}
