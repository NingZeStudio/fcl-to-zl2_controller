import type { FCLController, FCLButton, FCLDirection, FCLButtonStyle } from '@/types/fcl'
import type {
  ZL2ControlLayout,
  ZL2Layer,
  ZL2NormalButton,
  ZL2ButtonStyle,
  ZL2ClickEvent,
  ZL2TranslatableString,
  ZL2TextBox
} from '@/types/zl2'
import { FCL_TO_GLFW_KEYMAP, SAFE_ZL2_COLORS, FCL_SPECIAL_EVENTS } from './keymap'
import { ConversionError, ConversionErrorCode } from './errors'

const ZL2_LIMITS = {
  MIN_PERCENTAGE: 500,
  MIN_DP: 5,
  MAX_COORD: 10000,
  MIN_COORD: 0,
  FONT_SIZE: { MIN: 2, MAX: 30 },
  BORDER_WIDTH: { MIN: 0, MAX: 50 },
  ALPHA: { MIN: 0.0, MAX: 1.0 }
}

export class FCLToZL2Converter {
  private styleMap: Map<string, string> = new Map()
  private layerMap: Map<string, string> = new Map()

  convert(fclController: FCLController): ZL2ControlLayout {
    try {
      this.styleMap.clear()
      this.layerMap.clear()

      if (!fclController.viewGroups) {
        throw ConversionError.missingField('viewGroups', 'FCLController')
      }

      this.buildLayerMapping(fclController)

      return {
        info: this.convertInfo(fclController),
        layers: this.convertLayers(fclController),
        styles: this.convertStyles(fclController),
        special: {
          joystickStyle: null
        },
        editorVersion: 11
      }
    } catch (err) {
      if (err instanceof ConversionError) throw err
      throw new ConversionError(
        `FCL to ZL2 conversion failed: ${(err as Error).message}`,
        ConversionErrorCode.INVALID_JSON,
        { originalError: err }
      )
    }
  }

  private buildLayerMapping(fcl: FCLController): void {
    ;(fcl.viewGroups || []).forEach(group => {
      const layerUuid = this.generateUUID()
      this.layerMap.set(group.id, layerUuid)
    })
  }

  private convertInfo(fcl: FCLController): ZL2ControlLayout['info'] {
    return {
      name: this.createTranslatableString(fcl.name || 'Untitled'),
      author: this.createTranslatableString(fcl.author || 'Unknown'),
      description: this.createTranslatableString(fcl.description || ''),
      versionCode: fcl.versionCode || 0,
      versionName: fcl.version || '1.0'
    }
  }

  private createTranslatableString(text: string): ZL2TranslatableString {
    return {
      default: text || '',
      matchQueue: []
    }
  }

  private convertLayers(fcl: FCLController): ZL2Layer[] {
    return (fcl.viewGroups || []).map(group => {
      const layerUuid = this.layerMap.get(group.id) || this.generateUUID()
      const viewData = group.viewData || {}

      return {
        name: group.name || 'Unnamed',
        uuid: layerUuid,
        hide: group.visibility === 'INVISIBLE',
        hideWhenMouse: false,
        hideWhenGamepad: false,
        hideWhenJoystick: false,
        visibilityType: this.convertGroupVisibility(group.visibility, viewData),
        normalButtons: [
          ...(viewData.buttonList || []).map(btn => this.convertButton(btn)),
          ...this.convertDirectionsToButtons(viewData.directionList || [])
        ],
        textBoxes: (viewData.buttonList || [])
          .filter(btn => btn.text && btn.text.startsWith('T:'))
          .map(btn => this.convertButtonToTextBox(btn))
      }
    })
  }

  private convertGroupVisibility(groupVisibility: string, viewData: any): 'always' | 'in_game' | 'in_menu' {
    const buttons = viewData.buttonList || []
    const directions = viewData.directionList || []
    const allWidgets = [...buttons, ...directions]

    const hasAlways = allWidgets.some(w => w.baseInfo?.visibilityType === 'ALWAYS')
    const hasInGame = allWidgets.some(w => w.baseInfo?.visibilityType === 'IN_GAME')
    const hasInMenu = allWidgets.some(w => w.baseInfo?.visibilityType === 'MENU')

    if (hasAlways && !hasInGame && !hasInMenu) return 'always'
    if (hasInGame && !hasAlways && !hasInMenu) return 'in_game'
    if (hasInMenu && !hasAlways && !hasInGame) return 'in_menu'

    if (groupVisibility === 'INVISIBLE') return 'in_menu'
    return 'always'
  }

