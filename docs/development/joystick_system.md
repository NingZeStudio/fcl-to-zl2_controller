# 摇杆系统 (Joystick System) 开发文档

## 1. 概述
摇杆系统提供了移动端的虚拟摇杆输入功能，支持 8 方向识别、前进锁定（Forward Lock）以及高度可定制的外观样式。

## 2. 核心组件

### 2.1 Joystick 控件
[JoystickControl.kt](file:///e:/project/ZalithLauncher2/ZalithLauncher/src/main/java/com/movtery/zalithlauncher/ui/control/joystick/JoystickControl.kt) 实现了 UI 渲染和物理逻辑。
- **物理计算**:
    - 基于触摸点与中心的偏移量 (`Offset`) 计算角度和距离。
    - 距离限制在背景圆圈范围内。
    - 角度转化为 8 个方向：东、南、西、北、东北、东南、西北、西南。
- **死区 (Dead Zone)**:
    - 通过 `deadZoneRatio` 定义。如果触摸偏移距离小于死区，方向判定为 `None`。

### 2.2 前进锁定 (Forward Lock)
- 当用户将摇杆推向正上方（北）并超出一定阈值 (`lockThreshold`) 时，触发锁定判定。
- 锁定后，即便手指离开，摇杆也会保持在“北”方向，直到用户再次操作。
- 锁定状态通过 `isLocked` 状态变量维护。

## 3. 样式系统 (JoystickStyle)
摇杆的外观高度可调，定义在 [JoystickStyle.kt](file:///e:/project/ZalithLauncher2/LayerController/src/main/java/com/movtery/layer_controller/data/JoystickStyle.kt) 中。
- **可调参数**:
    - `alpha`: 透明度。
    - `backgroundColor`: 背景颜色。
    - `joystickColor`: 摇杆球颜色。
    - `joystickCanLockColor`: 可锁定状态下的颜色。
    - `joystickLockedColor`: 锁定后的颜色。
    - `backgroundShape` & `joystickShape`: 圆角百分比（0-50%）。
    - `joystickSize`: 摇杆球相对于背景的大小比例。

## 4. 输入映射与监听
摇杆的方向变化通过 `onDirectionChanged` 回调。

### 4.1 方向映射
在 [_Movement.kt](file:///e:/project/ZalithLauncher2/ZalithLauncher/src/main/java/com/movtery/zalithlauncher/ui/control/joystick/_Movement.kt) 中，定义了 `JoystickDirection` 到游戏键值的映射：
- `North` -> `W` (Forward)
- `NorthEast` -> `W` + `D` (Forward + Right)
- ...以此类推。

### 4.2 监听逻辑
`JoystickDirectionListener` 负责将方向变化转化为具体的 `ClickEvent`：
1. 注册到 `JoystickMovementViewModel`。
2. 当方向改变时，首先清除旧的按下状态。
3. 根据映射关系发送新的 `ClickEvent(type = Key, ...)`。
4. 处理 `isGrabbing` 状态，确保在菜单界面时不会误触发移动。
