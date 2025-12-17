# FCL 控件系统快速参考手册

## 一、JSON结构速查

### 1. 根对象 (Controller)
```json
{
  "id": "唯一ID",
  "name": "控制器名称",
  "version": "版本号",
  "versionCode": 版本代码(整数),
  "author": "作者",
  "description": "描述",
  "controllerVersion": 3,
  "buttonStyles": [],
  "directionStyles": [],
  "viewGroups": []
}
```

### 2. 视图组 (ViewGroup)
```json
{
  "id": "组ID",
  "name": "组名",
  "visibility": "VISIBLE|INVISIBLE",
  "viewData": {
    "buttonList": [],
    "directionList": []
  }
}
```

### 3. 按钮 (ControlButtonData)
```json
{
  "id": "按钮ID",
  "text": "显示文本",
  "style": "样式名称",
  "baseInfo": { /* 位置和大小 */ },
  "event": { /* 事件配置 */ }
}
```

### 4. 方向键 (ControlDirectionData)
```json
{
  "id": "方向键ID",
  "style": "样式名称",
  "baseInfo": { /* 位置和大小 */ },
  "event": {
    "upKeycode": 17,
    "downKeycode": 31,
    "leftKeycode": 29,
    "rightKeycode": 32,
    "followOption": "CENTER_FOLLOW",
    "sneak": true,
    "sneakKeycode": 42
  }
}
```

---

## 二、BaseInfoData 配置

### 位置配置
```json
{
  "xPosition": 500,  // X坐标 (实际值×10, 百分比)
  "yPosition": 800   // Y坐标 (实际值×10, 百分比)
}
```
**计算公式：** `实际坐标 = (值 / 10) * 屏幕尺寸 / 100`

### 尺寸配置

**百分比模式：**
```json
{
  "sizeType": "PERCENTAGE",
  "percentageWidth": {
    "reference": "SCREEN_WIDTH",  // 或 SCREEN_HEIGHT
    "size": 50  // 实际值×10
  },
  "percentageHeight": {
    "reference": "SCREEN_WIDTH",
    "size": 50
  }
}
```

**绝对值模式：**
```json
{
  "sizeType": "ABSOLUTE",
  "absoluteWidth": 50,   // dp单位
  "absoluteHeight": 50
}
```

### 可见性配置
```json
{
  "visibilityType": "ALWAYS"  // ALWAYS | IN_GAME | MENU
}
```

---

## 三、事件配置 (Event)

### 基础事件结构
```json
{
  "pressEvent": {},        // 按下事件
  "longPressEvent": {},    // 长按事件
  "clickEvent": {},        // 点击事件
  "doubleClickEvent": {}   // 双击事件
}
```

