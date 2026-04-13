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
  ZL2TextBox
} from '@/types/zl2'
import { GLFW_TO_FCL_KEYMAP, ZL2_SPECIAL_TO_FCL_EVENTS } from './keymap'
import { ConversionError, ConversionErrorCode } from './errors'

export class ZL2ToFCLConverter {
  private styleIdMap: Map<string, string> = new Map()
  private viewGroupIdMap: Map<string, string> = new Map()

  convert(zl2Layout: ZL2ControlLayout): FCLController {
    try {
      this.styleIdMap.clear()
      this.viewGroupIdMap.clear()

      if (!zl2Layout.layers) {
        throw ConversionError.missingField('layers', 'ZL2ControlLayout')
      }

      this.initializeStyleMap(zl2Layout.styles)
      this.initializeViewGroupMap(zl2Layout.layers)

      const viewGroups = this.convertLayers(zl2Layout.layers)

      return {
        id: this.generateFclId(),
        name: zl2Layout.info?.name?.default || 'Converted',
        version: zl2Layout.info?.versionName || '1.0',
        versionCode: zl2Layout.info?.versionCode || 0,
        author: zl2Layout.info?.author?.default || '',
        description: zl2Layout.info?.description?.default || '',
        controllerVersion: 21,
        buttonStyles: this.convertStyles(zl2Layout.styles, zl2Layout.layers),
        directionStyles: [],
        viewGroups: viewGroups
      }
    } catch (err) {
      if (err instanceof ConversionError) throw err
      throw new ConversionError(
        `ZL2 to FCL conversion failed: ${(err as Error).message}`,
        ConversionErrorCode.INVALID_JSON,
        { originalError: err }
      )
    }
  }

  private initializeViewGroupMap(layers: ZL2Layer[] | undefined) {
    ;(layers || []).forEach(layer => {
      this.viewGroupIdMap.set(layer.uuid, this.generateFclId())
    })
  }

  private initializeStyleMap(zl2Styles: ZL2ButtonStyle[] | undefined) {
    const builtInStyles: Record<string, string> = {
      '21b054786830': '\u53f3\u4e0a\u5706\u89d2',
      '43f4fb63f80a': '\u5de6\u4e0a\u5706\u89d2',
      '0fa337d97f90': '\u53f3\u4e0b\u5706\u89d2',
      'a5824dc0029d': '\u5de6\u4e0b\u5706\u89d2',
      'd8cd25b80d5d': '\u53f3\u8fb9\u5706\u89d2',
      'ea3ab7bc621f': '\u5de6\u8fb9\u5706\u89d2',
      'cac8c754ffa0': '\u5168\u5706\u89d2',
      'd1096cf91caa': '\u9ed8\u8ba4\u6837\u5f0f'
    }

    Object.entries(builtInStyles).forEach(([uuid, name]) => {
      this.styleIdMap.set(uuid, name)
    })

    if (zl2Styles) {
      zl2Styles.forEach(style => {
        if (!builtInStyles[style.uuid]) {
          const name = style.name || `\u6837\u5f0f_${style.uuid.substring(0, 4)}`
          this.styleIdMap.set(style.uuid, name)
        }
      })
    }
  }

  private generateFclId(): string {
    return Math.random().toString(36).substring(2, 10)
  }

