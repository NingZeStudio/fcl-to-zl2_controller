// FCL 键码到 GLFW 键码的映射
// 数据来源: FCL控件系统开发文档.md (FCL键码映射表) + ZL2键码映射文档 (GLFW键码表)

export const FCL_TO_GLFW_KEYMAP: Record<number, string> = {
  // ===== 保留/特殊键 =====
  0: 'KEY_RESERVED',

  // ===== 字母键 (FCL: 16-25 = Q-P, 30-44 = A-Z) =====
  16: 'GLFW_KEY_Q',
  17: 'GLFW_KEY_W',
  18: 'GLFW_KEY_E',
  19: 'GLFW_KEY_R',
  20: 'GLFW_KEY_T',
  21: 'GLFW_KEY_Y',
  22: 'GLFW_KEY_U',
  23: 'GLFW_KEY_I',
  24: 'GLFW_KEY_O',
  25: 'GLFW_KEY_P',
  30: 'GLFW_KEY_A',
  31: 'GLFW_KEY_S',
  32: 'GLFW_KEY_D',
  33: 'GLFW_KEY_F',
  34: 'GLFW_KEY_G',
  35: 'GLFW_KEY_H',
  36: 'GLFW_KEY_J',
  37: 'GLFW_KEY_K',
  38: 'GLFW_KEY_L',
  44: 'GLFW_KEY_Z',
  45: 'GLFW_KEY_X',
  46: 'GLFW_KEY_C',
  47: 'GLFW_KEY_V',
  48: 'GLFW_KEY_B',
  49: 'GLFW_KEY_N',
  50: 'GLFW_KEY_M',

  // ===== 数字键 (FCL: 2-11 = 1-9,0) =====
  2: 'GLFW_KEY_1',
  3: 'GLFW_KEY_2',
  4: 'GLFW_KEY_3',
  5: 'GLFW_KEY_4',
  6: 'GLFW_KEY_5',
  7: 'GLFW_KEY_6',
  8: 'GLFW_KEY_7',
  9: 'GLFW_KEY_8',
  10: 'GLFW_KEY_9',
  11: 'GLFW_KEY_0',

  // ===== 标点符号键 =====
  12: 'GLFW_KEY_MINUS',
  13: 'GLFW_KEY_EQUAL',
  26: 'GLFW_KEY_LEFT_BRACKET',
  27: 'GLFW_KEY_RIGHT_BRACKET',
  39: 'GLFW_KEY_SEMICOLON',
  40: 'GLFW_KEY_APOSTROPHE',
  41: 'GLFW_KEY_GRAVE_ACCENT',
  43: 'GLFW_KEY_BACKSLASH',
  51: 'GLFW_KEY_COMMA',
  52: 'GLFW_KEY_PERIOD',
  53: 'GLFW_KEY_SLASH',

  // ===== 功能/编辑键 =====
  1: 'GLFW_KEY_ESCAPE',
  14: 'GLFW_KEY_BACKSPACE',
  15: 'GLFW_KEY_TAB',
  28: 'GLFW_KEY_ENTER',
  57: 'GLFW_KEY_SPACE',
  58: 'GLFW_KEY_CAPS_LOCK',

  // ===== 方向/导航键 =====
  102: 'GLFW_KEY_HOME',
  103: 'GLFW_KEY_UP',
  104: 'GLFW_KEY_PAGE_UP',
  105: 'GLFW_KEY_LEFT',
  106: 'GLFW_KEY_RIGHT',
  107: 'GLFW_KEY_END',
  108: 'GLFW_KEY_DOWN',
  109: 'GLFW_KEY_PAGE_DOWN',
  110: 'GLFW_KEY_INSERT',
  111: 'GLFW_KEY_DELETE',
  119: 'GLFW_KEY_PAUSE',

  // ===== 修饰键 =====
  29: 'GLFW_KEY_LEFT_CONTROL',
  42: 'GLFW_KEY_LEFT_SHIFT',
  56: 'GLFW_KEY_LEFT_ALT',
  54: 'GLFW_KEY_RIGHT_SHIFT',
  97: 'GLFW_KEY_RIGHT_CONTROL',
  100: 'GLFW_KEY_RIGHT_ALT',
  125: 'GLFW_KEY_LEFT_SUPER',
  126: 'GLFW_KEY_RIGHT_SUPER',
  121: 'GLFW_KEY_KP_COMMA',       // KEY_KPCOMMA

  // ===== F1-F12 功能键 =====
  59: 'GLFW_KEY_F1',
  60: 'GLFW_KEY_F2',
  61: 'GLFW_KEY_F3',
  62: 'GLFW_KEY_F4',
  63: 'GLFW_KEY_F5',
  64: 'GLFW_KEY_F6',
  65: 'GLFW_KEY_F7',
  66: 'GLFW_KEY_F8',
  67: 'GLFW_KEY_F9',
  68: 'GLFW_KEY_F10',
  87: 'GLFW_KEY_F11',
  88: 'GLFW_KEY_F12',

  // ===== F13-F24 功能键 =====
  183: 'GLFW_KEY_F13',
  184: 'GLFW_KEY_F14',
  185: 'GLFW_KEY_F15',
  186: 'GLFW_KEY_F16',
  187: 'GLFW_KEY_F17',
  188: 'GLFW_KEY_F18',
  189: 'GLFW_KEY_F19',
  190: 'GLFW_KEY_F20',
  191: 'GLFW_KEY_F21',
  192: 'GLFW_KEY_F22',
  193: 'GLFW_KEY_F23',
  194: 'GLFW_KEY_F24',

  // ===== 小键盘键 =====
  69: 'GLFW_KEY_NUM_LOCK',
  70: 'GLFW_KEY_SCROLL_LOCK',
  71: 'GLFW_KEY_KP_7',
  72: 'GLFW_KEY_KP_8',
  73: 'GLFW_KEY_KP_9',
  74: 'GLFW_KEY_KP_SUBTRACT',
  75: 'GLFW_KEY_KP_4',
  76: 'GLFW_KEY_KP_5',
  77: 'GLFW_KEY_KP_6',
  78: 'GLFW_KEY_KP_ADD',
  79: 'GLFW_KEY_KP_1',
  80: 'GLFW_KEY_KP_2',
  81: 'GLFW_KEY_KP_3',
  82: 'GLFW_KEY_KP_0',
  83: 'GLFW_KEY_KP_DECIMAL',
  96: 'GLFW_KEY_KP_ENTER',
  98: 'GLFW_KEY_KP_DIVIDE',
  99: 'GLFW_KEY_SYSRQ',
  55: 'GLFW_KEY_KP_MULTIPLY',

  // ===== 鼠标按键 (FCL 自定义范围 1000+) =====
  1000: 'GLFW_MOUSE_BUTTON_LEFT',
  1001: 'GLFW_MOUSE_BUTTON_MIDDLE',
  1002: 'GLFW_MOUSE_BUTTON_RIGHT',
  1003: 'launcher.event.scroll_up',
  1004: 'launcher.event.scroll_down',
}