### Event 对象属性
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
  "outputKeycodes": [],        // 输出键码数组
  "bindViewGroup": []          // 绑定视图组ID数组
}
```

### 常用事件配置示例

**1. 简单按键（按下W键）**
```json
{
  "pressEvent": {
    "autoKeep": true,
    "outputKeycodes": [17]
  }
}
```

**2. 鼠标左键连点**
```json
{
  "pressEvent": {
    "autoClick": true,
    "outputKeycodes": [1000]
  }
}
```

**3. 组合键（Shift+W）**
```json
{
  "pressEvent": {
    "autoKeep": true,
    "outputKeycodes": [42, 17]
  }
}
```

**4. 切换视图组**
```json
{
  "clickEvent": {
    "bindViewGroup": ["group-id-1", "group-id-2"]
  }
}
```

**5. 输入命令**
```json
{
  "clickEvent": {
    "outputText": "/gamemode creative"
  }
}
```

**6. 打开菜单**
```json
{
  "clickEvent": {
    "openMenu": true
  }
}
```

---

## 四、常用键码表

### 字母键
| 键 | 键码 | 键 | 键码 | 键 | 键码 |
|----|------|----|----- |----|----- |
| A  | 29   | J  | 36   | S  | 31   |
| B  | 48   | K  | 37   | T  | 20   |
| C  | 46   | L  | 38   | U  | 22   |
| D  | 32   | M  | 50   | V  | 47   |
| E  | 18   | N  | 49   | W  | 17   |
| F  | 33   | O  | 24   | X  | 45   |
| G  | 34   | P  | 25   | Y  | 21   |
| H  | 35   | Q  | 16   | Z  | 44   |
| I  | 23   | R  | 19   |    |      |

### 数字键
| 键 | 键码 | 键 | 键码 |
|----|------|----|------|
| 0  | 11   | 5  | 6    |
| 1  | 2    | 6  | 7    |
| 2  | 3    | 7  | 8    |
| 3  | 4    | 8  | 9    |
| 4  | 5    | 9  | 10   |

### 功能键
| 键 | 键码 | 说明 |
|----|------|------|
| ESC | 1 | 退出键 |
| ENTER | 28 | 回车键 |
| SPACE | 57 | 空格键 |
| TAB | 15 | Tab键 |
| BACKSPACE | 14 | 退格键 |
| LEFT_SHIFT | 42 | 左Shift |
| RIGHT_SHIFT | 54 | 右Shift |
| LEFT_CTRL | 29 | 左Ctrl |
| RIGHT_CTRL | 157 | 右Ctrl |
| LEFT_ALT | 56 | 左Alt |
| RIGHT_ALT | 184 | 右Alt |

### 方向键
| 键 | 键码 |
|----|------|
| UP | 200 |
| DOWN | 208 |
| LEFT | 203 |
| RIGHT | 205 |

### F键
| 键 | 键码 | 键 | 键码 |
|----|------|----|------|
| F1 | 59 | F7 | 65 |
| F2 | 60 | F8 | 66 |
| F3 | 61 | F9 | 67 |
| F4 | 62 | F10 | 68 |
| F5 | 63 | F11 | 87 |
| F6 | 64 | F12 | 88 |

### 鼠标
| 操作 | 键码 |
|------|------|
| 左键 | 1000 |
| 中键 | 1001 |
| 右键 | 1002 |
| 滚轮上 | 1003 |
| 滚轮下 | 1004 |

---

## 五、样式配置

### 按钮样式 (ControlButtonStyle)
```json
{
  "name": "样式名称",
  "textColor": -1,              // 文字颜色
  "textSize": 12,               // 文字大小(sp)
  "strokeWidth": 10,            // 边框宽度(×10)
  "strokeColor": -12303292,     // 边框颜色
  "cornerRadius": 100,          // 圆角(×10)
  "fillColor": 0,               // 填充颜色
  "textColorPressed": -1,       // 按下时文字颜色
  "textSizePressed": 12,        // 按下时文字大小
  "strokeWidthPressed": 10,     // 按下时边框宽度
  "strokeColorPressed": -12303292,
  "cornerRadiusPressed": 100,
  "fillColorPressed": -3355444  // 按下时填充颜色
}
```

### 常用颜色值
| 颜色 | ARGB值 | 说明 |
|------|--------|------|
| 白色 | -1 | 0xFFFFFFFF |
| 黑色 | -16777216 | 0xFF000000 |
| 红色 | -65536 | 0xFFFF0000 |
| 绿色 | -16711936 | 0xFF00FF00 |
| 蓝色 | -16776961 | 0xFF0000FF |
| 透明 | 0 | 0x00000000 |
| 深灰 | -12303292 | 0xFF444444 |
| 浅灰 | -3355444 | 0xFFCCCCCC |
| 半透明白 | 1157627903 | 0x44FFFFFF |
| 半透明黑 | 1140850688 | 0x44000000 |

---

## 六、方向键配置

### FollowOption 选项
- `FIXED` - 固定位置，不跟随手指
- `CENTER_FOLLOW` - 中心跟随，摇杆中心跟随手指
- `FOLLOW` - 完全跟随，整个控件跟随手指

### 完整配置示例
```json
{
  "upKeycode": 17,              // W键
  "downKeycode": 31,            // S键
  "leftKeycode": 29,            // A键
  "rightKeycode": 32,           // D键
  "followOption": "CENTER_FOLLOW",
  "sneak": true,                // 启用潜行
  "sneakKeycode": 42            // Shift键
}
```

---

## 七、实用代码片段

### 1. 创建基础按钮
```java
ControlButtonData button = new ControlButtonData(UUID.randomUUID().toString());
button.setText("W");
button.getBaseInfo().setXPosition(500);
button.getBaseInfo().setYPosition(800);
button.getEvent().getPressEvent().setAutoKeep(true);
button.getEvent().getPressEvent().getOutputKeycodesList().add(17);
```

### 2. 创建方向键
```java
ControlDirectionData direction = new ControlDirectionData(UUID.randomUUID().toString());
direction.getBaseInfo().setXPosition(100);
direction.getBaseInfo().setYPosition(800);
direction.getEvent().setUpKeycode(17);
direction.getEvent().setDownKeycode(31);
direction.getEvent().setLeftKeycode(29);
direction.getEvent().setRightKeycode(32);
```

### 3. 保存控制器
```java
controller.saveToDisk();
```

### 4. 加载控制器
```java
File file = new File(FCLPath.CONTROLLER_DIR, "controller.json");
String json = FileUtils.readText(file);
Controller controller = new GsonBuilder()
    .registerTypeAdapterFactory(new JavaFxPropertyTypeAdapterFactory(true, true))
    .create()
    .fromJson(json, Controller.class);
