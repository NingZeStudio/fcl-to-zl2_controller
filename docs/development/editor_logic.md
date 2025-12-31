# 布局编辑器 (Layout Editor) 开发逻辑文档

## 1. 概述
布局编辑器是 `LayerController` 模块的核心功能之一，允许用户通过可视化界面调整按钮位置、样式和属性。它支持网格吸附、对齐辅助线以及多层聚焦编辑。

## 2. 编辑器渲染层 (ControlEditorLayer)
[ControlEditor.kt](file:///e:/project/ZalithLauncher2/LayerController/src/main/java/com/movtery/layer_controller/ControlEditor.kt) 中的 `ControlEditorLayer` 是编辑器的入口。
- **层级过滤**: 编辑器模式下会过滤掉 `editorHide` 为 true 的层，并反转列表以确保正确的渲染顺序（顶层在最上方）。
- **聚焦模式**: 支持 `focusedLayer`，开启后仅编辑特定层，减少干扰。

## 3. 吸附与对齐逻辑 (Snap Logic)
这是编辑器中最复杂的逻辑部分，位于 `com.movtery.layer_controller.utils.snap` 包中。
- **吸附模式 (SnapMode)**:
    - `None`: 无吸附。
    - `Grid`: 吸附到预设的网格。
    - `Local`: 吸附到当前层内的其他组件。
    - `Global`: 吸附到所有层内的其他组件。
- **辅助线 (GuideLine)**: 当组件接近吸附点时，编辑器会渲染水平或垂直的辅助线。
- **阈值控制**: 通过 `snapThresholdValue` 控制吸附的灵敏度。

## 4. 位置计算原理
- **坐标系**: 使用百分比坐标系或相对坐标系，以适应不同屏幕比例。
- **实时预览**: `ObservableWidget` 的 `movingOffset` 属性在拖动时实时更新，触发 Compose 重绘。
- **位置持久化**: 拖动结束后，调用 `putRenderPosition` 将最终位置写回数据模型。

## 5. 状态管理
- 使用 `StateFlow` 和 `collectAsStateWithLifecycle` 监听布局数据的变化。
- 样式和组件数据通过 `Observable` 包装类实现双向绑定，确保属性编辑器的修改能立即反映在预览界面上。
