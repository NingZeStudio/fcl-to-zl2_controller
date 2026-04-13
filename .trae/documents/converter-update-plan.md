# 控件转换器更新计划：基于新版开发文档的全面修正

> 基于 `fcl控件文档/FCL控件系统开发文档.md` 和 `zl2控件文档/` 全部文档，对照当前代码逐项审查后发现的问题与修复方案。

---

## 一、问题总览（按优先级排序）

### P0 - 关键错误（导致转换结果不可用）

| # | 文件 | 问题 | 影响 |
|---|------|------|------|
| 1 | `keymap.ts` | 键码映射大量错误/缺失/冲突（如 keycode 29 同时映射为 A 和 LEFT_CTRL） | 转换后按键完全错乱 |
| 2 | `converter.ts` | editorVersion 硬编码为 4，应为 11 | ZL2 无法识别/自动迁移 |
| 3 | `converter.ts` | special 字段名用 `defaultJoystickStyle`，ZL2 实际为 `joystickStyle` 且可为 null | JSON 结构不合法 |
| 4 | `reverse-converter.ts` | controllerVersion 硬编码为 3，应为 21 | FCL 版本不匹配 |
| 5 | `types/zl2.ts` | ZL2Layer 缺少 `hideWhenJoystick` 字段；ZL2SpecialConfig 字段名错误 | 类型不匹配 |

### P1 - 功能缺陷（部分功能丢失或数据失真）

| # | 文件 | 问题 |
|---|------|------|
| 6 | `keymap.ts` | 缺少约 40+ 个键码映射（分号、引号、反斜杠、逗号、句号、斜杠、小键盘、修饰键等） |
| 7 | `keymap.ts` | 方向键键码值错误（用了 200/203/205/208，应为 103/105/106/108） |
| 8 | `keymap.ts` | RIGHT_ALT(184 应为 100)、RIGHT_CTRL(157 应为 97) 值错误 |
| 9 | `converter.ts` | 颜色转换始终使用安全色常量，未将 FCL ARGB 真实转换为 ZL2 Long 格式 |
| 10 | `converter.ts` | 方向键转按钮使用硬编码位置，未根据原始方向键坐标/尺寸动态计算 |
| 11 | `converter.ts` | 图层 visibilityType 固定为 'always'，未从 FCL 视图组的 visibilityType 映射 |
| 12 | `reverse-converter.ts` | 未处理 show_layer / hide_layer 事件类型 |
| 13 | `reverse-converter.ts` | 未保留 textAlignment / textBold / textItalic / textUnderline 属性 |
| 14 | `types/fcl.ts` | FCLDirectionStyle 定义严重不完整（缺 name/styleType/buttonStyle/rockerStyle） |

### P2 - 健壮性与错误处理（缺少防御性编程）

| # | 文件 | 问题 |
|---|------|------|
| 15 | `converter.ts` | 无 try-catch，任何字段缺失会导致整个转换崩溃 |
| 16 | `reverse-converter.ts` | 同上，无防御性处理 |
| 17 | `keymap.ts` | SAFE_ZL2_COLORS 中 RED/GREEN/BLUE 全部暂定为 WHITE |
| 18 | `App.vue` | 验证逻辑仅检查顶层字段，未深入校验必需字段存在性 |
| 19 | 全局 | 无统一的错误类型/错误码体系 |

---

## 二、详细修复步骤

### 步骤 1：修正键码映射表 (`src/converter/keymap.ts`)

**问题详情：**

对照 FCL 文档键码表和 ZL2 文档 GLFW 键码表，当前映射有以下具体错误：

- **冲突**: `29` 同时映射为 `GLFW_KEY_A` 和 `GLFW_KEY_LEFT_CONTROL`
  - 正确: A=30, LEFT_CTRL=29
- **方向键全部错误**: 使用了 200/203/205/208，正确值应为 103/105/106/108
- **RIGHT_ALT 错误**: 184 -> 应为 100
- **RIGHT_CTRL 错误**: 157 -> 应为 97
- **缺失键码** (约 40+ 个): SEMICOLON(39), APOSTROPHE(40), GRAVE(41), BACKSLASH(43), COMMA(51), DOT(52), SLASH(53), RIGHTSHIFT(54), KPASTERISK(55), NUMLOCK(69), SCROLLLOCK(70), KP7-KP9(71-73), KPMINUS(74), KP4-KP6(75-77), KPPLUS(78), KP1-KP3(79-81), KP0(82), KPDOT(83), KPENTER(96), KPSLASH(98), SYSRQ(99), HOME(102), PAGEUP(104), END(107), PAGEDOWN(109), INSERT(110), DELETE(111), PAUSE(119), KPCOMMA(121), LEFTMETA(125), RIGHTMETA(126), F13-F24(183-194)

**修复方案：**
1. 按照 FCL 文档完整键码表重写 `FCL_TO_GLFW_KEYMAP`，确保每个 FCL 键码正确映射到对应的 GLFW 字符串
2. 补全 `GLFW_TO_FCL` 反向映射（在 reverse-converter 中通过反转自动生成）
3. 添加未知键码的 fallback 日志警告

### 步骤 2：修正类型定义 (`src/types/zl2.ts` + `src/types/fcl.ts`)

**zl2.ts 修改：**
1. `ZL2SpecialConfig`: 将 `defaultJoystickStyle` 改为 `joystickStyle`，类型改为 `ZL2JoystickStyle | null`
2. `ZL2Layer`: 添加缺失字段 `hideWhenJoystick?: boolean`

**fcl.ts 修改：**
1. `FCLDirectionStyle`: 补全完整定义（name, styleType, buttonStyle, rockerStyle 等），参考文档第 206-251 行
2. 确认 `FCLButtonEvent.Movable` 大小写是否与实际 JSON 一致（文档中字段名为 `movable` 小写）