```

---

## 八、常见问题

### Q1: 坐标和尺寸为什么要乘以10？
A: 为了支持小数精度，实际值 = JSON值 / 10。例如：500 表示 50.0%

### Q2: 如何实现组合键？
A: 在 `outputKeycodes` 数组中添加多个键码，例如 `[42, 17]` 表示 Shift+W

### Q3: 如何切换视图组？
A: 使用 `bindViewGroup` 属性，填入要切换的视图组ID数组

### Q4: 颜色值如何计算？
A: 使用 Android Color 类，或在线转换工具将 ARGB 转为整数

### Q5: 如何实现鼠标跟随？
A: 设置 `pointerFollow: true`，按钮会跟随鼠标指针移动

### Q6: 控制器版本不兼容怎么办？
A: 检查 `controllerVersion` 字段，当前版本为3，最低支持版本见 `Constants.MIN_CONTROLLER_VERSION`

---

## 九、调试技巧

### 1. 查看键码输出
```java
Log.e("键码", "keycode: " + keycode);
```

### 2. 测试按钮位置
在编辑模式下拖动按钮，实时查看坐标变化

### 3. 验证JSON格式
使用在线JSON验证工具检查语法错误

### 4. 检查样式引用
确保 `style` 字段引用的样式名称存在于 `buttonStyles` 或 `directionStyles` 中

---

## 十、最佳实践

1. **使用百分比尺寸** - 适配不同屏幕
2. **合理分组** - 按功能划分视图组
3. **样式复用** - 定义通用样式，减少重复
4. **命名规范** - 使用有意义的ID和名称
5. **版本管理** - 更新时递增 versionCode
6. **测试多设备** - 在不同分辨率设备上测试
7. **备份配置** - 定期备份控制器JSON文件

---

## 十一、完整工作流程

```
1. 设计控制器布局
   ↓
2. 创建 Controller 对象
   ↓
3. 定义按钮和方向键样式
   ↓
4. 创建 ViewGroup
   ↓
5. 添加 ControlButtonData 和 ControlDirectionData
   ↓
6. 配置位置、大小和事件
   ↓
7. 保存为 JSON 文件
   ↓
8. 在游戏中加载测试
   ↓
9. 调整优化
   ↓
10. 发布分享
```

---

## 附录：完整示例

参见 `FCL控件系统示例.json` 文件，包含：
- 移动方向键
- 跳跃按钮
- 攻击按钮
- 使用按钮
- 背包按钮
- 扩展控制组

---

**文档版本：** 1.0  
**更新日期：** 2024  
**适用版本：** FCL Controller Version 3