  private convertButtonToTextBox(fclBtn: FCLButton): ZL2TextBox {
    const baseInfo = fclBtn.baseInfo || {}
    const text = fclBtn.text?.startsWith('T:') ? fclBtn.text.substring(2) : (fclBtn.text || '')
    return {
      text: this.createTranslatableString(text),
      uuid: this.generateUUID(),
      position: {
        x: this.clampCoord(Math.round((baseInfo.xPosition || 0) * 10)),
        y: this.clampCoord(Math.round((baseInfo.yPosition || 0) * 10))
      },
      buttonSize: this.convertButtonSize(baseInfo),
      buttonStyle: this.getStyleUUID(fclBtn.style),
      textAlignment: 'Center',
      textBold: false,
      textItalic: false,
      textUnderline: false,
      visibilityType: this.convertVisibilityType(baseInfo.visibilityType)
    }
  }

  private convertButton(fclBtn: FCLButton): ZL2NormalButton {
    const baseInfo = fclBtn.baseInfo || {}
    const event = fclBtn.event || {} as FCLButton['event']

    return {
      text: this.createTranslatableString(fclBtn.text || ''),
      uuid: this.generateUUID(),
      position: {
        x: this.clampCoord(Math.round((baseInfo.xPosition || 0) * 10)),
        y: this.clampCoord(Math.round((baseInfo.yPosition || 0) * 10))
      },
      buttonSize: this.convertButtonSize(baseInfo),
      buttonStyle: this.getStyleUUID(fclBtn.style),
      textAlignment: 'Center',
      textBold: false,
      textItalic: false,
      textUnderline: false,
      visibilityType: this.convertVisibilityType(baseInfo.visibilityType),
      clickEvents: this.convertButtonEvents(event),
      isSwipple: false,
      isPenetrable: !!event.pointerFollow,
      isToggleable: !!(event.pressEvent?.autoKeep && !event.pressEvent?.autoClick)
    }
  }

  private convertButtonSize(baseInfo: FCLButton['baseInfo']): ZL2NormalButton['buttonSize'] {
    if (baseInfo.sizeType === 'ABSOLUTE') {
      return {
        type: 'dp',
        widthDp: Math.max(ZL2_LIMITS.MIN_DP, baseInfo.absoluteWidth || 50),
        heightDp: Math.max(ZL2_LIMITS.MIN_DP, baseInfo.absoluteHeight || 50),
        widthPercentage: 500,
        heightPercentage: 500,
        widthReference: 'screen_height',
        heightReference: 'screen_height'
      }
    }

    const widthSize = baseInfo.percentageWidth?.size || 50
    const heightSize = baseInfo.percentageHeight?.size || 50

    return {
      type: 'percentage',
      widthDp: 50,
      heightDp: 50,
      widthPercentage: Math.max(ZL2_LIMITS.MIN_PERCENTAGE, Math.round(widthSize * 10)),
      heightPercentage: Math.max(ZL2_LIMITS.MIN_PERCENTAGE, Math.round(heightSize * 10)),
      widthReference: baseInfo.percentageWidth?.reference === 'SCREEN_WIDTH' ? 'screen_width' : 'screen_height',
      heightReference: baseInfo.percentageHeight?.reference === 'SCREEN_WIDTH' ? 'screen_width' : 'screen_height'
    }
  }

  private clampCoord(val: number): number {
    return Math.min(ZL2_LIMITS.MAX_COORD, Math.max(ZL2_LIMITS.MIN_COORD, val))
  }

  private convertVisibilityType(fclType?: string): 'always' | 'in_game' | 'in_menu' {
    switch (fclType) {
      case 'IN_GAME': return 'in_game'
      case 'MENU': return 'in_menu'
      default: return 'always'
    }
  }