  private convertLayers(layers: ZL2Layer[] | undefined): FCLViewGroup[] {
    if (!layers) return []
    return layers.map(layer => ({
      id: this.viewGroupIdMap.get(layer.uuid) || this.generateFclId(),
      name: layer.name || 'Unnamed',
      visibility: layer.hide ? 'INVISIBLE' : 'VISIBLE' as const,
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
      text: `T:${zl2Text.text?.default || ''}`,
      style: this.getFclStyleName(zl2Text.buttonStyle),
      baseInfo: this.convertBaseInfo(zl2Text.position, zl2Text.buttonSize, zl2Text.visibilityType),
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
      text: zl2Btn.text?.default || '',
      style: this.getFclStyleName(zl2Btn.buttonStyle),
      baseInfo: this.convertBaseInfo(zl2Btn.position, zl2Btn.buttonSize, zl2Btn.visibilityType),
      event: this.convertEvents(zl2Btn)
    }
  }

  private getFclStyleName(zl2StyleId: string | null | undefined): string {
    if (!zl2StyleId) return '\u9ed8\u8ba4\u6837\u5f0f'
    return this.styleIdMap.get(zl2StyleId) || `\u6837\u5f0f_${zl2StyleId.substring(0, 4)}`
  }

  private convertBaseInfo(
    position: { x: number; y: number } | undefined,
    buttonSize: import('@/types/zl2').ZL2ButtonSize | undefined,
    visibilityType?: string
  ): FCLBaseInfo {
    const size = buttonSize || { type: 'percentage' as const, widthDp: 50, heightDp: 50, widthPercentage: 1400, heightPercentage: 1400, widthReference: 'screen_height' as const, heightReference: 'screen_height' as const }
    const pos = position || { x: 5000, y: 5000 }
    const baseInfo: FCLBaseInfo = {
      xPosition: Math.round(pos.x / 10),
      yPosition: Math.round(pos.y / 10),
      sizeType: size.type === 'dp' ? 'ABSOLUTE' : 'PERCENTAGE',
      visibilityType: this.convertVisibilityType(visibilityType)
    }

    if (size.type === 'dp') {
      baseInfo.absoluteWidth = size.widthDp || 50
      baseInfo.absoluteHeight = size.heightDp || 50
    } else {
      baseInfo.percentageWidth = {
        reference: size.widthReference === 'screen_width' ? 'SCREEN_WIDTH' : 'SCREEN_HEIGHT',
        size: Math.round((size.widthPercentage || 1400) / 10)
      }
      baseInfo.percentageHeight = {
        reference: size.heightReference === 'screen_width' ? 'SCREEN_WIDTH' : 'SCREEN_HEIGHT',
        size: Math.round((size.heightPercentage || 1400) / 10)
      }
    }

    return baseInfo
  }

  private convertVisibilityType(zl2Type?: string): 'ALWAYS' | 'IN_GAME' | 'MENU' {
    switch (zl2Type) {
      case 'in_game': return 'IN_GAME'
      case 'in_menu': return 'MENU'
      default: return 'ALWAYS'
    }
  }

  private convertEvents(zl2Btn: ZL2NormalButton): FCLButtonEvent {
    const pressEvent = this.createEmptyEvent()
    pressEvent.autoKeep = !!zl2Btn.isToggleable

    if (zl2Btn.clickEvents && Array.isArray(zl2Btn.clickEvents)) {
      zl2Btn.clickEvents.forEach(event => {
        switch (event.type) {
          case 'key':
            const fclKey = GLFW_TO_FCL_KEYMAP[event.key]
            if (fclKey !== undefined) {
              pressEvent.outputKeycodes.push(fclKey)
            } else {
              console.warn(`[ZL2→FCL] Unknown GLFW key: ${event.key}, skipping`)
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
              pressEvent.bindViewGroup.push(event.key)
            }
            break

          case 'show_layer':
          case 'hide_layer':
            const layerRef = this.viewGroupIdMap.get(event.key) || event.key
            if (!pressEvent.bindViewGroup.includes(layerRef)) {
              pressEvent.bindViewGroup.push(layerRef)
            }
            console.warn(`[ZL2→FCL] Event type '${event.type}' mapped to bindViewGroup (FCL has no native layer show/hide)`)
            break

          case 'send_text':
            pressEvent.outputText = event.key
            break

          default:
            console.warn(`[ZL2→FCL] Unknown click event type: ${event.type}`)
            break
        }
      })

      if (zl2Btn.textBold || zl2Btn.textItalic || zl2Btn.textUnderline) {
        console.warn(`[ZL2→FCL] Text formatting (bold/italic/underline) not supported in FCL, discarded for button "${zl2Btn.text?.default}"`)
      }
    }

    return {
      pressEvent,
      longPressEvent: this.createEmptyEvent(),
      clickEvent: this.createEmptyEvent(),
      doubleClickEvent: this.createEmptyEvent(),
      pointerFollow: !!zl2Btn.isPenetrable,
      Movable: false
    }
  }

  private handleLauncherEvent(zl2Event: string, eventData: FCLEvent): void {
    const fclSpecial = ZL2_SPECIAL_TO_FCL_EVENTS[zl2Event]
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
      const fclKey = GLFW_TO_FCL_KEYMAP[zl2Event]
      if (fclKey !== undefined) {
        eventData.outputKeycodes.push(fclKey)
      } else {
        console.warn(`[ZL2→FCL] Unhandled launcher event: ${zl2Event}`)
      }
    } else {
      console.warn(`[ZL2→FCL] Unknown launcher event: ${zl2Event}`)
    }
  }

  private convertStyles(zl2Styles: ZL2ButtonStyle[] | undefined, layers: ZL2Layer[] | undefined): FCLButtonStyle[] {
    const fclStyles: FCLButtonStyle[] = (zl2Styles || []).map(style => {
      const config = style.lightStyle || style.darkStyle
      if (!config) return this.createDefaultFclStyle(this.getFclStyleName(style.uuid))

      const avgBorderRadius = this.averageRadius(config.borderRadius)
      const avgPressedBorderRadius = this.averageRadius(config.pressedBorderRadius)

      return {
        name: this.getFclStyleName(style.uuid),
        textColor: this.zl2ColorToFcl(config.contentColor),
        textSize: config.fontSize || 12,
        strokeWidth: ((config.borderWidth || 0)) * 10,
        strokeColor: this.zl2ColorToFcl(config.borderColor),
        cornerRadius: Math.round(avgBorderRadius * 10),
        fillColor: this.zl2ColorToFcl(config.backgroundColor),
        textColorPressed: this.zl2ColorToFcl(config.pressedContentColor),
        textSizePressed: config.pressedFontSize || 12,
        strokeWidthPressed: ((config.pressedBorderWidth || 0)) * 10,
        strokeColorPressed: this.zl2ColorToFcl(config.pressedBorderColor),
        cornerRadiusPressed: Math.round(avgPressedBorderRadius * 10),
        fillColorPressed: this.zl2ColorToFcl(config.pressedBackgroundColor)
      }
    })

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

    referencedStyleNames.forEach(name => {
      if (!fclStyles.some(s => s.name === name)) {
        fclStyles.push(this.createDefaultFclStyle(name))
      }
    })

    if (!fclStyles.some(s => s.name === '\u9ed8\u8ba4\u6837\u5f0f')) {
      fclStyles.push(this.createDefaultFclStyle('\u9ed8\u8ba4\u6837\u5f0f'))
    }

    return fclStyles
  }

  private averageRadius(radius: { topStart: number; topEnd: number; bottomEnd: number; bottomStart: number } | null | undefined): number {
    if (!radius) return 0
    return (radius.topStart + radius.topEnd + radius.bottomEnd + radius.bottomStart) / 4
  }

  private createDefaultFclStyle(name: string): FCLButtonStyle {
    let cornerRadius = 10
    if (name.includes('\u5de6\u4e0a') || name.includes('\u53f3\u4e0a')) cornerRadius = 100
    if (name.includes('\u5706\u89d2')) cornerRadius = 100

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

  private zl2ColorToFcl(zl2Color: string | null | undefined): number {
    if (zl2Color === null || zl2Color === undefined) return -1
    try {
      const argb = BigInt(zl2Color) >> 32n
      return Number(BigInt.asIntN(32, argb))
    } catch (e) {
      console.warn(`[ZL2→FCL] Color conversion failed for value "${zl2Color}", falling back to white`, e)
      return -1
    }
  }
}
