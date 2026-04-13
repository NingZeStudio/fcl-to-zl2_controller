# FCL控件系统开发文档收集计划

## 目标
从 FoldCraftLauncher 项目中收集 FCL 控件系统的完整开发文档，用于转换为 ZL2 控件。

## 数据来源
- 项目路径: `e:\project\FoldCraftLauncher`
- 核心数据类位置: `FCL\src\main\java\com\tungsten\fcl\control\data\`

---

## FCL 控件系统完整数据结构

### 1. 顶层结构 (Controller)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 控制器ID (8位随机字符串) |
| name | String | 控制器名称 |
| version | String | 版本号 |
| versionCode | int | 版本代码 |
| author | String | 作者 |
| description | String | 描述 |
| controllerVersion | int | 控制器版本 (当前为21) |
| buttonStyles | Array<ControlButtonStyle> | 按钮样式列表 |
| directionStyles | Array<ControlDirectionStyle> | 方向键样式列表 |
| viewGroups | Array<ControlViewGroup> | 视图组列表 |

**版本常量** (`Constants.java`):
- `CONTROLLER_VERSION = 21`
- `MIN_CONTROLLER_VERSION = 0`

---

### 2. 视图组 (ControlViewGroup)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 视图组ID (UUID) |
| name | String | 视图组名称 |
| visibility | Visibility | 可见性 (VISIBLE/INVISIBLE) |
| viewData | ViewData | 视图数据 |

**ViewData 内部结构**:

| 字段 | 类型 | 说明 |
|------|------|------|
| buttonList | Array<ControlButtonData> | 按钮列表 |
| directionList | Array<ControlDirectionData> | 方向键列表 |

---

### 3. 按钮数据 (ControlButtonData)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 按钮ID (UUID) |
| text | String | 按钮显示文本 |
| style | ControlButtonStyle | 按钮样式 (引用) |
| baseInfo | BaseInfoData | 基础信息 (位置/尺寸) |
| event | ButtonEventData | 事件配置 |

---

### 4. 方向键数据 (ControlDirectionData)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 方向键ID (UUID) |
| style | ControlDirectionStyle | 方向键样式 (引用) |
| baseInfo | BaseInfoData | 基础信息 (位置/尺寸) |
| event | DirectionEventData | 事件配置 |

---

### 5. 基础信息 (BaseInfoData)

| 字段 | 类型 | 说明 |
|------|------|------|
| visibilityType | VisibilityType | 可见性类型 |
| xPosition | int | X坐标 (实际值*10, 0-1000) |
| yPosition | int | Y坐标 (实际值*10, 0-1000) |
| sizeType | SizeType | 尺寸类型 (PERCENTAGE/ABSOLUTE) |
| absoluteWidth | int | 绝对宽度 (DP) |
| absoluteHeight | int | 绝对高度 (DP) |
| percentageWidth | PercentageSize | 百分比宽度 |
| percentageHeight | PercentageSize | 百分比高度 |

**枚举值**:

```java
// 可见性类型
enum VisibilityType {
    ALWAYS,      // 始终显示
    IN_GAME,     // 游戏中显示
    MENU         // 菜单中显示
}

// 尺寸类型
enum SizeType {
    PERCENTAGE,  // 百分比尺寸
    ABSOLUTE     // 绝对尺寸 (DP)
}

