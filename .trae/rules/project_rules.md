# 项目规则与知识库

## 项目概览
FCL 到 ZL2 控件转换器是一个 Web 应用，支持 Fold Craft Launcher (FCL) 和 ZalithLauncher 2 (ZL2) 控件配置之间的双向转换。

## 技术栈
- 框架: Vue 3 (Composition API)
- 语言: TypeScript
- 构建工具: Vite
- UI 组件: shadcn-vue (Radix Vue)
- 样式: Tailwind CSS
- 图标: Lucide Icons

## 核心转换规则
### 1. 坐标与尺寸
- FCL 范围: 0-1000 (千分比)
- ZL2 范围: 0-10000 (万分比)
- 转换公式: `ZL2 = FCL * 10`，`FCL = ZL2 / 10`

### 2. 键码映射
- FCL 使用数字键码。
- ZL2 使用 GLFW 键码。
- 映射逻辑位于 `src/converter/keymap.ts`。
- 双向转换时，键码会根据映射表进行反转。

### 3. 方向键转换
- **FCL → ZL2**: FCL 方向键控件会被转换为 8 个独立的 ZL2 按钮，覆盖所有方向（含斜向）。
- **ZL2 → FCL**: ZL2 中的所有按钮都会被转换为 FCL 的普通按钮（`buttonList`）。**禁止**尝试自动识别并转换为 FCL 的方向键控件（`directionList`），因为 ZL2 结构中没有对应的原生方向盘组件，且手动按钮更符合 FCL 用户习惯。

### 4. 颜色值处理 (关键)
- ZL2 使用 Compose Color (Long 整数，高 32 位为 ARGB)。
- FCL 使用 32 位有符号整数 (ARGB)。
- **转换逻辑**:
  - **FCL → ZL2**: 将 32 位整数左移 32 位转换为 64 位 Long 字符串。
  - **ZL2 → FCL**: 将 64 位 Long 字符串右移 32 位，并使用 `BigInt.asIntN(32, val)` 转换为 32 位有符号整数。
- **安全颜色值**:
  - 背景色 (ZL2): `-9223372036854775808`
  - 按下背景色 (ZL2): `-5510004026390872064`
  - 文字/边框色 (ZL2): `-4294967296`

### 5. 样式与 ID 映射 (v1.0.2)
- **样式名一致性**: ZL2 使用 UUID 引用样式，FCL 使用名称（`name`）引用样式。转换时必须确保按钮的 `style` 字段与 `buttonStyles` 列表中的 `name` 字段完全一致。
- **内置样式同步**: 必须保持 FCL 与 ZL2 之间内置样式的 UUID 和名称映射同步（见 `src/converter/reverse-converter.ts` 中的 `builtInStyles`）。
- **ID 规范**: FCL 的所有 ID（控制器 ID、视图组 ID、按钮 ID）均应使用 8 位随机字符串（`Math.random().toString(36).substring(2, 10)`），避免直接使用 ZL2 的长 UUID。
- **样式补全**: 如果按钮引用了不存在的样式，必须在 `buttonStyles` 中创建一个具有默认属性的占位样式。

## 精度问题解决方案 (v1.0.1)
- **挑战**: JavaScript 的 `Number` 类型无法精确表示 ZL2 的大整数颜色值，导致 JSON 序列化时精度丢失。
- **方案**:
  1. 在 TypeScript 类型定义中，将颜色相关字段定义为 `string`。
  2. 在 `src/converter/keymap.ts` 中以字符串形式存储颜色常量。
  3. 在 `App.vue` 中进行 JSON 序列化后，使用正则表达式 `jsonStr.replace(/"(-?\d{10,})"/g, '$1')` 移除引号，确保输出为纯数字且不丢失精度。

## 开发规范
- 必须保持类型安全，使用 `src/types/` 下的定义。
- 逻辑应保持模块化，转换逻辑集中在 `src/converter/`。
- **UI 状态同步**: 当转换模式 (`conversionMode`) 切换时，必须清空输入和输出内容，并同步更新所有的 UI 说明、占位符和统计信息。
- 修改代码后需验证颜色值输出是否为不带引号的大整数。
- 文档位于项目根目录及 `fcl控件文档/`、`zl2控件文档/` 目录下。
