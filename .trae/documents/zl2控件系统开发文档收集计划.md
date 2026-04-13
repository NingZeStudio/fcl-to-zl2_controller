# ZL2 控件系统开发文档收集计划

## 任务目标
从 `e:\project\ZalithLauncher2` 项目中收集 ZL2 控件系统的开发文档，用于 FCL 到 ZL2 控件转换器的开发。

## 文档收集范围

### 1. 核心数据结构 (LayerController/data/)
| 文件 | 说明 | 关键信息 |
|------|------|----------|
| `ButtonStyle.kt` | 按钮样式 | 包含 lightStyle/darkStyle、alpha、颜色、圆角、边框等 |
| `ButtonPosition.kt` | 按钮位置 | x/y 范围 0-10000（万分比） |
| `ButtonSize.kt` | 按钮大小 | 支持 Dp/Percentage/WrapContent 三种类型 |
| `Widget.kt` | 控件接口 | NormalData 和 TextData 实现此接口 |
| `VisibilityType.kt` | 可见性类型 | always / in_game / in_menu |
| `JoystickStyle.kt` | 摇杆样式 | alpha、背景/摇杆颜色、锁定颜色、圆角等 |
| `ButtonShape.kt` | 圆角形状 | 四角独立圆角值（0-100dp） |
| `NormalData.kt` | 普通按钮数据 | 包含 clickEvents、isSwipple、isPenetrable、isToggleable |
| `TextData.kt` | 文本框数据 | 与按钮类似但无交互属性 |
| `TextAlignment.kt` | 文本对齐 | Left / Center / Right |
| `ClickEvent.kt` | 点击事件 | key/launcher_event/switch_layer/show_layer/hide_layer/send_text |
| `TranslatableString.kt` | 多语言字符串 | default + matchQueue 匹配机制 |

### 2. 布局结构 (LayerController/layout/)
| 文件 | 说明 |
|------|------|
| `ControlLayout.kt` | 整体布局：info + layers + styles + special + editorVersion |
| `ControlLayer.kt` | 图层：name + uuid + hide + visibilityType + normalButtons + textBoxes |
| `Version.kt` | 编辑器版本号（当前11）及版本迁移逻辑 |

### 3. 工具类 (LayerController/utils/)
| 文件 | 说明 |
|------|------|
| `JsonAdapters.kt` | ColorSerializer：Color 以 Long 形式序列化 |
| `Utils.kt` | layoutJson 配置、UUID 生成、范围校验 |

### 4. 事件处理 (LayerController/event/)
| 文件 | 说明 |
|------|------|
| `ClickEvent.kt` | 事件类型枚举：Key、LauncherEvent、SwitchLayer、ShowLayer、HideLayer、SendText |
| `EventHandler.kt` | 事件处理器 |

### 5. 键码定义
- `LwjglGlfwKeycode.java`：完整 GLFW 键码常量定义（键盘、鼠标）

### 6. 示例布局文件
- `default_layout.json`：ZL2 默认控件布局示例

## 关键转换规则摘要

### 坐标系统
- ZL2 范围：0-10000（万分比）
- FCL 范围：0-1000（千分比）
- 转换公式：`ZL2 = FCL * 10`

### 颜色值
- ZL2 使用 Compose Color（Long 整数，高 32 位为 ARGB）
- 序列化时为 Long 类型大整数

### 尺寸类型
- `Dp`：绝对值，最小 5dp
- `Percentage`：百分比，范围 100-10000
- `WrapContent`：跟随内容

### 事件类型
- `key`：发送 GLFW 键码
- `launcher_event`：启动器事件（如切换输入法、鼠标按钮）
- `switch_layer / show_layer / hide_layer`：图层控制
- `send_text`：发送聊天消息

### 样式配置
- `commonStyle = true`：不区分主题
- `commonStyle = false`：区分 lightStyle/darkStyle

## 实施步骤

1. **创建文档目录结构**
   - 在项目根目录创建 `zl2控件文档/` 目录

2. **整理核心数据类型文档**
   - 创建 `zl2控件文档/数据类型.md`

3. **整理布局结构文档**
   - 创建 `zl2控件文档/布局结构.md`

4. **整理键码映射文档**
   - 创建 `zl2控件文档/键码映射.md`

5. **整理示例布局分析**
   - 创建 `zl2控件文档/示例布局分析.md`

6. **更新项目规则文档**
   - 在 `.trae/rules/project_rules.md` 中补充 ZL2 相关规则

## 输出文件列表
- `zl2控件文档/数据类型.md`
- `zl2控件文档/布局结构.md`
- `zl2控件文档/键码映射.md`
- `zl2控件文档/示例布局分析.md`
- 更新: `.trae/rules/project_rules.md`