### 步骤 3：修正 FCL→ZL2 转换器 (`src/converter/converter.ts`)

**3a. 修正版本号和特殊配置：**
- `editorVersion`: 4 → 11
- `special`: `{ defaultJoystickStyle: {...} }` → `{ joystickStyle: null }`

**3b. 修正图层转换 (`convertLayers`)：**
- 将 FCL 视图组的 `visibilityType` 正确映射到 ZL2 图层的 `visibilityType`
- `hide` 字段应基于 `group.visibility === 'INVISIBLE'` 判断（已有，确认正确即可）

**3c. 实现真实颜色转换：**
- 新增方法 `convertFclColorToZl2(fclColor: number): string`
  - 提取 ARGB 各通道
  - 左移 32 位转为 Long 字符串
  - 处理符号位（负数补码）
- 在 `convertStyleConfig` 中使用真实颜色替代 `SAFE_ZL2_COLORS` 常量
- 保留 safe color 作为 fallback（当颜色值异常时）

**3d. 动态计算方向键按钮位置 (`convertDirectionsToButtons`)：**
- 当前硬编码了 9 个按钮的位置 (794, 1474, 2154, ...)
- 应改为：读取原方向键的 xPosition/yPosition/size，按比例计算 9 个按钮的相对位置
- 保持 3x3 网格布局但缩放到原始方向键尺寸范围内

**3e. 样式转换增强：**
- 处理 FCL 的 textColor/strokeColor/fillColor 真实颜色值转换
- 支持 `commonStyle` 字段（默认 false）

### 步骤 4：修正 ZL2→FCL 转换器 (`src/converter/reverse-converter.ts`)

**4a. 修正版本号：**
- `controllerVersion`: 3 → 21

**4b. 补全事件类型处理 (`convertEvents`)：**
- 添加 `show_layer` / `hide_layer` 事件处理（可映射到 bindViewGroup 或记录警告）
- 当前仅处理 key/launcher_event/switch_layer/send_text

**4c. 保留文本格式属性：**
- 虽然 FCL 无原生 textBold/textItalic/textUnderline 支持，应在注释或日志中提示用户这些属性被丢弃
- textAlignment 可尝试通过某种方式保留或忽略并记录

**4d. 增强 convertStyles：**
- 从 ZL2 StyleConfig 的四角圆角取平均值作为 FCL 的单一 cornerRadius
- 分别处理 lightStyle 和 darkStyle（优先使用 lightStyle）

### 步骤 5：添加错误处理与验证机制

**5a. 创建 `src/converter/errors.ts` - 统一错误类型：**
```typescript
export class ConversionError extends Error {
  constructor(
    message: string,
    public readonly code: ConversionErrorCode,
    public readonly context?: unknown
  ) { super(message); this.name = 'ConversionError' }
}

export enum ConversionErrorCode {
  INVALID_JSON = 'INVALID_JSON',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_KEYCODE = 'INVALID_KEYCODE',
  COLOR_CONVERSION_FAILED = 'COLOR_CONVERSION_FAILED',
  COORD_OUT_OF_RANGE = 'COORD_OUT_OF_RANGE',
  SIZE_TOO_SMALL = 'SIZE_TOO_SMALL',
  UNSUPPORTED_FEATURE = 'UNSUPPORTED_FEATURE',
}
```

**5b. 在 converter.ts 中添加防御性检查：**
- 每个转换方法入口验证必需字段
- 使用 optional chaining (`?.`) 和默认值防止空指针
- 对每个 catch 块包装为 ConversionError 并保留上下文

**5c. 在 reverse-converter.ts 中同样添加：**
- BigInt 操作的 try-catch
- 样式/图层空数组保护
- UUID/ID 生成失败保护

**5d. App.vue 验证增强：**
- FCL 模式：验证 controllerVersion 是否为已知版本
- ZL2 模式：验证 editorVersion 是否 <= 11
- 添加字段级深度校验（viewGroups[].viewData.buttonList 至少包含必要字段）

### 步骤 6：更新示例配置 (`App.vue` 中的 loadExample)

- 确保 FCL 示例使用正确的 controllerVersion: 21
- 确保 ZL2 示例使用正确的 editorVersion: 11
- 确保 special 字段格式正确

---

## 三、文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/converter/keymap.ts` | 重写 | 完整修正键码映射表 |
| `src/converter/converter.ts` | 大幅修改 | 版本号、颜色转换、方向键位置、图层可见性、错误处理 |
| `src/converter/reverse-converter.ts` | 中等修改 | 版本号、事件类型、样式圆角、错误处理 |
| `src/converter/errors.ts` | 新建 | 统一错误类型定义 |
| `src/types/zl2.ts` | 小改 | SpecialConfig 字段名、Layer 缺失字段 |
| `src/types/fcl.ts` | 小改 | DirectionStyle 补全 |
| `src/App.vue` | 小改 | 示例配置更新、验证增强 |

---

## 四、风险与注意事项

1. **颜色精度**: JavaScript Number 最大安全整数是 2^53-1，而 ZL2 颜色 Long 可达 2^63-1。必须全程使用字符串存储大整数颜色值，序列化时再用正则去引号。
2. **方向键位置计算**: 动态化后需要仔细测试边界情况（方向键靠近屏幕边缘时按钮溢出）。
3. **向后兼容**: 修正键码映射后，旧的转换结果会不同。这是预期行为——旧结果本身就是错的。
4. **测试策略**: 修改后需用 FCL 默认配置 (00000000.json) 和 ZL2 默认配置 (default_layout.json) 做双向转换测试。
