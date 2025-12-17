import type { FCLController, FCLButton, FCLDirection, FCLButtonStyle } from '@/types/fcl'
import type { 
  ZL2ControlLayout, 
  ZL2Layer, 
  ZL2NormalButton, 
  ZL2ButtonStyle,
  ZL2ClickEvent,
  ZL2TranslatableString
} from '@/types/zl2'
import { FCL_TO_GLFW_KEYMAP, SAFE_ZL2_COLORS } from './keymap'

export class FCLToZL2Converter {
  private styleMap: Map<string, string> = new Map()

  convert(fclController: FCLController): ZL2ControlLayout {
    this.styleMap.clear()

    return {
      info: this.convertInfo(fclController),
      layers: this.convertLayers(fclController),
      styles: this.convertStyles(fclController),
      editorVersion: 4
    }
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
    return fcl.viewGroups.map(group => ({
      name: group.name,
      uuid: this.generateUUID(),
      hide: group.visibility === 'INVISIBLE',
      hideWhenMouse: false,
      hideWhenGamepad: false,
      visibilityType: 'always',
      normalButtons: [
        ...group.viewData.buttonList.map(btn => this.convertButton(btn)),
        ...this.convertDirectionsToButtons(group.viewData.directionList)
      ],
      textBoxes: []
    }))
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

    // 处理按下事件（最常用）
    const pressEvent = event.pressEvent
    if (pressEvent.outputKeycodes.length > 0) {
      pressEvent.outputKeycodes.forEach(keycode => {
        const glfwKey = this.convertKeycode(keycode)
        if (glfwKey) {
          events.push({
            type: glfwKey.startsWith('launcher.event.') ? 'launcher_event' : 'key',
            key: glfwKey
          })
        }
      })
    }

    // 处理文本输出
    if (pressEvent.outputText) {
      events.push({
        type: 'send_text',
        key: pressEvent.outputText
      })
    }

    // 处理视图组切换
    if (pressEvent.bindViewGroup.length > 0) {
      pressEvent.bindViewGroup.forEach(groupId => {
        events.push({
          type: 'switch_layer',
          key: groupId
        })
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
      const baseX = Math.round(dir.baseInfo.xPosition * 10)
      const baseY = Math.round(dir.baseInfo.yPosition * 10)
      const size = 1200 // 默认方向键按钮大小

      // 创建 8 个方向按钮
      const dirButtons = [
        { text: '◤', keys: [dir.event.upKeycode, dir.event.leftKeycode], x: baseX, y: baseY },
        { text: '▲', keys: [dir.event.upKeycode], x: baseX + size, y: baseY },
        { text: '◥', keys: [dir.event.upKeycode, dir.event.rightKeycode], x: baseX + size * 2, y: baseY },
        { text: '◀', keys: [dir.event.leftKeycode], x: baseX, y: baseY + size },
        { text: '▶', keys: [dir.event.rightKeycode], x: baseX + size * 2, y: baseY + size },
        { text: '◣', keys: [dir.event.downKeycode, dir.event.leftKeycode], x: baseX, y: baseY + size * 2 },
        { text: '▼', keys: [dir.event.downKeycode], x: baseX + size, y: baseY + size * 2 },
        { text: '◢', keys: [dir.event.downKeycode, dir.event.rightKeycode], x: baseX + size * 2, y: baseY + size * 2 },
      ]

      dirButtons.forEach(btn => {
        buttons.push({
          text: this.createTranslatableString(btn.text),
          uuid: this.generateUUID(),
          position: { x: btn.x, y: btn.y },
          buttonSize: {
            type: 'percentage',
            widthDp: 50,
            heightDp: 50,
            widthPercentage: size,
            heightPercentage: size,
            widthReference: 'screen_height',
            heightReference: 'screen_height'
          },
          buttonStyle: this.getStyleUUID(dir.style),
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