// GLFW 字符串到 FCL 键码的反向映射（从正向映射自动生成）
export const GLFW_TO_FCL_KEYMAP: Record<string, number> = {}

Object.entries(FCL_TO_GLFW_KEYMAP).forEach(([fclKeyStr, glfwKey]) => {
  const fclKey = parseInt(fclKeyStr, 10)
  if (!GLFW_TO_FCL_KEYMAP[glfwKey]) {
    GLFW_TO_FCL_KEYMAP[glfwKey] = fclKey
  }
})

// FCL 特殊事件到 ZL2 启动器事件的映射
export const FCL_SPECIAL_EVENTS: Record<string, string> = {
  'switch_ime': 'launcher.event.switch_ime',
  'switch_menu': 'launcher.event.switch_menu',
  'switch_touch_mode': 'launcher.event.switch_touch_mode',
  'open_menu': 'launcher.event.switch_menu',
}

// ZL2 启动器事件到 FCL 特殊事件的反向映射
export const ZL2_SPECIAL_TO_FCL_EVENTS: Record<string, string> = {}
Object.entries(FCL_SPECIAL_EVENTS).forEach(([fclEvent, zl2Event]) => {
  if (!ZL2_SPECIAL_TO_FCL_EVENTS[zl2Event]) {
    ZL2_SPECIAL_TO_FCL_EVENTS[zl2Event] = fclEvent
  }
})

// 安全的 ZL2 颜色值 (Compose Color Long)
// 注意：这些值必须作为字符串存储，因为 JavaScript Number 无法精确表示 64 位整数
export const SAFE_ZL2_COLORS = {
  TRANSPARENT_BLACK: '-9223372036854775808',
  GRAY: '-5510004026390872064',
  WHITE: '-4294967296',
}