// 百分比参考
enum Reference {
    SCREEN_WIDTH,   // 基于屏幕宽度
    SCREEN_HEIGHT   // 基于屏幕高度
}
```

**PercentageSize 结构**:
| 字段 | 类型 | 说明 |
|------|------|------|
| reference | Reference | 参考类型 |
| size | int | 尺寸值 (实际值*10) |

---

### 6. 按钮样式 (ControlButtonStyle)

| 字段 | 类型 | 说明 |
|------|------|------|
| name | String | 样式名称 |
| textColor | int | 文字颜色 (ARGB) |
| textSize | int | 文字大小 |
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

**默认值**:
```java
DEFAULT_BUTTON_STYLE = new ControlButtonStyle("Default")
textColor = Color.WHITE (-1)
textSize = 12
strokeWidth = 10
strokeColor = Color.DKGRAY (-12303292)
cornerRadius = 100
fillColor = Color.TRANSPARENT (0)
textColorPressed = Color.WHITE (-1)
textSizePressed = 12
strokeWidthPressed = 10
strokeColorPressed = Color.DKGRAY (-12303292)
cornerRadiusPressed = 100
fillColorPressed = Color.LTGRAY (-3355444)
```

---

### 7. 方向键样式 (ControlDirectionStyle)

| 字段 | 类型 | 说明 |
|------|------|------|
| name | String | 样式名称 |
| styleType | Type | 类型 (BUTTON/ROCKER) |
| buttonStyle | ButtonStyle | 按钮样式 (8方向) |
| rockerStyle | RockerStyle | 摇杆样式 |

**ButtonStyle (方向键按钮)**:
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

**RockerStyle (摇杆)**:
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

### 8. 按钮事件数据 (ButtonEventData)

| 字段 | 类型 | 说明 |
|------|------|------|
| pointerFollow | boolean | 指针跟随 |
| movable | boolean | 可移动 |
| pressEvent | Event | 按下事件 |
| longPressEvent | Event | 长按事件 |
| clickEvent | Event | 单击事件 |
| doubleClickEvent | Event | 双击事件 |

---

### 9. Event 事件详情

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
| outputKeycodes | Array<int> | 输出键码列表 |
| bindViewGroup | Array<String> | 绑定视图组ID列表 |

---

### 10. 方向键事件数据 (DirectionEventData)

| 字段 | 类型 | 说明 |
|------|------|------|
| upKeycode | Array<int> | 上键码列表 |
| downKeycode | Array<int> | 下键码列表 |
| leftKeycode | Array<int> | 左键码列表 |
| rightKeycode | Array<int> | 右键码列表 |
| followOption | FollowOption | 跟随选项 |
| sneak | boolean | 双击中心下蹲 |
| sneakKeycode | int | 下蹲键码 |

**FollowOption 枚举**:
```java
enum FollowOption {
    FIXED,         // 固定
    CENTER_FOLLOW,  // 中心跟随
    FOLLOW          // 跟随
}
```

**默认值**:
```java
upKeycode = [KEY_W] (17)
downKeycode = [KEY_S] (31)
leftKeycode = [KEY_A] (30)
rightKeycode = [KEY_D] (32)
followOption = CENTER_FOLLOW
sneak = true
sneakKeycode = KEY_LEFTSHIFT (42)
```

---

### 11. FCL 键码定义 (FCLKeycodes)

| 键码 | 值 | 说明 |
|------|---|------|
| KEY_ESC | 1 | 退出 |
| KEY_1 - KEY_0 | 2-11 | 数字键 |
| KEY_MINUS | 12 | 减号 |
| KEY_EQUAL | 13 | 等号 |
| KEY_BACKSPACE | 14 | 退格 |
| KEY_TAB | 15 | Tab |
| KEY_Q - KEY_P | 16-25 | Q-P |
| KEY_LEFTBRACE | 26 | 左括号 |
| KEY_RIGHTBRACE | 27 | 右括号 |
| KEY_ENTER | 28 | 回车 |
| KEY_LEFTCTRL | 29 | 左Ctrl |
| KEY_A - KEY_L | 30-38 | A-L |
| KEY_SEMICOLON | 39 | 分号 |
| KEY_APOSTROPHE | 40 | 单引号 |
| KEY_GRAVE | 41 | 重音 |
| KEY_LEFTSHIFT | 42 | 左Shift |
| KEY_BACKSLASH | 43 | 反斜杠 |
| KEY_Z - KEY_M | 44-50 | Z-M |
| KEY_COMMA | 51 | 逗号 |
| KEY_DOT | 52 | 句号 |
| KEY_SLASH | 53 | 斜杠 |
| KEY_RIGHTSHIFT | 54 | 右Shift |
| KEY_KPASTERISK | 55 | 数字键盘* |
| KEY_LEFTALT | 56 | 左Alt |
| KEY_SPACE | 57 | 空格 |
| KEY_CAPSLOCK | 58 | 大写锁定 |
| KEY_F1 - KEY_F12 | 59-68 | 功能键 |
| KEY_NUMLOCK | 69 | 数字锁定 |
| KEY_SCROLLLOCK | 70 | 滚动锁定 |
| KEY_KP7 - KEY_KP0 | 71-82 | 数字键盘 |
| KEY_KPDOT | 83 | 数字键盘. |
| KEY_F11 - KEY_F24 | 87, 88, 183-194 | 扩展功能键 |
| KEY_KPENTER | 96 | 数字键盘回车 |
| KEY_RIGHTCTRL | 97 | 右Ctrl |
| KEY_KPSLASH | 98 | 数字键盘/ |
| KEY_SYSRQ | 99 | 系统请求 |
| KEY_RIGHTALT | 100 | 右Alt |
| KEY_HOME | 102 | Home |
| KEY_UP | 103 | 上 |
| KEY_PAGEUP | 104 | Page Up |
| KEY_LEFT | 105 | 左 |
| KEY_RIGHT | 106 | 右 |
| KEY_END | 107 | End |
| KEY_DOWN | 108 | 下 |
| KEY_PAGEDOWN | 109 | Page Down |
| KEY_INSERT | 110 | 插入 |
| KEY_DELETE | 111 | 删除 |
| KEY_PAUSE | 119 | 暂停 |
| KEY_KPCOMMA | 121 | 数字键盘逗号 |
| KEY_LEFTMETA | 125 | 左Meta |
| KEY_RIGHTMETA | 126 | 右Meta |

---

## 颜色值说明

FCL 使用 Android `Color` 类颜色 (32位有符号整数, ARGB格式):

| 颜色常量 | 值 | 说明 |
|----------|---|------|
| Color.WHITE | -1 | 白色 (0xFFFFFFFF) |
| Color.TRANSPARENT | 0 | 透明 (0x00000000) |
| Color.DKGRAY | -12303292 | 深灰 (0xFF444444) |
| Color.LTGRAY | -3355444 | 浅灰 (0xFFCCCCCC) |
| Color.GRAY | -7829368 | 灰色 (0xFF888888) |

---

## 坐标系说明

### FCL 坐标系统
- 范围: 0-1000 (千分比)
- 位置编码: 实际值 * 10 (如 500 表示 50%)
- 尺寸编码: 实际值 * 10 (如 140 表示 14%)

### 尺寸参考
- `SCREEN_WIDTH`: 基于屏幕宽度计算
- `SCREEN_HEIGHT`: 基于屏幕高度计算

---

## 示例控制器 JSON 结构

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
  "buttonStyles": [...],
  "directionStyles": [...],
  "viewGroups": [
    {
      "id": "<uuid>",
      "name": "Default",
      "visibility": "VISIBLE",
      "viewData": {
        "buttonList": [...],
        "directionList": [...]
      }
    }
  ]
}
```

---

## 实施步骤

1. 在 `e:\project\fcl-to-zl2_controller\.trae\documents\` 目录下创建 `FCL控件系统开发文档.md`
2. 将上述收集的完整数据结构写入文档
3. 文档应包含:
   - 完整的数据结构定义
   - 枚举值说明
   - 键码映射表
   - 颜色值常量
   - 坐标系说明
   - JSON 示例

---

## 文档维护

文档版本: 1.0
创建日期: 2026-04-13
数据来源: FoldCraftLauncher 源码分析
