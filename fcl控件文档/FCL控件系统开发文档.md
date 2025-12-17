# FCL 控件系统开发文档

## 目录
1. [系统架构概述](#系统架构概述)
2. [控件系统工作原理](#控件系统工作原理)
3. [JSON配置结构详解](#json配置结构详解)
4. [核心数据类详解](#核心数据类详解)
5. [事件处理机制](#事件处理机制)
6. [开发指南](#开发指南)

---

## 系统架构概述

FCL（Fold Craft Launcher）的控件系统是一个用于在Android设备上模拟键盘鼠标操作的虚拟控制器系统，主要用于在移动设备上玩Minecraft等PC游戏。

### 核心组件层次结构

```
Controller (控制器)
├── ViewGroup (视图组)
│   ├── ViewData (视图数据)
│   │   ├── ControlButtonData[] (按钮数据列表)
│   │   └── ControlDirectionData[] (方向键数据列表)
├── ButtonStyles[] (按钮样式集合)
└── DirectionStyles[] (方向键样式集合)
```

### 主要包结构

- `com.tungsten.fcl.setting` - 控制器配置和管理
- `com.tungsten.fcl.control.data` - 控件数据模型
- `com.tungsten.fcl.control.view` - 控件视图实现
- `com.tungsten.fcl.control` - 输入处理和事件管理

---

## 控件系统工作原理

### 1. 控制器加载流程

```
1. 从 FCLPath.CONTROLLER_DIR 读取 JSON 文件
2. 使用 Gson 反序列化为 Controller 对象
3. 检查控制器版本兼容性
4. 加载按钮和方向键样式
5. 初始化所有 ViewGroup
6. 渲染控件到游戏界面
```

### 2. 输入事件处理流程

```
用户触摸屏幕
    ↓
ControlButton/ControlDirection 捕获触摸事件
    ↓
根据 EventData 配置处理事件
    ↓
FCLInput 转换为游戏输入
    ↓
通过 FCLBridge 发送到游戏进程
    ↓
游戏接收键盘/鼠标事件
```

### 3. ViewManager 管理机制

ViewManager 负责：
- 初始化和销毁控件视图
- 管理控件的显示/隐藏状态
- 处理编辑模式和游戏模式的切换
- 保存控制器配置到磁盘

---

## JSON配置结构详解

### 完整的控制器JSON结构

```json
{
  "id": "abc12345",
  "name": "我的控制器",
  "version": "1.0.0",
  "versionCode": 1,
  "author": "作者名",
  "description": "控制器描述",
  "controllerVersion": 3,
  "buttonStyles": [
    {
      "name": "默认按钮样式",
      "textColor": -1,
      "textSize": 12,
      "strokeWidth": 10,
      "strokeColor": -12303292,
      "cornerRadius": 100,
      "fillColor": 0,
      "textColorPressed": -1,
      "textSizePressed": 12,
      "strokeWidthPressed": 10,
      "strokeColorPressedProperty": -12303292,
      "cornerRadiusPressed": 100,
      "fillColorPressed": -3355444
    }
  ],
  "directionStyles": [
    {
      "name": "默认方向键样式",
      "// 样式属性": "类似按钮样式"
    }
  ],
  "viewGroups": [
    {
      "id": "group-uuid-1",
      "name": "主控制组",
      "visibility": "VISIBLE",
      "viewData": {
        "buttonList": [],
        "directionList": []
      }
    }
  ]
}
```

### 字段说明

#### Controller 根对象

| 字段 | 类型 | 说明 |
|------|------|------|
| id | String | 控制器唯一标识符（8位随机字符串） |
| name | String | 控制器名称 |
| version | String | 版本号（语义化版本） |
| versionCode | Integer | 版本代码（整数，用于版本比较） |
| author | String | 作者名称 |
| description | String | 控制器描述 |
| controllerVersion | Integer | 控制器格式版本（当前为3） |
| buttonStyles | Array | 按钮样式数组 |
| directionStyles | Array | 方向键样式数组 |
| viewGroups | Array | 视图组数组 |

---

## 核心数据类详解

### 1. ControlViewGroup（视图组）

视图组是控件的容器，可以控制一组控件的显示/隐藏。

```java
public class ControlViewGroup {
    private String id;                    // 唯一标识
    private String name;                  // 组名
    private Visibility visibility;        // 初始可见性
    private ViewData viewData;            // 视图数据
}
```

**Visibility 枚举：**
- `VISIBLE` - 可见
- `INVISIBLE` - 不可见

**JSON示例：**
```json
{
  "id": "uuid-string",
  "name": "移动控制",
  "visibility": "VISIBLE",
  "viewData": {
    "buttonList": [...],
    "directionList": [...]
  }
}
```

### 2. ControlButtonData（按钮数据）

按钮是最基本的控件类型，可以模拟键盘按键或鼠标点击。

```java
public class ControlButtonData {
    private String id;                    // 唯一标识
    private String text;                  // 显示文本
    private ControlButtonStyle style;     // 按钮样式
    private BaseInfoData baseInfo;        // 基础信息（位置、大小）
    private ButtonEventData event;        // 事件数据
}
```

**JSON示例：**
```json
{
  "id": "button-uuid",
  "text": "W",
  "style": "默认样式",
  "baseInfo": {
    "visibilityType": "ALWAYS",
    "xPosition": 500,
    "yPosition": 800,
    "sizeType": "PERCENTAGE",
    "absoluteWidth": 50,
    "absoluteHeight": 50,
    "percentageWidth": {
      "reference": "SCREEN_WIDTH",
      "size": 50
    },
    "percentageHeight": {
      "reference": "SCREEN_WIDTH",
      "size": 50
    }
  },
  "event": {
    "pointerFollow": false,
    "Movable": false,
    "pressEvent": {...},
    "longPressEvent": {...},
    "clickEvent": {...},
    "doubleClickEvent": {...}
  }
}
```

### 3. BaseInfoData（基础信息）

控制控件的位置、大小和可见性。

**字段详解：**

| 字段 | 类型 | 说明 |
|------|------|------|
| visibilityType | Enum | 可见性类型：ALWAYS（总是）、IN_GAME（游戏中）、MENU（菜单中） |
| xPosition | Integer | X坐标（实际值的10倍，百分比） |
| yPosition | Integer | Y坐标（实际值的10倍，百分比） |
| sizeType | Enum | 尺寸类型：PERCENTAGE（百分比）、ABSOLUTE（绝对值） |
| absoluteWidth | Integer | 绝对宽度（dp单位） |
| absoluteHeight | Integer | 绝对高度（dp单位） |
| percentageWidth | Object | 百分比宽度配置 |
| percentageHeight | Object | 百分比高度配置 |

**PercentageSize 结构：**
```json
{
  "reference": "SCREEN_WIDTH",  // 参考：SCREEN_WIDTH 或 SCREEN_HEIGHT
  "size": 50                     // 大小（实际值的10倍）
}
```

**坐标和尺寸计算：**
- 位置坐标：`实际坐标 = (xPosition / 10) * 屏幕宽度 / 100`
- 百分比尺寸：`实际尺寸 = (size / 10) * 参考尺寸 / 100`
- 绝对尺寸：直接使用 dp 值

### 4. ButtonEventData（按钮事件）

定义按钮的交互行为。

**主要属性：**

| 属性 | 类型 | 说明 |
|------|------|------|
| pointerFollow | Boolean | 鼠标指针跟随 |
| Movable | Boolean | 是否可移动 |
| pressEvent | Event | 按下事件 |
| longPressEvent | Event | 长按事件 |
| clickEvent | Event | 点击事件 |
| doubleClickEvent | Event | 双击事件 |

**Event 对象结构：**

```json
{
  "autoKeep": false,           // 自动保持按下
  "autoClick": false,          // 自动连点
  "openMenu": false,           // 打开菜单
  "switchTouchMode": false,    // 切换触摸模式
  "switchMouseMode": false,    // 切换鼠标模式
  "input": false,              // 输入文字
  "quickInput": false,         // 快速输入
  "outputText": "",            // 输出文本
  "outputKeycodes": [17, 87],  // 输出键码数组
  "bindViewGroup": []          // 绑定视图组（切换显示）
}
```

**键码说明：**
- 使用 FCLKeycodes 定义的键码
- 常用键码：
  - `17` = W键
  - `31` = S键  
  - `29` = A键
  - `32` = D键
  - `57` = 空格
  - `42` = 左Shift
  - 鼠标：`1000`=左键, `1001`=中键, `1002`=右键

### 5. ControlDirectionData（方向键数据）

方向键控件，通常用于移动控制。

```java
public class ControlDirectionData {
    private String id;
    private ControlDirectionStyle style;
    private BaseInfoData baseInfo;
    private DirectionEventData event;
}
```

**JSON示例：**
```json
{
  "id": "direction-uuid",
  "style": "默认方向键样式",
  "baseInfo": {...},
  "event": {
    "upKeycode": 17,           // W键
    "downKeycode": 31,         // S键
    "leftKeycode": 29,         // A键
    "rightKeycode": 32,        // D键
    "followOption": "CENTER_FOLLOW",
    "sneak": true,
    "sneakKeycode": 42         // 左Shift
  }
}
```

**DirectionEventData 字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| upKeycode | Integer | 上方向键码 |
| downKeycode | Integer | 下方向键码 |
| leftKeycode | Integer | 左方向键码 |
| rightKeycode | Integer | 右方向键码 |
| followOption | Enum | 跟随选项：FIXED（固定）、CENTER_FOLLOW（中心跟随）、FOLLOW（完全跟随） |
| sneak | Boolean | 双击中心启用潜行 |
| sneakKeycode | Integer | 潜行键码 |

### 6. ControlButtonStyle（按钮样式）

定义按钮的视觉外观。

**完整样式配置：**

```json
{
  "name": "样式名称",
  "textColor": -1,              // 文字颜色（ARGB整数）
  "textSize": 12,               // 文字大小（sp）
  "strokeWidth": 10,            // 边框宽度（实际值的10倍）
  "strokeColor": -12303292,     // 边框颜色
  "cornerRadius": 100,          // 圆角半径（实际值的10倍）
  "fillColor": 0,               // 填充颜色
  "textColorPressed": -1,       // 按下时文字颜色
  "textSizePressed": 12,        // 按下时文字大小
  "strokeWidthPressed": 10,     // 按下时边框宽度
  "strokeColorPressed": -12303292,
  "cornerRadiusPressed": 100,
  "fillColorPressed": -3355444  // 按下时填充颜色
}
```

**颜色值说明：**
- 使用 Android Color 整数格式（ARGB）
- 常用颜色：
  - `-1` = 白色 (0xFFFFFFFF)
  - `0` = 透明 (0x00000000)
  - `-12303292` = 深灰色
  - `-3355444` = 浅灰色

---

## 事件处理机制

### 1. 触摸事件流程

```
用户触摸 ControlButton
    ↓
onTouchEvent() 捕获
    ↓
判断事件类型（按下/长按/点击/双击）
    ↓
读取对应的 Event 配置
    ↓
执行事件动作：
  - 发送键码 (outputKeycodes)
  - 输出文本 (outputText)
  - 切换视图组 (bindViewGroup)
  - 打开菜单 (openMenu)
  - 等等...
    ↓
FCLInput.sendKeyEvent()
    ↓
FCLBridge.pushEventKey()
    ↓
游戏接收输入
```

### 2. FCLInput 输入处理

FCLInput 是输入系统的核心，负责：

**键盘事件处理：**
```java
public void sendKeyEvent(int keycode, boolean press) {
    if (MOUSE_MAP.containsKey(keycode)) {
        // 鼠标按钮
        bridge.pushEventMouseButton(MOUSE_MAP.get(keycode), press);
    } else {
        // 键盘按键
        bridge.pushEventKey(keycode, 0, press);
    }
}
```

**鼠标移动处理：**
```java
public void setPointer(int x, int y) {
    // 更新光标位置
    menu.setPointerX(x);
    menu.setPointerY(y);
    // 发送到游戏
    bridge.pushEventPointer(
        (int)(x * bridge.getScaleFactor()), 
        (int)(y * bridge.getScaleFactor())
    );
}
```

### 3. 视图组切换

通过 `bindViewGroup` 可以实现控件的动态显示/隐藏：

```java
public void switchViewGroupVisibility(ControlViewGroup viewGroup) {
    // 遍历所有控件
    for (View view : baseLayout.getChildren()) {
        if (view instanceof CustomView) {
            // 检查是否属于该视图组
            if (viewGroup.contains(view)) {
                // 切换可见性
                ((CustomView) view).switchParentVisibility();
            }
        }
    }
}
```

---

## 开发指南

### 1. 创建新控制器

```java
// 创建控制器
Controller controller = new Controller("我的控制器");
controller.setVersion("1.0.0");
controller.setVersionCode(1);
controller.setAuthor("开发者");
controller.setDescription("控制器描述");

// 创建视图组
ControlViewGroup viewGroup = new ControlViewGroup(UUID.randomUUID().toString());
viewGroup.setName("主控制");
viewGroup.setVisibility(ControlViewGroup.Visibility.VISIBLE);

// 添加到控制器
controller.addViewGroup(viewGroup);

// 保存到磁盘
controller.saveToDisk();
```

### 2. 添加按钮

```java
// 创建按钮数据
ControlButtonData button = new ControlButtonData(UUID.randomUUID().toString());
button.setText("W");

// 设置位置和大小
BaseInfoData baseInfo = button.getBaseInfo();
baseInfo.setXPosition(500);  // 50.0%
baseInfo.setYPosition(800);  // 80.0%
baseInfo.setSizeType(BaseInfoData.SizeType.PERCENTAGE);
baseInfo.getPercentageWidth().setReference(BaseInfoData.PercentageSize.Reference.SCREEN_WIDTH);
baseInfo.getPercentageWidth().setSize(50);  // 5.0%

// 设置事件
ButtonEventData.Event pressEvent = button.getEvent().getPressEvent();
pressEvent.setAutoKeep(true);  // 按住时持续触发
pressEvent.getOutputKeycodesList().add(FCLKeycodes.KEY_W);

// 添加到视图组
viewGroup.getViewData().addButton(button);
```

### 3. 添加方向键

```java
// 创建方向键
ControlDirectionData direction = new ControlDirectionData(UUID.randomUUID().toString());

// 设置位置
BaseInfoData baseInfo = direction.getBaseInfo();
baseInfo.setXPosition(100);
baseInfo.setYPosition(800);

// 设置事件
DirectionEventData event = direction.getEvent();
event.setUpKeycode(FCLKeycodes.KEY_W);
event.setDownKeycode(FCLKeycodes.KEY_S);
event.setLeftKeycode(FCLKeycodes.KEY_A);
event.setRightKeycode(FCLKeycodes.KEY_D);
event.setFollowOption(DirectionEventData.FollowOption.CENTER_FOLLOW);
event.setSneak(true);
event.setSneakKeycode(FCLKeycodes.KEY_LEFTSHIFT);

// 添加到视图组
viewGroup.getViewData().addDirection(direction);
```

### 4. 自定义按钮样式

```java
// 创建样式
ControlButtonStyle style = new ControlButtonStyle("我的样式");
style.setTextColor(Color.WHITE);
style.setTextSize(14);
style.setStrokeWidth(15);  // 1.5dp
style.setStrokeColor(Color.DKGRAY);
style.setCornerRadius(50);  // 5dp
style.setFillColor(Color.TRANSPARENT);

// 按下状态
style.setTextColorPressed(Color.YELLOW);
style.setFillColorPressed(Color.LTGRAY);

// 添加到样式库
ButtonStyles.addStyle(style);

// 应用到按钮
button.setStyle(style);
```

### 5. 实现复杂事件

**示例：双击切换视图组**

```json
{
  "doubleClickEvent": {
    "bindViewGroup": ["group-id-1", "group-id-2"]
  }
}
```

**示例：长按输入文本**

```json
{
  "longPressEvent": {
    "outputText": "/gamemode creative"
  }
}
```

**示例：组合键**

```json
{
  "pressEvent": {
    "outputKeycodes": [42, 17]  // Shift + W
  }
}
```

### 6. 加载和使用控制器

```java
// 从文件加载
File file = new File(FCLPath.CONTROLLER_DIR, "controller.json");
String json = FileUtils.readText(file);
Controller controller = new GsonBuilder()
    .registerTypeAdapterFactory(new JavaFxPropertyTypeAdapterFactory(true, true))
    .create()
    .fromJson(json, Controller.class);

// 应用到游戏
gameMenu.setController(controller);

// 初始化视图
viewManager.initializeController();
```

### 7. 版本兼容性处理

```java
// 检查版本
if (controller.getControllerVersion() < Constants.MIN_CONTROLLER_VERSION) {
    // 不兼容
    Controller.showIncompatibleDialog(context, controller.getName());
} else if (controller.getControllerVersion() < Constants.CONTROLLER_VERSION) {
    // 需要升级
    Controller.showUpgradeDialog(context, controller.getName(), controller.getId());
}

// 升级控制器
controller.upgrade();
controller.saveToDisk();
```

### 8. 常用键码参考

```java
// 字母键
FCLKeycodes.KEY_A = 29
FCLKeycodes.KEY_W = 17
FCLKeycodes.KEY_S = 31
FCLKeycodes.KEY_D = 32

// 功能键
FCLKeycodes.KEY_SPACE = 57
FCLKeycodes.KEY_LEFTSHIFT = 42
FCLKeycodes.KEY_LEFTCTRL = 29
FCLKeycodes.KEY_ESC = 1
FCLKeycodes.KEY_ENTER = 28

// 鼠标
FCLInput.MOUSE_LEFT = 1000
FCLInput.MOUSE_MIDDLE = 1001
FCLInput.MOUSE_RIGHT = 1002
FCLInput.MOUSE_SCROLL_UP = 1003
FCLInput.MOUSE_SCROLL_DOWN = 1004
```

---

## 最佳实践

### 1. 性能优化

- 使用百分比尺寸而非绝对尺寸，适配不同屏幕
- 合理分组控件，避免单个视图组包含过多控件
- 使用样式复用，减少JSON文件大小

### 2. 用户体验

- 为不同游戏场景创建多个视图组
- 使用 `visibilityType` 控制控件在游戏/菜单中的显示
- 提供清晰的按钮文本标识

### 3. 调试技巧

- 使用编辑模式实时调整控件位置
- 通过日志查看键码输出：`Log.e("测试", keycode + "")`
- 测试不同屏幕尺寸和分辨率

### 4. 错误处理

```java
try {
    controller.saveToDisk();
} catch (IOException e) {
    Logging.LOG.log(Level.SEVERE, "Failed to save controller!", e);
    // 显示错误提示
}
```

---

## 附录

### A. 完整示例JSON

见下一部分...
