import type { FCLController, FCLButton, FCLDirection, FCLButtonStyle } from '@/types/fcl'
import type { 
  ZL2ControlLayout, 
  ZL2Layer, 
  ZL2NormalButton, 
  ZL2ButtonStyle,
  ZL2ClickEvent,
  ZL2TranslatableString
} from '@/types/zl2'
import { FCL_TO_GLFW_KEYMAP, SAFE_ZL2_COLORS, FCL_SPECIAL_EVENTS } from './keymap'

export class FCLToZL2Converter {
  private styleMap: Map<string, string> = new Map()
  private layerMap: Map<string, string> = new Map()

  convert(fclController: FCLController): ZL2ControlLayout {
    this.styleMap.clear()
    this.layerMap.clear()

    // 第一步：建立层级映射
    this.buildLayerMapping(fclController)

    return {
      info: this.convertInfo(fclController),
      layers: this.convertLayers(fclController),
      styles: this.convertStyles(fclController),
      editorVersion: 4
    }
  }

  private buildLayerMapping(fcl: FCLController): void {
    // 为每个视图组生成 UUID 并建立映射
    fcl.viewGroups.forEach(group => {
      const layerUuid = this.generateUUID()
      this.layerMap.set(group.id, layerUuid)
      console.log(`Layer mapping: ${group.id} -> ${layerUuid}`)
    })
  }

  private convertInfo(fcl: FCLController): ZL2ControlLayout['info'] {
    return {
      name: this.createTranslatableString(fcl.name),
      author: this.createTranslatableString(fcl.author),
      description: this.createTranslatableString(fcl.description),
      versionCode: fcl.versionCode,
      versionName: fcl.version
    }
  }

  private createTranslatableString(text: string): ZL2TranslatableString {
    return {
      default: text,
      matchQueue: []
    }
  }

  private convertLayers(fcl: FCLController): ZL2Layer[] {
    return fcl.viewGroups.map(group => {
      // 使用预先建立的映射
      const layerUuid = this.layerMap.get(group.id)!
      
      return {
        name: group.name,
        uuid: layerUuid,
        hide: group.visibility === 'INVISIBLE',
        hideWhenMouse: false,
        hideWhenGamepad: false,
        visibilityType: 'always',
        normalButtons: [
          ...group.viewData.buttonList.map(btn => this.convertButton(btn)),
          ...this.convertDirectionsToButtons(group.viewData.directionList)
        ],
        textBoxes: []
      }
    })
  }

  private convertButton(fclBtn: FCLButton): ZL2NormalButton {
    const baseInfo = fclBtn.baseInfo
    
    return {
      text: this.createTranslatableString(fclBtn.text),
      uuid: this.generateUUID(),
      position: {
        x: Math.round(baseInfo.xPosition * 10), // FCL: 500 = 50%, ZL2: 5000 = 50%
        y: Math.round(baseInfo.yPosition * 10)
      },
      buttonSize: this.convertButtonSize(baseInfo),
      buttonStyle: this.getStyleUUID(fclBtn.style),
      textAlignment: 'Center',
      textBold: false,
      textItalic: false,
      textUnderline: false,
      visibilityType: this.convertVisibilityType(baseInfo.visibilityType),
      clickEvents: this.convertButtonEvents(fclBtn.event),
      isSwipple: false,
      isPenetrable: fclBtn.event.pointerFollow,
      isToggleable: fclBtn.event.pressEvent.autoKeep && !fclBtn.event.pressEvent.autoClick
    }
  }

  private convertButtonSize(baseInfo: FCLButton['baseInfo']): ZL2NormalButton['buttonSize'] {
    if (baseInfo.sizeType === 'ABSOLUTE') {
      return {
        type: 'dp',
        widthDp: baseInfo.absoluteWidth || 50,
        heightDp: baseInfo.absoluteHeight || 50,
        widthPercentage: 500,
        heightPercentage: 500,
        widthReference: 'screen_height',
        heightReference: 'screen_height'
      }
    }

    // PERCENTAGE
    const widthSize = baseInfo.percentageWidth?.size || 50
    const heightSize = baseInfo.percentageHeight?.size || 50
    
    return {
      type: 'percentage',
      widthDp: 50,
      heightDp: 50,
      widthPercentage: Math.round(widthSize * 10), // FCL: 50 = 5%, ZL2: 500 = 5%
      heightPercentage: Math.round(heightSize * 10),
      widthReference: baseInfo.percentageWidth?.reference === 'SCREEN_WIDTH' ? 'screen_width' : 'screen_height',
      heightReference: baseInfo.percentageHeight?.reference === 'SCREEN_WIDTH' ? 'screen_width' : 'screen_height'
    }
  }

