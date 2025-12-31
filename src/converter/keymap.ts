// FCL 键码到 GLFW 键码的映射

export const FCL_TO_GLFW_KEYMAP: Record<number, string> = {
  // 字母键
  29: 'GLFW_KEY_A',
  48: 'GLFW_KEY_B',
  46: 'GLFW_KEY_C',
  32: 'GLFW_KEY_D',
  18: 'GLFW_KEY_E',
  33: 'GLFW_KEY_F',
  34: 'GLFW_KEY_G',
  35: 'GLFW_KEY_H',
  23: 'GLFW_KEY_I',
  36: 'GLFW_KEY_J',
  37: 'GLFW_KEY_K',
  38: 'GLFW_KEY_L',
  50: 'GLFW_KEY_M',
  49: 'GLFW_KEY_N',
  24: 'GLFW_KEY_O',
  25: 'GLFW_KEY_P',
  16: 'GLFW_KEY_Q',
  19: 'GLFW_KEY_R',
  31: 'GLFW_KEY_S',
  20: 'GLFW_KEY_T',
  22: 'GLFW_KEY_U',
  47: 'GLFW_KEY_V',
  17: 'GLFW_KEY_W',
  45: 'GLFW_KEY_X',
  21: 'GLFW_KEY_Y',
  44: 'GLFW_KEY_Z',

  // 数字键
  11: 'GLFW_KEY_0',
  2: 'GLFW_KEY_1',
  3: 'GLFW_KEY_2',
  4: 'GLFW_KEY_3',
  5: 'GLFW_KEY_4',
  6: 'GLFW_KEY_5',
  7: 'GLFW_KEY_6',
  8: 'GLFW_KEY_7',
  9: 'GLFW_KEY_8',
  10: 'GLFW_KEY_9',

  // 功能键
  1: 'GLFW_KEY_ESCAPE',
  28: 'GLFW_KEY_ENTER',
  57: 'GLFW_KEY_SPACE',
  15: 'GLFW_KEY_TAB',
  14: 'GLFW_KEY_BACKSPACE',
  42: 'GLFW_KEY_LEFT_SHIFT',
  54: 'GLFW_KEY_RIGHT_SHIFT',
  29: 'GLFW_KEY_LEFT_CONTROL',
  157: 'GLFW_KEY_RIGHT_CONTROL',
  56: 'GLFW_KEY_LEFT_ALT',
  184: 'GLFW_KEY_RIGHT_ALT',

  // 方向键
  200: 'GLFW_KEY_UP',
  208: 'GLFW_KEY_DOWN',
  203: 'GLFW_KEY_LEFT',
  205: 'GLFW_KEY_RIGHT',

  // F键
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

  // 鼠标按键
  1000: 'GLFW_MOUSE_BUTTON_LEFT',
  1001: 'GLFW_MOUSE_BUTTON_MIDDLE',
  1002: 'GLFW_MOUSE_BUTTON_RIGHT',
  1003: 'launcher.event.scroll_up',
  1004: 'launcher.event.scroll_down',
}

// FCL 特殊事件到 ZL2 启动器事件的映射
export const FCL_SPECIAL_EVENTS: Record<string, string> = {
  'switch_ime': 'launcher.event.switch_ime',
  'switch_menu': 'launcher.event.switch_menu',
  'switch_touch_mode': 'launcher.event.switch_menu',
  'open_menu': 'launcher.event.switch_menu',
}

// 安全的 ZL2 颜色值
// 注意：这些值必须作为字符串存储，因为 JavaScript Number 无法精确表示
export const SAFE_ZL2_COLORS = {
  TRANSPARENT_BLACK: '-9223372036854775808', // 0x8000000000000000
  GRAY: '-5510004026390872064',              // 0xB380808000000000
  WHITE: '-4294967296',                     // 0xFFFFFFFF00000000
  RED: '-4294967296',                       // 暂定红色，后续可按需调整
  GREEN: '-4294967296',                     // 暂定绿色
  BLUE: '-4294967296'                       // 暂定蓝色
}
