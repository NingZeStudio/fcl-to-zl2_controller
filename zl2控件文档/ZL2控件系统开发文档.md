# ZalithLauncher 2 (ZL2) 控件系统开发文档

## ⚠️ 重要警告

**在开始之前，请务必阅读以下内容：**

### 颜色值格式问题

ZL2控件系统使用Compose Color，其颜色值格式非常特殊。**错误的颜色值会导致应用崩溃！**

**✅ 正确做法**：
- 只使用附录B中列出的安全颜色值
- 从默认布局或示例文件复制颜色值
- 使用ZL2编辑器的可视化颜色选择器

**❌ 错误做法**：
- 使用在线颜色转换工具生成的值
- 使用标准的ARGB十六进制值（如0xFF000000）
- 自己编造Long数值

**崩溃示例**：
```
java.lang.ArrayIndexOutOfBoundsException: length=20; index=63
at androidx.compose.ui.graphics.Color.getColorSpace-impl
```

如果看到这个错误，说明你使用了错误的颜色值。请参考附录B的安全颜色列表。

---

## 目录
1. [系统概述](#系统概述)
2. [控制模式](#控制模式)
3. [JSON配置结构](#json配置结构)
4. [核心数据结构](#核心数据结构)
5. [事件系统](#事件系统)
6. [样式系统](#样式系统)
7. [开发示例](#开发示例)

---

## 系统概述

ZL2控件系统是一个基于**分层架构**的虚拟控制系统，用于在Android设备上模拟键盘、鼠标操作来控制Minecraft游戏。

### 核心特性
- **分层管理**：支持多个控件层（Layer），每层可独立显示/隐藏
- **灵活布局**：支持绝对定位、百分比定位、自适应大小
- **多种控制模式**：滑动控制、点击控制、物理鼠标控制
- **事件系统**：支持键盘事件、鼠标事件、启动器事件、层级切换
- **样式系统**：支持亮色/暗色主题，可自定义按钮外观
- **国际化支持**：控件文本支持多语言匹配

### 架构组成
```
ZalithLauncher/
├── game/control/          # 控件管理核心
│   ├── ControlData.kt     # 控件数据封装
│   └── ControlManager.kt  # 控件管理器
├── ui/control/            # UI控制层
│   ├── mouse/             # 鼠标控制
│   ├── gamepad/           # 手柄支持
│   └── event/             # 事件处理
└── LayerController/       # 控件系统核心模块
    ├── layout/            # 布局定义
    ├── data/              # 数据结构
    └── event/             # 事件定义
```

---

## 控制模式

### 1. 鼠标控制模式 (MouseControlMode)

#### SLIDE（滑动控制）
- 手指在屏幕上滑动，虚拟鼠标指针跟随移动
- 灵敏度可调：`cursorSensitivity`（默认100%）
- 支持虚拟鼠标点击：`enableMouseClick`

#### CLICK（点击控制）
- 手指点击位置即为鼠标指针位置
- 可选隐藏鼠标指针：`hideMouseInClickMode`
- 适合精确点击操作

#### 物理鼠标模式
- 检测物理鼠标连接：`PhysicalMouseChecker.physicalMouseConnected`
- 支持鼠标抓取模式：`requestPointerCapture`
- 自动切换虚拟/物理鼠标显示

### 2. 虚拟鼠标指针类型 (CursorShape)
```kotlin
enum class CursorShape {
    Arrow,        // 箭头（默认）
    IBeam,        // 文本输入光标
    Hand,         // 手形（链接）
    CrossHair,    // 十字准星
    ResizeNS,     // 上下调整大小
    ResizeEW,     // 左右调整大小
    ResizeAll,    // 全方向调整
    NotAllowed    // 禁止操作
}
```

每种指针类型都有对应的图片文件和热点配置：
- `default_pointer.image` - 箭头指针
- `link_pointer.image` - 手形指针
- `ibeam_pointer.image` - 输入光标
- `crosshair_pointer.image` - 十字准星
- `resize_NS_pointer.image` - 上下调整
- `resize_EW_pointer.image` - 左右调整
- `resize_ALL_pointer.image` - 全方向调整
- `not_allowed_pointer.image` - 禁止操作

---

## JSON配置结构

### 完整配置示例

```json
{
  "info": {
    "name": {
      "default": "default",
      "matchQueue": [
        {
          "language_tag": "zh-CN",
          "value": "默认"
        }
      ]
    },
    "author": {
      "default": "MovTery",
      "matchQueue": []
    },
    "description": {
      "default": "",
      "matchQueue": []
    },
    "versionCode": 0,
    "versionName": "1.0"
  },
  "layers": [
    {
      "name": "gui",
      "uuid": "6df122c8cbf3",
      "hide": false,
      "hideWhenMouse": true,
      "hideWhenGamepad": true,
      "visibilityType": "always",
      "normalButtons": [
        {
          "text": {
            "default": "GUI",
            "matchQueue": []
          },
          "uuid": "166b980299c8420ab8",
          "position": {
            "x": 10000,
            "y": 0
          },
          "buttonSize": {
            "type": "percentage",
            "widthDp": 50.0,
            "heightDp": 50.0,
            "widthPercentage": 2289,
            "heightPercentage": 1100,
            "widthReference": "screen_height",
            "heightReference": "screen_height"
          },
          "buttonStyle": "cac8c754ffa0",
          "visibilityType": "always",
          "clickEvents": [
            {
              "type": "switch_layer",
              "key": "b7859a69d0d3"
            }
          ],
          "isSwipple": false,
          "isPenetrable": false,
          "isToggleable": false
        }
      ],
      "textBoxes": []
    }
  ],
  "styles": [
    {
      "name": "rounded",
      "uuid": "cac8c754ffa0",
      "animateSwap": false,
      "lightStyle": {
        "alpha": 1.0,
        "pressedAlpha": 1.0,
        "backgroundColor": -9223372036854775808,
        "pressedBackgroundColor": -5510004026390872064,
        "contentColor": -4294967296,
        "pressedContentColor": -4294967296,
        "fontSize": null,
        "pressedFontSize": null,
        "borderWidth": 0,
        "pressedBorderWidth": 0,
        "borderColor": -4294967296,
        "pressedBorderColor": -4294967296,
        "borderRadius": {
          "topStart": 40.0,
          "topEnd": 40.0,
          "bottomEnd": 40.0,
          "bottomStart": 40.0
        },
        "pressedBorderRadius": {
          "topStart": 40.0,
          "topEnd": 40.0,
          "bottomEnd": 40.0,
          "bottomStart": 40.0
        }
      },
      "darkStyle": { /* 同lightStyle */ }
    }
  ],
  "editorVersion": 4
}
```

### 配置字段详解

#### 1. info（布局信息）

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | TranslatableString | 布局名称（支持多语言） |
| `author` | TranslatableString | 作者名称 |
| `description` | TranslatableString | 布局描述 |
| `versionCode` | Int | 版本号（数字） |
| `versionName` | String | 版本名称（字符串） |

#### 2. layers（控件层）
| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | String | 层级名称 |
| `uuid` | String | 唯一标识符 |
| `hide` | Boolean | 是否隐藏该层 |
| `hideWhenMouse` | Boolean | 物理鼠标连接时是否隐藏 |
| `hideWhenGamepad` | Boolean | 手柄连接时是否隐藏 |
| `visibilityType` | VisibilityType | 可见场景类型 |
| `normalButtons` | List<NormalData> | 普通按钮列表 |
| `textBoxes` | List<TextData> | 文本框列表 |

**visibilityType 可选值：**
- `"always"` - 始终显示
- `"in_game"` - 仅在游戏中显示（鼠标被捕获时）
- `"in_menu"` - 仅在菜单中显示（鼠标释放时）

#### 3. normalButtons（普通按钮）
| 字段 | 类型 | 说明 |
|------|------|------|
| `text` | TranslatableString | 按钮显示文本 |
| `uuid` | String | 按钮唯一标识符 |
| `position` | ButtonPosition | 按钮位置 |
| `buttonSize` | ButtonSize | 按钮大小 |
| `buttonStyle` | String? | 样式UUID（null使用默认样式） |
| `textAlignment` | TextAlignment | 文本对齐方式 |
| `textBold` | Boolean | 文本是否加粗 |
| `textItalic` | Boolean | 文本是否斜体 |
| `textUnderline` | Boolean | 文本是否下划线 |
| `visibilityType` | VisibilityType | 按钮可见场景 |
| `clickEvents` | List<ClickEvent> | 点击事件列表 |
| `isSwipple` | Boolean | 是否支持滑动联动 |
| `isPenetrable` | Boolean | 是否允许触摸穿透 |
| `isToggleable` | Boolean | 是否为开关按钮 |

#### 4. position（按钮位置）
```json
{
  "x": 10000,  // X坐标（0-10000，表示0%-100%）
  "y": 0       // Y坐标（0-10000，表示0%-100%）
}
```
- 坐标系：左上角为原点(0,0)，右下角为(10000,10000)
- 单位：万分比（10000 = 100%）

#### 5. buttonSize（按钮大小）

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | String | 大小类型："dp"、"percentage"、"wrap_content" |
| `widthDp` | Float | DP绝对宽度（type=dp时使用） |
| `heightDp` | Float | DP绝对高度（type=dp时使用） |
| `widthPercentage` | Int | 百分比宽度（500-10000，表示5%-100%） |
| `heightPercentage` | Int | 百分比高度（500-10000，表示5%-100%） |
| `widthReference` | String | 宽度参考："screen_width"或"screen_height" |
| `heightReference` | String | 高度参考："screen_width"或"screen_height" |

**大小类型说明：**
- `"dp"` - 使用设备独立像素（绝对值）
- `"percentage"` - 使用百分比（相对屏幕尺寸）
- `"wrap_content"` - 自适应内容大小

**参考尺寸说明：**
- `"screen_width"` - 参考屏幕宽度
- `"screen_height"` - 参考屏幕高度（推荐，适配不同屏幕比例）

#### 6. clickEvents（点击事件）
| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | String | 事件类型 |
| `key` | String | 事件键值 |

**事件类型详解：**

##### a) `"key"` - 键盘按键事件
```json
{
  "type": "key",
  "key": "GLFW_KEY_W"
}
```
常用按键：
- 字母键：`GLFW_KEY_A` ~ `GLFW_KEY_Z`
- 数字键：`GLFW_KEY_0` ~ `GLFW_KEY_9`
- 功能键：`GLFW_KEY_F1` ~ `GLFW_KEY_F12`
- 特殊键：`GLFW_KEY_ESCAPE`, `GLFW_KEY_TAB`, `GLFW_KEY_SPACE`
- 修饰键：`GLFW_KEY_LEFT_SHIFT`, `GLFW_KEY_LEFT_CONTROL`, `GLFW_KEY_LEFT_ALT`

##### b) `"launcher_event"` - 启动器事件
```json
{
  "type": "launcher_event",
  "key": "launcher.event.switch_ime"
}
```
可用事件：
- `launcher.event.switch_ime` - 切换输入法
- `launcher.event.switch_menu` - 切换菜单
- `launcher.event.scroll_up` - 鼠标滚轮向上（长按持续）
- `launcher.event.scroll_up.single` - 鼠标滚轮向上（单次）
- `launcher.event.scroll_down` - 鼠标滚轮向下（长按持续）
- `launcher.event.scroll_down.single` - 鼠标滚轮向下（单次）
- `GLFW_MOUSE_BUTTON_LEFT` - 鼠标左键
- `GLFW_MOUSE_BUTTON_RIGHT` - 鼠标右键
- `GLFW_MOUSE_BUTTON_MIDDLE` - 鼠标中键

##### c) `"switch_layer"` - 切换层显示/隐藏
```json
{
  "type": "switch_layer",
  "key": "b7859a69d0d3"  // 目标层的UUID
}
```

##### d) `"show_layer"` - 强制显示层
```json
{
  "type": "show_layer",
  "key": "b7859a69d0d3"
}
```

##### e) `"hide_layer"` - 强制隐藏层
```json
{
  "type": "hide_layer",
  "key": "b7859a69d0d3"
}
```

##### f) `"send_text"` - 发送文本消息
```json
{
  "type": "send_text",
  "key": "Hello World!"
}
```
注意：每个按钮只能有一个有效的send_text事件

#### 7. styles（样式配置）

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | String | 样式名称 |
| `uuid` | String | 样式唯一标识符 |
| `animateSwap` | Boolean | 切换状态时是否启用动画 |
| `lightStyle` | StyleConfig | 亮色模式样式 |
| `darkStyle` | StyleConfig | 暗色模式样式 |

**StyleConfig 字段：**
| 字段 | 类型 | 范围 | 说明 |
|------|------|------|------|
| `alpha` | Float | 0.0-1.0 | 整体不透明度 |
| `pressedAlpha` | Float | 0.0-1.0 | 按下时不透明度 |
| `backgroundColor` | Long | - | 背景颜色（ARGB） |
| `pressedBackgroundColor` | Long | - | 按下时背景颜色 |
| `contentColor` | Long | - | 内容颜色（文字） |
| `pressedContentColor` | Long | - | 按下时内容颜色 |
| `fontSize` | Int? | 2-30 | 文字大小（null=默认） |
| `pressedFontSize` | Int? | 2-30 | 按下时文字大小 |
| `borderWidth` | Int | 0-50 | 边框宽度 |
| `pressedBorderWidth` | Int | 0-50 | 按下时边框宽度 |
| `borderColor` | Long | - | 边框颜色 |
| `pressedBorderColor` | Long | - | 按下时边框颜色 |
| `borderRadius` | ButtonShape | - | 圆角配置 |
| `pressedBorderRadius` | ButtonShape | - | 按下时圆角配置 |

**ButtonShape（圆角配置）：**
```json
{
  "topStart": 40.0,     // 左上角圆角半径
  "topEnd": 40.0,       // 右上角圆角半径
  "bottomEnd": 40.0,    // 右下角圆角半径
  "bottomStart": 40.0   // 左下角圆角半径
}
```

**颜色值说明：**
- 使用Long类型存储ARGB颜色（特殊格式，必须使用正确的值）
- 示例：`-9223372036854775808` = 半透明黑色（常用背景色）
- 示例：`-5510004026390872064` = 灰色（常用按下背景色）
- 示例：`-4294967296` = 白色（常用文字颜色）

**⚠️ 重要警告：颜色值格式**
- 颜色值必须使用Compose Color兼容的Long格式
- 不能随意使用其他Long值，否则会导致崩溃
- 建议直接复制默认布局中的颜色值
- 错误的颜色值会导致 `ArrayIndexOutOfBoundsException`

---

## 核心数据结构

### 1. ControlLayout（控制布局）
```kotlin
@Serializable
data class ControlLayout(
    val info: Info,                    // 布局信息
    val layers: List<ControlLayer>,    // 控件层列表
    val styles: List<ButtonStyle>,     // 样式列表
    val editorVersion: Int             // 编辑器版本
)
```

### 2. ControlLayer（控件层）
```kotlin
@Serializable
data class ControlLayer(
    val name: String,                  // 层名称
    val uuid: String,                  // 唯一标识
    val hide: Boolean,                 // 是否隐藏
    val hideWhenMouse: Boolean,        // 物理鼠标时隐藏
    val hideWhenGamepad: Boolean,      // 手柄时隐藏
    val visibilityType: VisibilityType,// 可见类型
    val normalButtons: List<NormalData>,// 按钮列表
    val textBoxes: List<TextData>      // 文本框列表
)
```

### 3. NormalData（按钮数据）
```kotlin
@Serializable
data class NormalData(
    val text: TranslatableString,      // 显示文本
    val uuid: String,                  // 唯一标识
    val position: ButtonPosition,      // 位置
    val buttonSize: ButtonSize,        // 大小
    val buttonStyle: String?,          // 样式UUID
    val textAlignment: TextAlignment,  // 文本对齐
    val textBold: Boolean,             // 加粗
    val textItalic: Boolean,           // 斜体
    val textUnderline: Boolean,        // 下划线
    val visibilityType: VisibilityType,// 可见类型
    val clickEvents: List<ClickEvent>, // 点击事件
    val isSwipple: Boolean,            // 滑动联动
    val isPenetrable: Boolean,         // 触摸穿透
    val isToggleable: Boolean          // 开关模式
)
```

### 4. ClickEvent（点击事件）
```kotlin
@Serializable
data class ClickEvent(
    val type: Type,    // 事件类型
    val key: String    // 事件键值
) {
    enum class Type {
        Key,           // 键盘按键
        LauncherEvent, // 启动器事件
        SwitchLayer,   // 切换层
        ShowLayer,     // 显示层
        HideLayer,     // 隐藏层
        SendText       // 发送文本
    }
}
```

---

## 事件系统

### 事件处理流程

```
用户点击按钮
    ↓
EventHandler处理
    ↓
根据ClickEvent.type分发
    ↓
┌─────────────┬──────────────┬──────────────┬──────────────┐
│   Key事件   │ Launcher事件 │  Layer事件   │  Text事件    │
└─────────────┴──────────────┴──────────────┴──────────────┘
      ↓              ↓              ↓              ↓
  lwjglEvent()  launcherEvent() 层级显示/隐藏  发送聊天消息
      ↓              ↓
CallbackBridge   启动器功能
      ↓
  游戏接收输入
```

### LWJGL事件处理
```kotlin
fun lwjglEvent(
    eventKey: String,      // 按键代码（如"GLFW_KEY_W"）
    isMouse: Boolean,      // 是否为鼠标事件
    isPressed: Boolean     // 是否按下（true=按下，false=释放）
) {
    val keycode = ControlEventKeycode.getKeycodeFromEvent(eventKey)?.toInt() ?: return
    
    if (isMouse) {
        CallbackBridge.sendMouseButton(keycode, isPressed)
    } else {
        CallbackBridge.sendKeyPress(keycode, CallbackBridge.getCurrentMods(), isPressed)
        CallbackBridge.setModifiers(keycode, isPressed)
    }
}
```

### 启动器事件处理
```kotlin
fun launcherEvent(
    eventKey: String,
    isPressed: Boolean,
    onSwitchIME: () -> Unit,           // 切换输入法
    onSwitchMenu: () -> Unit,          // 切换菜单
    onSingleScrollUp: () -> Unit,      // 单次滚轮向上
    onSingleScrollDown: () -> Unit,    // 单次滚轮向下
    onLongScrollUp: () -> Unit,        // 长按滚轮向上
    onLongScrollUpCancel: () -> Unit,  // 取消长按向上
    onLongScrollDown: () -> Unit,      // 长按滚轮向下
    onLongScrollDownCancel: () -> Unit // 取消长按向下
)
```

---

## 样式系统

### 样式继承关系
```
DefaultStyleConfig（默认样式配置）
    ↓
DefaultStyle（默认样式）
    ↓
自定义ButtonStyle
    ↓
应用到NormalData.buttonStyle
```

### 样式应用逻辑
1. 按钮查找样式UUID：`data.buttonStyle`
2. 在`allStyles`列表中匹配UUID
3. 未找到则使用`DefaultObservableButtonStyle`
4. 根据系统主题选择`lightStyle`或`darkStyle`
5. 根据按钮状态选择普通/按下样式

### 动画过渡
当`animateSwap = true`时，按钮状态切换会有动画效果：
- 颜色渐变
- 大小变化
- 圆角变化

---

## 开发示例

### 示例1：创建一个简单的WASD移动按钮组
```json
{
  "name": "move",
  "uuid": "befebb63d5bf",
  "hide": false,
  "visibilityType": "in_game",
  "normalButtons": [
    {
      "text": {"default": "W", "matchQueue": []},
      "uuid": "d619389a54c2492da5",
      "position": {"x": 1474, "y": 5410},
      "buttonSize": {
        "type": "percentage",
        "widthPercentage": 1380,
        "heightPercentage": 1380,
        "widthReference": "screen_height",
        "heightReference": "screen_height"
      },
      "buttonStyle": "d1096cf91caa",
      "visibilityType": "always",
      "clickEvents": [
        {"type": "key", "key": "GLFW_KEY_W"}
      ],
      "isSwipple": true,
      "isPenetrable": false,
      "isToggleable": false
    }
  ]
}
```

### 示例2：创建一个多功能GUI按钮
```json
{
  "text": {"default": "GUI", "matchQueue": []},
  "uuid": "166b980299c8420ab8",
  "position": {"x": 10000, "y": 0},
  "buttonSize": {
    "type": "percentage",
    "widthPercentage": 2289,
    "heightPercentage": 1100,
    "widthReference": "screen_height",
    "heightReference": "screen_height"
  },
  "clickEvents": [
    {"type": "switch_layer", "key": "layer1_uuid"},
    {"type": "switch_layer", "key": "layer2_uuid"},
    {"type": "switch_layer", "key": "layer3_uuid"}
  ],
  "isSwipple": false,
  "isPenetrable": false,
  "isToggleable": false
}
```

### 示例3：创建一个开关按钮（Shift疾跑）

```json
{
  "text": {"default": "□", "matchQueue": []},
  "uuid": "53bea7b9f6974f6b9a",
  "position": {"x": 7590, "y": 7080},
  "buttonSize": {
    "type": "percentage",
    "widthPercentage": 2150,
    "heightPercentage": 1380,
    "widthReference": "screen_height",
    "heightReference": "screen_height"
  },
  "buttonStyle": "a5824dc0029d",
  "visibilityType": "always",
  "clickEvents": [
    {"type": "key", "key": "GLFW_KEY_LEFT_SHIFT"}
  ],
  "isSwipple": false,
  "isPenetrable": false,
  "isToggleable": true
}
```
注意：`isToggleable: true` 使按钮变为开关模式，点击后保持按下状态

### 示例4：创建自定义样式
```json
{
  "name": "my_custom_style",
  "uuid": "abc123def456",
  "animateSwap": true,
  "lightStyle": {
    "alpha": 0.9,
    "pressedAlpha": 1.0,
    "backgroundColor": -9223372036854775808,
    "pressedBackgroundColor": -5510004026390872064,
    "contentColor": -4294967296,
    "pressedContentColor": -1,
    "fontSize": 16,
    "pressedFontSize": 18,
    "borderWidth": 2,
    "pressedBorderWidth": 4,
    "borderColor": -16776961,
    "pressedBorderColor": -65536,
    "borderRadius": {
      "topStart": 20.0,
      "topEnd": 20.0,
      "bottomEnd": 20.0,
      "bottomStart": 20.0
    },
    "pressedBorderRadius": {
      "topStart": 10.0,
      "topEnd": 10.0,
      "bottomEnd": 10.0,
      "bottomStart": 10.0
    }
  },
  "darkStyle": { /* 同上 */ }
}
```

### 示例5：多语言支持
```json
{
  "text": {
    "default": "Inventory",
    "matchQueue": [
      {"language_tag": "zh-CN", "value": "背包"},
      {"language_tag": "zh-TW", "value": "背包"},
      {"language_tag": "ja", "value": "インベントリ"},
      {"language_tag": "es", "value": "Inventario"}
    ]
  }
}
```

---

## 控件管理器使用

### 加载控件布局
```kotlin
// 从文件加载
val layout = loadLayoutFromFile(file)

// 从字符串加载
val layout = loadLayoutFromString(jsonString)

// 不检查版本号加载（用于兼容旧版本）
val layout = loadLayoutFromFileUncheck(file)
```

### 控件管理器操作
```kotlin
// 刷新控件列表
ControlManager.refresh()

// 检查并解压默认控件
ControlManager.checkDefaultAndRefresh(context)

// 选择控件布局
ControlManager.selectControl(controlData)

// 删除控件布局
ControlManager.deleteControl(controlData)

// 保存控件布局
ControlManager.saveControl(controlData) { error ->
    // 处理错误
}

// 导入控件布局
ControlManager.importControl(
    inputStream = inputStream,
    onSerializationError = { error -> },
    catchedError = { error -> }
)

// 获取当前选中的布局
val selected = ControlManager.selectedLayout

// 监听布局列表变化
ControlManager.dataList.collect { list ->
    // 处理列表更新
}
```

---

## 高级特性

### 1. 滑动联动（isSwipple）
当`isSwipple = true`时，手指在按钮上滑动可以触发周围按钮的联动效果。

**应用场景：**
- 方向键：手指滑动可以从W滑到WA（同时按下W和A）
- 快捷栏：手指滑动切换物品栏

### 2. 触摸穿透（isPenetrable）
当`isPenetrable = true`时，触摸事件会向下传递到下层控件。

**应用场景：**
- 鼠标左右键按钮：允许在按钮上滑动鼠标指针
- 透明覆盖层：不阻挡下层控件的交互

### 3. 层级管理策略
```kotlin
// 层级显示优先级
visibilityType: VisibilityType  // 控件层级别
    ↓
hide: Boolean                   // 手动隐藏
    ↓
hideWhenMouse: Boolean          // 物理鼠标隐藏
    ↓
hideWhenGamepad: Boolean        // 手柄隐藏
    ↓
按钮级别 visibilityType         // 单个按钮可见性
```

### 4. 坐标系统详解
```
屏幕坐标系（万分比）：
(0,0)                    (10000,0)
  ┌─────────────────────────┐
  │                         │
  │      (5000,5000)        │
  │         中心点          │
  │                         │
  └─────────────────────────┘
(0,10000)              (10000,10000)

转换公式：
实际像素X = (position.x / 10000) * 屏幕宽度
实际像素Y = (position.y / 10000) * 屏幕高度
```

### 5. 按钮大小计算
```kotlin
// 百分比模式
when (widthReference) {
    ScreenWidth -> width = screenWidth * (widthPercentage / 10000f)
    ScreenHeight -> width = screenHeight * (widthPercentage / 10000f)
}

// DP模式
width = widthDp * density

// 自适应模式
width = measureText(text) + padding
```

---

## 最佳实践

### 1. 布局设计建议
- **使用百分比定位**：适配不同屏幕尺寸
- **参考屏幕高度**：保持按钮比例一致
- **合理分层**：将功能相关的按钮放在同一层
- **避免重叠**：除非使用`isPenetrable`
- **⚠️ 颜色值安全**：只使用验证过的颜色值，避免崩溃

### 2. 性能优化
- **减少层级数量**：过多层级影响渲染性能
- **合并相似按钮**：使用样式复用
- **按需显示**：使用`visibilityType`控制显示时机
- **避免过度动画**：`animateSwap`会增加CPU负担

### 3. 用户体验
- **按钮大小适中**：建议1200-1500（12%-15%屏幕高度）
- **间距合理**：避免误触
- **颜色对比明显**：确保可见性
- **提供视觉反馈**：使用`pressedBackgroundColor`

### 4. 调试技巧
```kotlin
// 打印控件信息
controlData.controlLayout.layers.forEach { layer ->
    println("Layer: ${layer.name}, Buttons: ${layer.normalButtons.size}")
}

// 检查样式是否存在
val styleExists = allStyles.any { it.uuid == buttonStyle }

// 验证坐标范围
require(position.x in 0..10000) { "X坐标超出范围" }
require(position.y in 0..10000) { "Y坐标超出范围" }

// 验证颜色值（导入前检查）
val safeColors = setOf(
    -9223372036854775808L,  // 半透明黑
    -5510004026390872064L,  // 灰色
    -4294967296L            // 白色
)
// 确保所有颜色值都在安全列表中
```

### 5. 安全的JSON编辑流程
1. **备份原文件**：修改前先备份
2. **小步修改**：每次只改一个地方
3. **立即测试**：改完立即导入测试
4. **使用模板**：从默认布局或示例文件复制
5. **验证颜色**：确保颜色值来自安全列表

---

## 常见问题

### Q1: 按钮不显示？
**检查项：**
1. `layer.hide` 是否为false
2. `visibilityType` 是否匹配当前场景
3. `buttonStyle` UUID是否存在于styles列表
4. 坐标是否在屏幕范围内（0-10000）

### Q2: 点击事件无响应？
**检查项：**
1. `clickEvents` 列表是否为空
2. 事件类型和key是否正确
3. 是否被上层按钮遮挡（检查`isPenetrable`）
4. 按钮是否在可见状态

### Q3: 样式不生效？
**检查项：**
1. `buttonStyle` UUID是否正确
2. 样式是否在`styles`列表中定义
3. 颜色值是否正确（Long类型）
4. 圆角半径是否合理（0-按钮尺寸的一半）

### Q4: 多语言不显示？
**检查项：**
1. `language_tag` 格式是否正确（如"zh-CN"）
2. `matchQueue` 是否包含目标语言
3. `default` 值是否设置（作为后备）

### Q5: 布局导入失败？
**可能原因：**
1. JSON格式错误
2. `editorVersion` 高于当前版本
3. 必填字段缺失
4. 数值超出范围
5. **颜色值格式错误**（最常见）

### Q6: 导入后崩溃，提示 ArrayIndexOutOfBoundsException？
**原因**：使用了错误的颜色值格式

**解决方法**：
1. 检查所有 `backgroundColor`、`contentColor`、`borderColor` 字段
2. 确保使用附录B中列出的安全颜色值
3. 不要使用自己编造的Long数值
4. 参考默认布局或修复后的示例文件

**错误示例**：
```json
"backgroundColor": -16776961,  // ❌ 错误！会导致崩溃
"contentColor": -1             // ❌ 错误！会导致崩溃
```

**正确示例**：
```json
"backgroundColor": -9223372036854775808,  // ✅ 正确
"contentColor": -4294967296               // ✅ 正确
```

---

## 版本兼容性

### 编辑器版本历史
- **Version 4**（当前）：完整功能支持
- **Version 3**：不支持`hideWhenMouse`和`hideWhenGamepad`
- **Version 2**：不支持文本样式（加粗、斜体、下划线）
- **Version 1**：基础功能

### 版本升级处理
```kotlin
// 系统会自动升级旧版本布局
if (version < EDITOR_VERSION) {
    layout = updateLayoutToNew(layout)
}
```

---

## 附录

### A. 完整的GLFW按键代码表
```
字母键：GLFW_KEY_A ~ GLFW_KEY_Z
数字键：GLFW_KEY_0 ~ GLFW_KEY_9
功能键：GLFW_KEY_F1 ~ GLFW_KEY_F12
方向键：GLFW_KEY_UP, GLFW_KEY_DOWN, GLFW_KEY_LEFT, GLFW_KEY_RIGHT
特殊键：
  GLFW_KEY_SPACE          空格
  GLFW_KEY_ESCAPE         ESC
  GLFW_KEY_ENTER          回车
  GLFW_KEY_TAB            Tab
  GLFW_KEY_BACKSPACE      退格
  GLFW_KEY_INSERT         Insert
  GLFW_KEY_DELETE         Delete
  GLFW_KEY_HOME           Home
  GLFW_KEY_END            End
  GLFW_KEY_PAGE_UP        PageUp
  GLFW_KEY_PAGE_DOWN      PageDown
修饰键：
  GLFW_KEY_LEFT_SHIFT     左Shift
  GLFW_KEY_RIGHT_SHIFT    右Shift
  GLFW_KEY_LEFT_CONTROL   左Ctrl
  GLFW_KEY_RIGHT_CONTROL  右Ctrl
  GLFW_KEY_LEFT_ALT       左Alt
  GLFW_KEY_RIGHT_ALT      右Alt
鼠标按键：
  GLFW_MOUSE_BUTTON_LEFT    左键
  GLFW_MOUSE_BUTTON_RIGHT   右键
  GLFW_MOUSE_BUTTON_MIDDLE  中键
```

### B. 安全的颜色值列表

**⚠️ 重要：请只使用以下经过验证的颜色值**

这些颜色值已在默认布局中验证，可以安全使用：

```json
// 背景颜色（常用）
-9223372036854775808    // 半透明黑色（最常用的背景色）
-5510004026390872064    // 灰色（常用的按下背景色）

// 文字/内容颜色
-4294967296             // 白色（最常用的文字颜色）

// 边框颜色
-4294967296             // 白色边框
```

**颜色值使用规则：**
1. ✅ **推荐**：直接复制默认布局中的颜色值
2. ✅ **安全**：使用上面列出的验证过的颜色值
3. ❌ **禁止**：随意编造Long数值
4. ❌ **禁止**：使用标准的ARGB十六进制值（如0xFF000000）

**为什么颜色值这么特殊？**
- Compose Color使用ULong内部表示，包含颜色空间信息
- 不是简单的ARGB值，而是编码后的特殊格式
- 错误的值会导致颜色空间索引越界，引发崩溃

**如果需要其他颜色怎么办？**
1. 在ZL2编辑器中创建样式，使用可视化颜色选择器
2. 导出布局后，复制生成的颜色值
3. 或者修改透明度（alpha字段）来调整现有颜色

### C. 文件路径
```
控件布局目录：PathManager.DIR_CONTROL_LAYOUTS
鼠标指针目录：PathManager.DIR_MOUSE_POINTER
默认布局：assets/default_layout.json
```

---

## 总结

ZL2控件系统是一个功能强大、高度可定制的虚拟控制方案。通过合理使用分层架构、事件系统和样式配置，可以为不同的游戏场景创建最适合的控制布局。

**核心要点：**
1. 使用百分比定位和大小，确保跨设备兼容
2. 合理组织控件层，提高管理效率
3. 充分利用事件系统，实现复杂交互
4. 自定义样式，提升视觉体验
5. 支持多语言，面向全球用户

**开发流程：**
1. 设计布局结构（层级划分）
2. 创建按钮和样式
3. 配置点击事件
4. 测试和调优
5. 导出JSON配置

祝开发顺利！