  private convertVisibilityType(fclType: string): 'always' | 'in_game' | 'in_menu' {
    switch (fclType) {
      case 'IN_GAME': return 'in_game'
      case 'MENU': return 'in_menu'
      default: return 'always'
    }
  }

  private convertButtonEvents(event: FCLButton['event']): ZL2ClickEvent[] {
    const events: ZL2ClickEvent[] = []

    // 处理所有事件类型，合并所有有效事件
    const eventTypes = [
      { data: event.pressEvent, priority: 1 },
      { data: event.clickEvent, priority: 2 },
      { data: event.longPressEvent, priority: 3 },
      { data: event.doubleClickEvent, priority: 4 }
    ]

    // 找到优先级最高的有效事件
    let selectedEvent = null
    let highestPriority = 999

    for (const eventType of eventTypes) {
      if (!eventType.data) continue
      
      const hasContent = (
        (eventType.data.outputKeycodes && eventType.data.outputKeycodes.length > 0) ||
        (eventType.data.outputText && eventType.data.outputText.trim()) ||
        (eventType.data.bindViewGroup && eventType.data.bindViewGroup.length > 0) ||
        eventType.data.input ||
        eventType.data.quickInput ||
        eventType.data.switchTouchMode ||
        eventType.data.switchMouseMode ||
        eventType.data.openMenu
      )

      if (hasContent && eventType.priority < highestPriority) {
        selectedEvent = eventType.data
        highestPriority = eventType.priority
      }
    }

    if (!selectedEvent) return events

    // 处理选中的事件
    const eventData = selectedEvent

    // 处理键码输出
    if (eventData.outputKeycodes && eventData.outputKeycodes.length > 0) {
      eventData.outputKeycodes.forEach(keycode => {
        const glfwKey = this.convertKeycode(keycode)
        if (glfwKey) {
          events.push({
            type: glfwKey.startsWith('launcher.event.') ? 'launcher_event' : 'key',
            key: glfwKey
          })
        }
      })
    }

    // 处理输入相关事件
    if (eventData.input || eventData.quickInput) {
      events.push({
        type: 'launcher_event',
        key: FCL_SPECIAL_EVENTS.switch_ime
      })
    }

    // 处理文本输出
    if (eventData.outputText && eventData.outputText.trim()) {
      events.push({
        type: 'send_text',
        key: eventData.outputText
      })
    }

    // 处理视图组切换
    if (eventData.bindViewGroup && eventData.bindViewGroup.length > 0) {
      eventData.bindViewGroup.forEach(groupId => {
        // 使用映射的 ZL2 层 UUID，如果找不到映射则使用原 ID
        const zl2LayerUuid = this.layerMap.get(groupId)
        if (zl2LayerUuid) {
          events.push({
            type: 'switch_layer',
            key: zl2LayerUuid
          })
        } else {
          // 如果找不到映射，可能是外部引用，保持原 ID
          console.warn(`Layer mapping not found for group ID: ${groupId}`)
          events.push({
            type: 'switch_layer',
            key: groupId
          })
        }
      })
    }

    // 处理特殊启动器事件
    if (eventData.switchTouchMode) {
      events.push({
        type: 'launcher_event',
        key: FCL_SPECIAL_EVENTS.switch_touch_mode
      })
    }

    if (eventData.switchMouseMode) {
      events.push({
        type: 'launcher_event',
        key: FCL_SPECIAL_EVENTS.switch_menu
      })
    }

    if (eventData.openMenu) {
      events.push({
        type: 'launcher_event',
        key: FCL_SPECIAL_EVENTS.open_menu
      })
    }

    return events
  }

  private convertKeycode(fclKeycode: number): string | null {
    return FCL_TO_GLFW_KEYMAP[fclKeycode] || null
  }

