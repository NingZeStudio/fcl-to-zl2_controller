# FCL 控件系统开发文档

## 目录
1. [系统概述](#系统概述)
2. [数据结构总览](#数据结构总览)
3. [完整数据结构定义](#完整数据结构定义)
4. [FCL 键码映射表](#fcl-键码映射表)
5. [颜色值说明](#颜色值说明)
6. [坐标系与尺寸系统](#坐标系与尺寸系统)
7. [完整 JSON 示例](#完整-json-示例)

---

## 系统概述

FCL（Fold Craft Launcher）控件系统是一个用于在 Android 设备上模拟键盘鼠标操作的虚拟控制器系统，主要服务于 Minecraft 等 PC 游戏在移动端的操控需求。

### 核心组件层次

```
Controller (控制器)
├── buttonStyles: ControlButtonStyle[]     (按钮样式)
├── directionStyles: ControlDirectionStyle[] (方向键样式)
└── viewGroups: ControlViewGroup[]         (视图组)
    └── viewData: ViewData
        ├── buttonList: ControlButtonData[]  (按钮列表)
        └── directionList: ControlDirectionData[] (方向键列表)
```

### 版本常量

| 常量 | 值 | 说明 |
|------|---|------|
| CONTROLLER_VERSION | 21 | 当前控制器格式版本 |
| MIN_CONTROLLER_VERSION | 0 | 最低兼容版本 |

---

## 数据结构总览

### 1. Controller (控制器根对象)

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | String | 是 | 控制器ID (8位随机字符串) |
| name | String | 是 | 控制器名称 |
| version | String | 否 | 版本号 |
| versionCode | int | 否 | 版本代码 |
| author | String | 否 | 作者 |
| description | String | 否 | 描述 |
| controllerVersion | int | 是 | 控制器版本 (当前为21) |
| buttonStyles | Array | 是 | 按钮样式列表 |
| directionStyles | Array | 是 | 方向键样式列表 |
| viewGroups | Array | 是 | 视图组列表 |

---

## 完整数据结构定义

### 2. ControlViewGroup (视图组)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 视图组ID (UUID) |
| name | String | 视图组名称 |
| visibility | Visibility | 可见性: VISIBLE / INVISIBLE |
| viewData | ViewData | 视图数据 |

### 3. ViewData (视图数据)

| 字段 | 类型 | 说明 |
|------|------|------|
| buttonList | Array<ControlButtonData> | 按钮列表 |
| directionList | Array<ControlDirectionData> | 方向键列表 |

### 4. ControlButtonData (按钮数据)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 按钮ID (UUID) |
| text | String | 按钮显示文本 |
| style | String | 按钮样式名称 (引用 buttonStyles 中的 name) |
| baseInfo | BaseInfoData | 基础信息 |
| event | ButtonEventData | 事件配置 |

### 5. ControlDirectionData (方向键数据)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 方向键ID (UUID) |
| style | String | 方向键样式名称 (引用 directionStyles 中的 name) |
| baseInfo | BaseInfoData | 基础信息 |
| event | DirectionEventData | 事件配置 |

### 6. BaseInfoData (基础信息)

| 字段 | 类型 | 说明 |
|------|------|------|
| visibilityType | VisibilityType | 可见性类型 |
| xPosition | int | X坐标 (0-1000，实际值*10) |
| yPosition | int | Y坐标 (0-1000，实际值*10) |
| sizeType | SizeType | 尺寸类型: PERCENTAGE / ABSOLUTE |
| absoluteWidth | int | 绝对宽度 (DP) |
| absoluteHeight | int | 绝对高度 (DP) |
| percentageWidth | PercentageSize | 百分比宽度 |
| percentageHeight | PercentageSize | 百分比高度 |

**枚举值**:

```java
// VisibilityType - 可见性类型
ALWAYS,    // 始终显示
IN_GAME,   // 游戏中显示
MENU       // 菜单中显示

// SizeType - 尺寸类型
PERCENTAGE,  // 百分比尺寸
ABSOLUTE     // 绝对尺寸 (DP)

// PercentageSize.Reference - 百分比参考
SCREEN_WIDTH,   // 基于屏幕宽度
SCREEN_HEIGHT   // 基于屏幕高度
```

### 7. PercentageSize (百分比尺寸)

| 字段 | 类型 | 说明 |
|------|------|------|
| reference | Reference | 参考类型: SCREEN_WIDTH / SCREEN_HEIGHT |
| size | int | 尺寸值 (实际值*10) |

### 8. ButtonEventData (按钮事件数据)

| 字段 | 类型 | 说明 |
|------|------|------|
| pointerFollow | boolean | 指针跟随 |
| movable | boolean | 可移动 |
| pressEvent | Event | 按下事件 |
| longPressEvent | Event | 长按事件 |
| clickEvent | Event | 单击事件 |
| doubleClickEvent | Event | 双击事件 |

### 9. Event (事件详情)

| 字段 | 类型 | 说明 |
|------|------|------|
| autoKeep | boolean | 保持按下 (开关模式) |
| autoClick | boolean | 自动点击 |
| openMenu | boolean | 打开菜单 |
| switchTouchMode | boolean | 切换触摸模式 |
| switchMouseMode | boolean | 切换鼠标模式 |
| input | boolean | 输入文本 |
| quickInput | boolean | 快速输入 |
| outputText | String | 输出文本 |
| outputKeycodes | Array\<int\> | 输出键码列表 |
| bindViewGroup | Array\<String\> | 绑定视图组ID列表 |

### 10. DirectionEventData (方向键事件数据)

| 字段 | 类型 | 说明 |
|------|------|------|
| upKeycode | Array\<int\> | 上键码列表 |
| downKeycode | Array\<int\> | 下键码列表 |
| leftKeycode | Array\<int\> | 左键码列表 |
| rightKeycode | Array\<int\> | 右键码列表 |
| followOption | FollowOption | 跟随选项 |
| sneak | boolean | 双击中心启用潜行 |
| sneakKeycode | int | 潜行键码 |

**FollowOption 枚举**:
```java
FIXED,         // 固定
CENTER_FOLLOW,  // 中心跟随
FOLLOW          // 跟随
```

**默认值**:
```java
upKeycode = [17]       // KEY_W
downKeycode = [31]     // KEY_S
leftKeycode = [30]     // KEY_A
rightKeycode = [32]    // KEY_D
followOption = CENTER_FOLLOW
sneak = true
sneakKeycode = 42       // KEY_LEFTSHIFT
```

### 11. ControlButtonStyle (按钮样式)

| 字段 | 类型 | 说明 |
|------|------|------|
| name | String | 样式名称 |
| textColor | int | 文字颜色 (ARGB) |
| textSize | int | 文字大小 (sp) |
| strokeWidth | int | 边框宽度 (实际值*10) |
| strokeColor | int | 边框颜色 (ARGB) |
| cornerRadius | int | 圆角半径 (实际值*10) |
| fillColor | int | 填充颜色 (ARGB) |
| textColorPressed | int | 按下时文字颜色 |
| textSizePressed | int | 按下时文字大小 |
| strokeWidthPressed | int | 按下时边框宽度 |
| strokeColorPressed | int | 按下时边框颜色 |
| cornerRadiusPressed | int | 按下时圆角半径 |
| fillColorPressed | int | 按下时填充颜色 |

### 12. ControlDirectionStyle (方向键样式)

| 字段 | 类型 | 说明 |
|------|------|------|
| name | String | 样式名称 |
| styleType | Type | 类型: BUTTON / ROCKER |
| buttonStyle | ButtonStyle | 按钮样式 (8方向) |
| rockerStyle | RockerStyle | 摇杆样式 |

**Type 枚举**:
```java
BUTTON,   // 按钮式方向键
ROCKER    // 摇杆式方向键
```

### 13. ButtonStyle (方向键按钮样式)

| 字段 | 类型 | 说明 |
|------|------|------|
| interval | int | 按钮间隔 (实际值*10) |
| textColor | int | 文字颜色 |
| textSize | int | 文字大小 |
| strokeWidth | int | 边框宽度 |
| strokeColor | int | 边框颜色 |
| cornerRadius | int | 圆角半径 |
| fillColor | int | 填充颜色 |
| textColorPressed | int | 按下时文字颜色 |
| textSizePressed | int | 按下时文字大小 |
| strokeWidthPressed | int | 按下时边框宽度 |
| strokeColorPressed | int | 按下时边框颜色 |
| cornerRadiusPressed | int | 按下时圆角半径 |
| fillColorPressed | int | 按下时填充颜色 |

### 14. RockerStyle (摇杆样式)

| 字段 | 类型 | 说明 |
|------|------|------|
| rockerSize | int | 摇杆尺寸 (实际值*10, 100-900) |
| bgCornerRadius | int | 背景圆角 (实际值*10, 0-500) |
| bgStrokeWidth | int | 背景边框宽度 |
| bgStrokeColor | int | 背景边框颜色 |
| bgFillColor | int | 背景填充颜色 |
| rockerCornerRadius | int | 摇杆圆角 |
| rockerStrokeWidth | int | 摇杆边框宽度 |
| rockerStrokeColor | int | 摇杆边框颜色 |
| rockerFillColor | int | 摇杆填充颜色 |

---

## FCL 键码映射表

### 键盘键码 (FCLKeycodes)

| 键名 | 值 | 说明 |
|------|---|------|
| KEY_RESERVED | 0 | 保留 |
| KEY_ESC | 1 | 退出 |
| KEY_1 | 2 | 数字1 |
| KEY_2 | 3 | 数字2 |
| KEY_3 | 4 | 数字3 |
| KEY_4 | 5 | 数字4 |
| KEY_5 | 6 | 数字5 |
| KEY_6 | 7 | 数字6 |
| KEY_7 | 8 | 数字7 |
| KEY_8 | 9 | 数字8 |
| KEY_9 | 10 | 数字9 |
| KEY_0 | 11 | 数字0 |
| KEY_MINUS | 12 | 减号 |
| KEY_EQUAL | 13 | 等号 |
| KEY_BACKSPACE | 14 | 退格 |
| KEY_TAB | 15 | Tab |
| KEY_Q | 16 | Q |
| KEY_W | 17 | W |
| KEY_E | 18 | E |
| KEY_R | 19 | R |
| KEY_T | 20 | T |
| KEY_Y | 21 | Y |
| KEY_U | 22 | U |
| KEY_I | 23 | I |
| KEY_O | 24 | O |
| KEY_P | 25 | P |
| KEY_LEFTBRACE | 26 | 左括号 |
| KEY_RIGHTBRACE | 27 | 右括号 |
| KEY_ENTER | 28 | 回车 |
| KEY_LEFTCTRL | 29 | 左Ctrl |
| KEY_A | 30 | A |
| KEY_S | 31 | S |
| KEY_D | 32 | D |
| KEY_F | 33 | F |
| KEY_G | 34 | G |
| KEY_H | 35 | H |
| KEY_J | 36 | J |
| KEY_K | 37 | K |
| KEY_L | 38 | L |
| KEY_SEMICOLON | 39 | 分号 |
| KEY_APOSTROPHE | 40 | 单引号 |
| KEY_GRAVE | 41 | 重音 |
| KEY_LEFTSHIFT | 42 | 左Shift |
| KEY_BACKSLASH | 43 | 反斜杠 |
| KEY_Z | 44 | Z |
| KEY_X | 45 | X |
| KEY_C | 46 | C |
| KEY_V | 47 | V |
| KEY_B | 48 | B |
| KEY_N | 49 | N |
| KEY_M | 50 | M |
| KEY_COMMA | 51 | 逗号 |
| KEY_DOT | 52 | 句号 |
| KEY_SLASH | 53 | 斜杠 |
| KEY_RIGHTSHIFT | 54 | 右Shift |
| KEY_KPASTERISK | 55 | 数字键盘* |
| KEY_LEFTALT | 56 | 左Alt |
| KEY_SPACE | 57 | 空格 |
| KEY_CAPSLOCK | 58 | 大写锁定 |
| KEY_F1 | 59 | F1 |
| KEY_F2 | 60 | F2 |
| KEY_F3 | 61 | F3 |
| KEY_F4 | 62 | F4 |
| KEY_F5 | 63 | F5 |
| KEY_F6 | 64 | F6 |
| KEY_F7 | 65 | F7 |
| KEY_F8 | 66 | F8 |
| KEY_F9 | 67 | F9 |
| KEY_F10 | 68 | F10 |
| KEY_NUMLOCK | 69 | 数字锁定 |
| KEY_SCROLLLOCK | 70 | 滚动锁定 |
| KEY_KP7 | 71 | 数字键盘7 |
| KEY_KP8 | 72 | 数字键盘8 |
| KEY_KP9 | 73 | 数字键盘9 |
| KEY_KPMINUS | 74 | 数字键盘- |
| KEY_KP4 | 75 | 数字键盘4 |
| KEY_KP5 | 76 | 数字键盘5 |
| KEY_KP6 | 77 | 数字键盘6 |
| KEY_KPPLUS | 78 | 数字键盘+ |
| KEY_KP1 | 79 | 数字键盘1 |
| KEY_KP2 | 80 | 数字键盘2 |
| KEY_KP3 | 81 | 数字键盘3 |
| KEY_KP0 | 82 | 数字键盘0 |
| KEY_KPDOT | 83 | 数字键盘. |
| KEY_F11 | 87 | F11 |
| KEY_F12 | 88 | F12 |
| KEY_KPENTER | 96 | 数字键盘回车 |
| KEY_RIGHTCTRL | 97 | 右Ctrl |
| KEY_KPSLASH | 98 | 数字键盘/ |
| KEY_SYSRQ | 99 | 系统请求 |
| KEY_RIGHTALT | 100 | 右Alt |
| KEY_HOME | 102 | Home |
| KEY_UP | 103 | 上箭头 |
| KEY_PAGEUP | 104 | Page Up |
| KEY_LEFT | 105 | 左箭头 |
| KEY_RIGHT | 106 | 右箭头 |
| KEY_END | 107 | End |
| KEY_DOWN | 108 | 下箭头 |
| KEY_PAGEDOWN | 109 | Page Down |
| KEY_INSERT | 110 | 插入 |
| KEY_DELETE | 111 | 删除 |
| KEY_PAUSE | 119 | 暂停 |
| KEY_KPCOMMA | 121 | 数字键盘逗号 |
| KEY_LEFTMETA | 125 | 左Meta |
| KEY_RIGHTMETA | 126 | 右Meta |
| KEY_F13 | 183 | F13 |
| KEY_F14 | 184 | F14 |
| KEY_F15 | 185 | F15 |
| KEY_F16 | 186 | F16 |
| KEY_F17 | 187 | F17 |
| KEY_F18 | 188 | F18 |
| KEY_F19 | 189 | F19 |
| KEY_F20 | 190 | F20 |
| KEY_F21 | 191 | F21 |
| KEY_F22 | 192 | F22 |
| KEY_F23 | 193 | F23 |
| KEY_F24 | 194 | F24 |

### 鼠标键码

| 键名 | 值 | 说明 |
|------|---|------|
| MOUSE_LEFT | 1000 | 鼠标左键 |
| MOUSE_MIDDLE | 1001 | 鼠标中键 |
| MOUSE_RIGHT | 1002 | 鼠标右键 |
| MOUSE_SCROLL_UP | 1003 | 滚轮上 |
| MOUSE_SCROLL_DOWN | 1004 | 滚轮下 |

### 常用键码速查

| 功能 | 键码 |
|------|------|
| 移动 - W | 17 |
| 移动 - S | 31 |
| 移动 - A | 30 |
| 移动 - D | 32 |
| 跳跃 - 空格 | 57 |
| 潜行 - 左Shift | 42 |
| 攻击/使用 - 左键 | 1000 |
| 丢弃 - Q | 16 |
| 物品栏 - E | 18 |
| 聊天 - T | 20 |
| 暂停 - ESC | 1 |

---

## 颜色值说明

FCL 使用 Android `Color` 类颜色值 (32位有符号整数, ARGB格式)。

### ARGB 格式说明

```
ARGB = Alpha + Red + Green + Blue
A: 透明度 (00=完全透明, FF=完全不透明)
R: 红色分量 (00-FF)
G: 绿色分量 (00-FF)
B: 蓝色分量 (00-FF)

示例: 0xFFFFFFFF = Alpha:FF, R:FF, G:FF, B:FF = 白色
```

### 常用颜色常量

| 颜色名 | 值 | 十六进制 | 说明 |
|--------|---|----------|------|
| WHITE | -1 | 0xFFFFFFFF | 白色 |
| TRANSPARENT | 0 | 0x00000000 | 透明 |
| DKGRAY | -12303292 | 0xFF444444 | 深灰 |
| LTGRAY | -3355444 | 0xFFCCCCCC | 浅灰 |
| GRAY | -7829368 | 0xFF888888 | 灰色 |

### 颜色值转换

由于 JavaScript/TypeScript 中数字精度问题，FCL 颜色值在 JSON 中需要特别处理：

```javascript
// FCL 颜色值 (32位有符号整数)
const fclColor = -12303292;  // DKGRAY

// 转换为无符号32位
const unsigned = fclColor >>> 0;  // 4157045708

// 或直接使用字符串存储
const colorStr = "-12303292";
```

---

## 坐标系与尺寸系统

### FCL 坐标系统

- **范围**: 0-1000 (千分比)
- **编码方式**: 实际值 * 10 (如 500 表示 50%)

### 坐标计算公式

```
屏幕像素X = (xPosition / 10) * 屏幕宽度 / 100
屏幕像素Y = (yPosition / 10) * 屏幕高度 / 100
```

### 尺寸类型

#### 百分比尺寸 (PERCENTAGE)

```json
{
  "sizeType": "PERCENTAGE",
  "percentageWidth": {
    "reference": "SCREEN_HEIGHT",
    "size": 140
  },
  "percentageHeight": {
    "reference": "SCREEN_HEIGHT",
    "size": 140
  }
}
```

- `reference`: 参考尺寸类型
  - `SCREEN_WIDTH`: 基于屏幕宽度
  - `SCREEN_HEIGHT`: 基于屏幕高度
- `size`: 尺寸值 (实际值*10)

#### 绝对尺寸 (ABSOLUTE)

```json
{
  "sizeType": "ABSOLUTE",
  "absoluteWidth": 50,
  "absoluteHeight": 50
}
```

- 单位: DP (与屏幕密度无关)

### 尺寸编码说明

FCL 中某些尺寸字段使用"实际值 * 10"的编码方式：

| 字段 | JSON值 | 实际值 |
|------|--------|--------|
| xPosition | 500 | 50.0% |
| yPosition | 800 | 80.0% |
| strokeWidth | 10 | 1.0dp |
| cornerRadius | 100 | 10.0dp |
| percentageWidth.size | 140 | 14.0% |

---

## 完整 JSON 示例

参考文件: `FCL\src\main\assets\controllers\00000000.json`

```json
{
  "id": "00000000",
  "name": "Default",
  "version": "1.2.1",
  "versionCode": 1210,
  "author": "Tungsten",
  "description": "Default controller of Fold Craft Launcher.",
  "controllerVersion": 21,
  "buttonStyles": [
    {
      "name": "Default",
      "textColor": -1,
      "textSize": 12,
      "strokeColor": -12303292,
      "strokeWidth": 10,
      "cornerRadius": 100,
      "fillColor": 0,
      "textColorPressed": -1,
      "textSizePressed": 12,
      "strokeColorPressed": -12303292,
      "strokeWidthPressed": 10,
      "cornerRadiusPressed": 100,
      "fillColorPressed": -3355444
    }
  ],
  "directionStyles": [
    {
      "name": "Default",
      "styleType": "BUTTON",
      "buttonStyle": {
        "interval": 50,
        "textColor": -1,
        "textSize": 12,
        "strokeColor": -12303292,
        "strokeWidth": 10,
        "cornerRadius": 100,
        "fillColor": 0,
        "textColorPressed": -1,
        "textSizePressed": 12,
        "strokeColorPressed": -12303292,
        "strokeWidthPressed": 10,
        "cornerRadiusPressed": 100,
        "fillColorPressed": -3355444
      },
      "rockerStyle": {
        "rockerSize": 400,
        "bgCornerRadius": 500,
        "bgStrokeWidth": 20,
        "bgStrokeColor": -12303292,
        "bgFillColor": 0,
        "rockerCornerRadius": 500,
        "rockerStrokeWidth": 10,
        "rockerStrokeColor": -12303292,
        "rockerFillColor": -7829368
      }
    }
  ],
  "viewGroups": [
    {
      "id": "abe49027-5dac-4bb9-865a-dea564664654",
      "name": "Default",
      "visibility": "VISIBLE",
      "viewData": {
        "buttonList": [
          {
            "id": "f93bfc52-e745-4277-a4db-5c85829fb35e",
            "text": "x",
            "style": "Default",
            "baseInfo": {
              "visibilityType": "ALWAYS",
              "xPosition": 800,
              "yPosition": 750,
              "sizeType": "PERCENTAGE",
              "absoluteWidth": 50,
              "absoluteHeight": 50,
              "percentageWidth": {
                "reference": "SCREEN_HEIGHT",
                "size": 140
              },
              "percentageHeight": {
                "reference": "SCREEN_HEIGHT",
                "size": 140
              }
            },
            "event": {
              "pointerFollow": true,
              "Movable": false,
              "pressEvent": {
                "autoKeep": false,
                "autoClick": false,
                "openMenu": false,
                "switchTouchMode": false,
                "input": false,
                "quickInput": false,
                "outputText": "",
                "outputKeycodes": [1000],
                "bindViewGroup": []
              },
              "longPressEvent": {...},
              "clickEvent": {...},
              "doubleClickEvent": {...}
            }
          }
        ],
        "directionList": [
          {
            "id": "e8545a6e-3a35-4109-b2d5-9f17ff2babd0",
            "style": "Default",
            "baseInfo": {
              "visibilityType": "IN_GAME",
              "xPosition": 50,
              "yPosition": 900,
              "sizeType": "PERCENTAGE",
              "absoluteWidth": 50,
              "absoluteHeight": 50,
              "percentageWidth": {
                "reference": "SCREEN_HEIGHT",
                "size": 450
              },
              "percentageHeight": {
                "reference": "SCREEN_HEIGHT",
                "size": 450
              }
            },
            "event": {
              "upKeycode": [17],
              "downKeycode": [31],
              "leftKeycode": [30],
              "rightKeycode": [32],
              "followOption": "CENTER_FOLLOW",
              "sneak": true,
              "sneakKeycode": 42
            }
          }
        ]
      }
    }
  ]
}
```

---

## 文档信息

| 项目 | 值 |
|------|---|
| 版本 | 1.0 |
| 更新日期 | 2026-04-13 |
| 数据来源 | FoldCraftLauncher 源码分析 |
| 源码路径 | `e:\project\FoldCraftLauncher` |
