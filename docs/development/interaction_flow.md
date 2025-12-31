# 事件交互流程 (Interaction Flow) 开发文档

## 1. 点击事件处理流程
当用户触摸屏幕上的一个按钮时，事件按以下顺序传递：

1. **输入捕获**: `ControlLayout` 的 Compose 容器接收到 `PointerInput`。
2. **深度检测 (Deep Touch Detection)**:
    - 系统会根据组件的 `z-index` 和位置进行排序。
    - 检查组件是否支持深度检测 (`supportsDeepTouchDetection`)。
    - 处理 `isPenetrable`（穿透）属性。如果顶层组件不可穿透，事件在此截断。
3. **事件分发**:
    - 调用目标组件的 `onTouchEvent`。
    - `ObservableNormalData` 会调用 `pressStart`。
4. **动作执行**:
    - `EventHandler` 被调用，遍历 `clickEvents`。
    - 执行具体的动作，如发送按键 (`Type.Key`)、切换层级可见性 (`Type.SwitchLayer`) 等。

## 2. 滑动联动 (Swipple) 逻辑
滑动联动允许在多个按钮间无缝切换状态：
- 按钮必须开启 `isSwipple`。
- 当手指从按钮 A 滑动到按钮 B 时：
    - 按钮 A 判定手指离开，但如果 `isReleaseOnOutOfBounds` 为 false，则不立即松开。
    - 按钮 B 判定手指进入，并触发 `pressStart`。
    - 这要求 `activeWidgets` 列表能够管理多个正在被触碰的组件。

## 3. 摇杆与游戏输入的桥接
摇杆不直接发送 `KeyEvent`，而是通过方向监听器转发：

1. **摇杆逻辑层**: 计算出 `JoystickDirection`。
2. **监听层**: `JoystickDirectionListener` 捕获方向。
3. **事件层**: 将方向映射为游戏内的移动键（如 W/A/S/D）。
4. **发送层**: 通过 `ZLBridge` 或 native 方法将按键状态同步给 Minecraft 引擎。

## 4. 游戏内文本输入流程
[GameInputProxy.kt](file:///e:/project/ZalithLauncher2/ZalithLauncher/src/main/java/com/movtery/zalithlauncher/game/input/GameInputProxy.kt) 处理复杂的文本同步：
1. Android `EditText` 产生文本变化。
2. `calculateTextDifference` 计算增量。
3. 根据增量发送 `Char` 或 `Backspace` 给游戏。
4. 这种“差分同步”机制保证了启动器输入框与游戏内输入框的一致性。