  private convertDirectionsToButtons(directions: FCLDirection[]): ZL2NormalButton[] {
    const buttons: ZL2NormalButton[] = []

    directions.forEach(dir => {
      // 使用 ZL2 默认移动按钮的精确布局和样式
      const moveButtons = [
        // 第一行
        {
          text: '◤',
          uuid: this.generateUUID(),
          position: { x: 794, y: 5411 },
          style: 'topstart',
          keys: [dir.event.upKeycode, dir.event.leftKeycode]
        },
        {
          text: '▲',
          uuid: this.generateUUID(),
          position: { x: 1474, y: 5410 },
          style: 'default',
          keys: [dir.event.upKeycode]
        },
        {
          text: '◥',
          uuid: this.generateUUID(),
          position: { x: 2154, y: 5410 },
          style: 'topend',
          keys: [dir.event.upKeycode, dir.event.rightKeycode]
        },
        // 第二行
        {
          text: '◀',
          uuid: this.generateUUID(),
          position: { x: 794, y: 7011 },
          style: 'default',
          keys: [dir.event.leftKeycode]
        },
        {
          text: '',
          uuid: this.generateUUID(),
          position: { x: 1474, y: 7011 },
          style: 'default',
          keys: [] // 中心按钮，无按键
        },
        {
          text: '▶',
          uuid: this.generateUUID(),
          position: { x: 2154, y: 7011 },
          style: 'default',
          keys: [dir.event.rightKeycode]
        },
        // 第三行
        {
          text: '◣',
          uuid: this.generateUUID(),
          position: { x: 794, y: 8611 },
          style: 'bottomstart',
          keys: [dir.event.downKeycode, dir.event.leftKeycode]
        },
        {
          text: '▼',
          uuid: this.generateUUID(),
          position: { x: 1474, y: 8611 },
          style: 'default',
          keys: [dir.event.downKeycode]
        },
        {
          text: '◢',
          uuid: this.generateUUID(),
          position: { x: 2154, y: 8611 },
          style: 'bottomend',
          keys: [dir.event.downKeycode, dir.event.rightKeycode]
        }
      ]

      moveButtons.forEach(btn => {
        buttons.push({
          text: this.createTranslatableString(btn.text),
          uuid: btn.uuid,
          position: btn.position,
          buttonSize: {
            type: 'percentage',
            widthDp: 50.0,
            heightDp: 50.0,
            widthPercentage: 1380,
            heightPercentage: 1380,
            widthReference: 'screen_height',
            heightReference: 'screen_height'
          },
          buttonStyle: btn.style,
          textAlignment: 'Center',
          textBold: false,
          textItalic: false,
          textUnderline: false,
          visibilityType: this.convertVisibilityType(dir.baseInfo.visibilityType),
          clickEvents: btn.keys.map(key => ({
            type: 'key',
            key: this.convertKeycode(key) || 'GLFW_KEY_W'
          })),
          isSwipple: true,
          isPenetrable: false,
          isToggleable: false
        })
      })
    })

    return buttons
  }

  private convertStyles(fcl: FCLController): ZL2ButtonStyle[] {
    const styles: ZL2ButtonStyle[] = []

    // 添加 ZL2 默认样式
    this.addDefaultZL2Styles(styles)

    // 转换 FCL 样式
    fcl.buttonStyles.forEach(style => {
      const uuid = this.generateUUID()
      this.styleMap.set(style.name, uuid)

      styles.push({
        name: style.name,
        uuid: uuid,
        animateSwap: false,
        lightStyle: this.convertStyleConfig(style),
        darkStyle: this.convertStyleConfig(style)
      })
    })

    return styles
  }