  private convertButtonEvents(event: FCLButton['event']): ZL2ClickEvent[] {
    const events: ZL2ClickEvent[] = []

    if (!event) return events

    const eventTypes = [
      { data: event.pressEvent, priority: 1 },
      { data: event.clickEvent, priority: 2 },
      { data: event.longPressEvent, priority: 3 },
      { data: event.doubleClickEvent, priority: 4 }
    ]

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

    const eventData = selectedEvent

    if (eventData.outputKeycodes && eventData.outputKeycodes.length > 0) {
      eventData.outputKeycodes.forEach(keycode => {
        const glfwKey = this.convertKeycode(keycode)
        if (glfwKey) {
          events.push({
            type: glfwKey.startsWith('launcher.event.') ? 'launcher_event' : 'key',
            key: glfwKey
          })
        } else {
          console.warn(`[FCL→ZL2] Unknown keycode: ${keycode}, skipping`)
        }
      })
    }

    if (eventData.input || eventData.quickInput) {
      events.push({
        type: 'launcher_event',
        key: FCL_SPECIAL_EVENTS.switch_ime
      })
    }

    if (eventData.outputText && eventData.outputText.trim()) {
      events.push({
        type: 'send_text',
        key: eventData.outputText
      })
    }

    if (eventData.bindViewGroup && eventData.bindViewGroup.length > 0) {
      eventData.bindViewGroup.forEach(groupId => {
        const zl2LayerUuid = this.layerMap.get(groupId)
        if (zl2LayerUuid) {
          events.push({ type: 'switch_layer', key: zl2LayerUuid })
        } else {
          console.warn(`[FCL→ZL2] Layer mapping not found for group ID: ${groupId}`)
          events.push({ type: 'switch_layer', key: groupId })
        }
      })
    }

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
      const baseInfo = dir.baseInfo || {}
      const dirEvent = dir.event || {} as FCLDirection['event']

      const centerX = this.clampCoord(Math.round((baseInfo.xPosition || 500) * 10))
      const centerY = this.clampCoord(Math.round((baseInfo.yPosition || 800) * 10))

      let btnSize = 1380
      if (baseInfo.sizeType !== 'ABSOLUTE' && baseInfo.percentageWidth?.size) {
        btnSize = Math.max(ZL2_LIMITS.MIN_PERCENTAGE, Math.round(baseInfo.percentageWidth.size * 10 / 3))
      }
      btnSize = Math.min(btnSize, 2000)

      const offset = Math.round(btnSize * 1.05)

      const rawUp: number[] = Array.isArray(dirEvent.upKeycode) ? dirEvent.upKeycode : [dirEvent.upKeycode || 17]
      const rawDown: number[] = Array.isArray(dirEvent.downKeycode) ? dirEvent.downKeycode : [dirEvent.downKeycode || 31]
      const rawLeft: number[] = Array.isArray(dirEvent.leftKeycode) ? dirEvent.leftKeycode : [dirEvent.leftKeycode || 30]
      const rawRight: number[] = Array.isArray(dirEvent.rightKeycode) ? dirEvent.rightKeycode : [dirEvent.rightKeycode || 32]

      const moveButtons: Array<{ text: string; dx: number; dy: number; keys: number[]; style: string }> = [
        { text: '\u25E4', dx: -offset, dy: -offset, keys: [...rawUp, ...rawLeft], style: 'topstart' },
        { text: '\u25B2', dx: 0, dy: -offset, keys: rawUp, style: 'default' },
        { text: '\u25E7', dx: offset, dy: -offset, keys: [...rawUp, ...rawRight], style: 'topend' },
        { text: '\u25C0', dx: -offset, dy: 0, keys: rawLeft, style: 'default' },
        { text: '', dx: 0, dy: 0, keys: [] as number[], style: 'default' },
        { text: '\u25B6', dx: offset, dy: 0, keys: rawRight, style: 'default' },
        { text: '\u25E3', dx: -offset, dy: offset, keys: [...rawDown, ...rawLeft], style: 'bottomstart' },
        { text: '\u25BC', dx: 0, dy: offset, keys: rawDown, style: 'default' },
        { text: '\u25E2', dx: offset, dy: offset, keys: [...rawDown, ...rawRight], style: 'bottomend' },
      ]

      moveButtons.forEach(btnDef => {
        const pos = {
          x: this.clampCoord(centerX + btnDef.dx),
          y: this.clampCoord(centerY + btnDef.dy)
        }

        buttons.push({
          text: this.createTranslatableString(btnDef.text),
          uuid: this.generateUUID(),
          position: pos,
          buttonSize: {
            type: 'percentage',
            widthDp: 50.0,
            heightDp: 50.0,
            widthPercentage: btnSize,
            heightPercentage: btnSize,
            widthReference: 'screen_height',
            heightReference: 'screen_height'
          },
          buttonStyle: btnDef.style,
          textAlignment: 'Center',
          textBold: false,
          textItalic: false,
          textUnderline: false,
          visibilityType: this.convertVisibilityType(baseInfo.visibilityType),
          clickEvents: btnDef.keys.map(key => ({
            type: 'key' as const,
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

    this.addDefaultZL2Styles(styles)

    ;(fcl.buttonStyles || []).forEach(style => {
      const uuid = this.generateUUID()
      this.styleMap.set(style.name, uuid)

      styles.push({
        name: style.name,
        uuid: uuid,
        animateSwap: false,
        commonStyle: false,
        lightStyle: this.convertStyleConfig(style),
        darkStyle: this.convertStyleConfig(style)
      })
    })

    return styles
  }

  private addDefaultZL2Styles(styles: ZL2ButtonStyle[]): void {
    const defaultStyles = [
      { name: 'topend', uuid: '21b054786830', br: { topStart: 0.0, topEnd: 40.0, bottomEnd: 0.0, bottomStart: 0.0 } },
      { name: 'topstart', uuid: '43f4fb63f80a', br: { topStart: 40.0, topEnd: 0.0, bottomEnd: 0.0, bottomStart: 0.0 } },
      { name: 'bottomend', uuid: '0fa337d97f90', br: { topStart: 0.0, topEnd: 0.0, bottomEnd: 40.0, bottomStart: 0.0 } },
      { name: 'bottomstart', uuid: 'a5824dc0029d', br: { topStart: 0.0, topEnd: 0.0, bottomEnd: 0.0, bottomStart: 40.0 } },
      { name: 'end', uuid: 'd8cd25b80d5d', br: { topStart: 0.0, topEnd: 40.0, bottomEnd: 40.0, bottomStart: 0.0 } },
      { name: 'start', uuid: 'ea3ab7bc621f', br: { topStart: 40.0, topEnd: 0.0, bottomEnd: 0.0, bottomStart: 40.0 } },
      { name: 'rounded', uuid: 'cac8c754ffa0', br: { topStart: 40.0, topEnd: 40.0, bottomEnd: 40.0, bottomStart: 40.0 } },
      { name: 'default', uuid: 'd1096cf91caa', br: { topStart: 0.0, topEnd: 0.0, bottomEnd: 0.0, bottomStart: 0.0 } },
    ]

    defaultStyles.forEach(s => {
      const baseStyle = {
        alpha: this.clamp(1.0, ZL2_LIMITS.ALPHA.MIN, ZL2_LIMITS.ALPHA.MAX),
        pressedAlpha: this.clamp(1.0, ZL2_LIMITS.ALPHA.MIN, ZL2_LIMITS.ALPHA.MAX),
        backgroundColor: SAFE_ZL2_COLORS.TRANSPARENT_BLACK,
        pressedBackgroundColor: SAFE_ZL2_COLORS.GRAY,
        contentColor: SAFE_ZL2_COLORS.WHITE,
        pressedContentColor: SAFE_ZL2_COLORS.WHITE,
        fontSize: null,
        pressedFontSize: null,
        borderWidth: this.clamp(0, ZL2_LIMITS.BORDER_WIDTH.MIN, ZL2_LIMITS.BORDER_WIDTH.MAX),
        pressedBorderWidth: this.clamp(0, ZL2_LIMITS.BORDER_WIDTH.MIN, ZL2_LIMITS.BORDER_WIDTH.MAX),
        borderColor: SAFE_ZL2_COLORS.WHITE,
        pressedBorderColor: SAFE_ZL2_COLORS.WHITE,
        borderRadius: s.br,
        pressedBorderRadius: s.br
      }

      styles.push({
        name: s.name,
        uuid: s.uuid,
        animateSwap: false,
        commonStyle: false,
        lightStyle: baseStyle,
        darkStyle: baseStyle
      })

      this.styleMap.set(s.name, s.uuid)
    })
  }

  private convertStyleConfig(fclStyle: FCLButtonStyle): ZL2ButtonStyle['lightStyle'] {
    try {
      return {
        alpha: this.clamp(this.calculateAlpha(fclStyle.fillColor), ZL2_LIMITS.ALPHA.MIN, ZL2_LIMITS.ALPHA.MAX),
        pressedAlpha: this.clamp(this.calculateAlpha(fclStyle.fillColorPressed), ZL2_LIMITS.ALPHA.MIN, ZL2_LIMITS.ALPHA.MAX),
        backgroundColor: this.fclColorToZl2(fclStyle.fillColor ?? 0),
        pressedBackgroundColor: this.fclColorToZl2(fclStyle.fillColorPressed ?? 0),
        contentColor: this.fclColorToZl2(fclStyle.textColor ?? -1),
        pressedContentColor: this.fclColorToZl2(fclStyle.textColorPressed ?? -1),
        fontSize: fclStyle.textSize ? this.clamp(fclStyle.textSize, ZL2_LIMITS.FONT_SIZE.MIN, ZL2_LIMITS.FONT_SIZE.MAX) : null,
        pressedFontSize: fclStyle.textSizePressed ? this.clamp(fclStyle.textSizePressed, ZL2_LIMITS.FONT_SIZE.MIN, ZL2_LIMITS.FONT_SIZE.MAX) : null,
        borderWidth: this.clamp(Math.round((fclStyle.strokeWidth || 0) / 10), ZL2_LIMITS.BORDER_WIDTH.MIN, ZL2_LIMITS.BORDER_WIDTH.MAX),
        pressedBorderWidth: this.clamp(Math.round((fclStyle.strokeWidthPressed || 0) / 10), ZL2_LIMITS.BORDER_WIDTH.MIN, ZL2_LIMITS.BORDER_WIDTH.MAX),
        borderColor: this.fclColorToZl2(fclStyle.strokeColor ?? -12303292),
        pressedBorderColor: this.fclColorToZl2(fclStyle.strokeColorPressed ?? -12303292),
        borderRadius: {
          topStart: ((fclStyle.cornerRadius || 0) / 10),
          topEnd: ((fclStyle.cornerRadius || 0) / 10),
          bottomEnd: ((fclStyle.cornerRadius || 0) / 10),
          bottomStart: ((fclStyle.cornerRadius || 0) / 10)
        },
        pressedBorderRadius: {
          topStart: ((fclStyle.cornerRadiusPressed || 0) / 10),
          topEnd: ((fclStyle.cornerRadiusPressed || 0) / 10),
          bottomEnd: ((fclStyle.cornerRadiusPressed || 0) / 10),
          bottomStart: ((fclStyle.cornerRadiusPressed || 0) / 10)
        }
      }
    } catch (err) {
      console.warn('[FCL→ZL2] Style color conversion failed, using safe fallback:', err)
      return {
        alpha: 1.0,
        pressedAlpha: 1.0,
        backgroundColor: SAFE_ZL2_COLORS.TRANSPARENT_BLACK,
        pressedBackgroundColor: SAFE_ZL2_COLORS.GRAY,
        contentColor: SAFE_ZL2_COLORS.WHITE,
        pressedContentColor: SAFE_ZL2_COLORS.WHITE,
        fontSize: fclStyle.textSize ? this.clamp(fclStyle.textSize, ZL2_LIMITS.FONT_SIZE.MIN, ZL2_LIMITS.FONT_SIZE.MAX) : null,
        pressedFontSize: fclStyle.textSizePressed ? this.clamp(fclStyle.textSizePressed, ZL2_LIMITS.FONT_SIZE.MIN, ZL2_LIMITS.FONT_SIZE.MAX) : null,
        borderWidth: this.clamp(Math.round((fclStyle.strokeWidth || 0) / 10), ZL2_LIMITS.BORDER_WIDTH.MIN, ZL2_LIMITS.BORDER_WIDTH.MAX),
        pressedBorderWidth: this.clamp(Math.round((fclStyle.strokeWidthPressed || 0) / 10), ZL2_LIMITS.BORDER_WIDTH.MIN, ZL2_LIMITS.BORDER_WIDTH.MAX),
        borderColor: SAFE_ZL2_COLORS.WHITE,
        pressedBorderColor: SAFE_ZL2_COLORS.WHITE,
        borderRadius: { topStart: 0, topEnd: 0, bottomEnd: 0, bottomStart: 0 },
        pressedBorderRadius: { topStart: 0, topEnd: 0, bottomEnd: 0, bottomStart: 0 }
      }
    }
  }

  private fclColorToZl2(fclColor: number): string {
    try {
      const unsigned = fclColor >>> 0
      let longVal = BigInt(unsigned) << 32n
      if (longVal >= 0x8000000000000000n) {
        longVal = longVal - 0x10000000000000000n
      }
      return longVal.toString()
    } catch {
      return SAFE_ZL2_COLORS.WHITE
    }
  }

  private clamp(val: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, val))
  }

  private calculateAlpha(color: number): number {
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
