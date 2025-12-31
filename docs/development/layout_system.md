# 布局控制系统 (Layout Control System) 开发文档

## 1. 概述
Zalith Launcher 2 的布局控制系统采用了数据驱动的设计架构，旨在提供高度可定制的游戏控制界面。该系统支持多层叠加、动态切换以及丰富的组件交互。

## 2. 核心数据模型

### 2.1 ControlLayout
[ControlLayout.kt](file:///e:/project/ZalithLauncher2/LayerController/src/main/java/com/movtery/layer_controller/layout/ControlLayout.kt) 是整个布局的根容器。
- `info`: 布局的元数据（名称、作者、版本等）。
- `layers`: `ControlLayer` 列表，定义了不同的 UI 层级。
- `styles`: `ButtonStyle` 列表，存储复用的按钮样式。
- `special`: 特殊全局配置，如默认摇杆样式。
- `editorVersion`: 用于兼容性检查。

### 2.2 ControlLayer
[ControlLayer.kt](file:///e:/project/ZalithLauncher2/LayerController/src/main/java/com/movtery/layer_controller/layout/ControlLayer.kt) 代表一个独立的 UI 层。
- 每一层可以包含多个 `Widget`（按钮或文本）。
- 支持隐藏/显示状态，可由点击事件动态触发。

### 2.3 组件 (Widget)
组件分为数据层 (`Data`) 和可观察包装层 (`Observable`)。
- **NormalData / ObservableNormalData**: 普通按钮。支持点击事件、滑动联动 (`isSwipple`)、触摸穿透 (`isPenetrable`) 和开关模式 (`isToggleable`)。
- **TextData / ObservableTextData**: 文本显示。支持本地化字符串和样式配置。

## 3. 布局加载与持久化
系统使用 `kotlinx.serialization` 进行 JSON 序列化。
- **加载流程**: 读取文件 -> 解析 JSON -> 版本检查与升级 (`updateLayoutToNew`) -> 实例化。
- **持久化**: 将 `Observable` 对象 `pack()` 回数据模型 -> 序列化为 JSON -> 写入文件。

## 4. 交互原理
交互逻辑核心位于 `ObservableWidget` 及其子类中。

### 4.1 触摸事件流
1. Compose 的 `pointerInput` 捕获原始触摸事件。
2. 事件分发给当前层级中的 `ObservableWidget`。
3. `onTouchEvent`: 处理按下和滑动逻辑。
4. `onReleaseEvent`: 处理松开逻辑。

### 4.2 按钮特性
- **滑动联动 (Swipple)**: 允许手指在多个标记为 `isSwipple` 的按钮间滑动而无需抬起，实现连续触发。
- **触摸穿透 (Penetrable)**: 如果按钮是可穿透的，它在处理自身逻辑的同时，允许事件继续传递给下方的层级或游戏窗口。
- **开关模式 (Toggleable)**: 按钮点击后保持按下状态，再次点击复位。

## 5. 渲染架构
使用 Jetpack Compose 实现。
- [Buttons.kt](file:///e:/project/ZalithLauncher2/LayerController/src/main/java/com/movtery/layer_controller/layout/Buttons.kt) 包含了不同类型按钮的渲染函数。
- 渲染位置基于 `ButtonPosition`（支持对齐方式和偏移量）。
- 渲染大小基于 `ButtonSize`。