  private addDefaultZL2Styles(styles: ZL2ButtonStyle[]): void {
    const defaultStyles = [
      {
        name: 'topend',
        uuid: '21b054786830',
        borderRadius: { topStart: 0.0, topEnd: 40.0, bottomEnd: 0.0, bottomStart: 0.0 }
      },
      {
        name: 'topstart',
        uuid: '43f4fb63f80a',
        borderRadius: { topStart: 40.0, topEnd: 0.0, bottomEnd: 0.0, bottomStart: 0.0 }
      },
      {
        name: 'bottomend',
        uuid: '0fa337d97f90',
        borderRadius: { topStart: 0.0, topEnd: 0.0, bottomEnd: 40.0, bottomStart: 0.0 }
      },
      {
        name: 'bottomstart',
        uuid: 'a5824dc0029d',
        borderRadius: { topStart: 0.0, topEnd: 0.0, bottomEnd: 0.0, bottomStart: 40.0 }
      },
      {
        name: 'end',
        uuid: 'd8cd25b80d5d',
        borderRadius: { topStart: 0.0, topEnd: 40.0, bottomEnd: 40.0, bottomStart: 0.0 }
      },
      {
        name: 'start',
        uuid: 'ea3ab7bc621f',
        borderRadius: { topStart: 40.0, topEnd: 0.0, bottomEnd: 0.0, bottomStart: 40.0 }
      },
      {
        name: 'rounded',
        uuid: 'cac8c754ffa0',
        borderRadius: { topStart: 40.0, topEnd: 40.0, bottomEnd: 40.0, bottomStart: 40.0 }
      },
      {
        name: 'default',
        uuid: 'd1096cf91caa',
        borderRadius: { topStart: 0.0, topEnd: 0.0, bottomEnd: 0.0, bottomStart: 0.0 }
      }
    ]

    defaultStyles.forEach(styleConfig => {
      const baseStyle = {
        alpha: 1.0,
        pressedAlpha: 1.0,
        backgroundColor: SAFE_ZL2_COLORS.TRANSPARENT_BLACK,
        pressedBackgroundColor: SAFE_ZL2_COLORS.GRAY,
        contentColor: SAFE_ZL2_COLORS.WHITE,
        pressedContentColor: SAFE_ZL2_COLORS.WHITE,
        fontSize: null,
        pressedFontSize: null,
        borderWidth: 0,
        pressedBorderWidth: 0,
        borderColor: SAFE_ZL2_COLORS.WHITE,
        pressedBorderColor: SAFE_ZL2_COLORS.WHITE,
        borderRadius: styleConfig.borderRadius,
        pressedBorderRadius: styleConfig.borderRadius
      }

      styles.push({
        name: styleConfig.name,
        uuid: styleConfig.uuid,
        animateSwap: false,
        lightStyle: baseStyle,
        darkStyle: baseStyle
      })

      // 建立样式映射
      this.styleMap.set(styleConfig.name, styleConfig.uuid)
    })
  }

  private convertStyleConfig(fclStyle: FCLButtonStyle): ZL2ButtonStyle['lightStyle'] {
    return {
      alpha: this.calculateAlpha(fclStyle.fillColor),
      pressedAlpha: this.calculateAlpha(fclStyle.fillColorPressed),
      backgroundColor: SAFE_ZL2_COLORS.TRANSPARENT_BLACK,
      pressedBackgroundColor: SAFE_ZL2_COLORS.GRAY,
      contentColor: SAFE_ZL2_COLORS.WHITE,
      pressedContentColor: SAFE_ZL2_COLORS.WHITE,
      fontSize: fclStyle.textSize || null,
      pressedFontSize: fclStyle.textSizePressed || null,
      borderWidth: Math.round(fclStyle.strokeWidth / 10),
      pressedBorderWidth: Math.round(fclStyle.strokeWidthPressed / 10),
      borderColor: SAFE_ZL2_COLORS.WHITE,
      pressedBorderColor: SAFE_ZL2_COLORS.WHITE,
      borderRadius: {
        topStart: fclStyle.cornerRadius / 10,
        topEnd: fclStyle.cornerRadius / 10,
        bottomEnd: fclStyle.cornerRadius / 10,
        bottomStart: fclStyle.cornerRadius / 10
      },
      pressedBorderRadius: {
        topStart: fclStyle.cornerRadiusPressed / 10,
        topEnd: fclStyle.cornerRadiusPressed / 10,
        bottomEnd: fclStyle.cornerRadiusPressed / 10,
        bottomStart: fclStyle.cornerRadiusPressed / 10
      }
    }
  }

  private calculateAlpha(color: number): number {
    // 从 ARGB 颜色中提取 alpha 通道
    const alpha = (color >>> 24) & 0xFF
    return alpha / 255
  }

  private getStyleUUID(styleName: string): string | null {
    return this.styleMap.get(styleName) || null
  }

  private generateUUID(): string {
    return Math.random().toString(36).substring(2, 15)
  }
}
