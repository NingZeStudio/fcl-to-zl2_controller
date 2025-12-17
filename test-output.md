# 测试输出格式

## 问题分析

错误信息：`Numeric value overflow at path: $.styles[0].lightStyle.backgroundColor`

原因：JavaScript 的 Number 类型无法精确表示 `-9223372036854775808` 这样的大整数。

## 解决方案

### 1. 在 TypeScript 中使用字符串存储
```typescript
backgroundColor: string  // 而不是 number
```

### 2. 在 JSON 输出时移除引号
```typescript
// 将 "backgroundColor": "-9223372036854775808"
// 转换为 "backgroundColor": -9223372036854775808
jsonStr = jsonStr.replace(/"(-?\d{10,})"/g, '$1')
```

## 正确的输出格式

```json
{
  "lightStyle": {
    "alpha": 1.0,
    "pressedAlpha": 1.0,
    "backgroundColor": -9223372036854775808,
    "pressedBackgroundColor": -5510004026390872064,
    "contentColor": -4294967296,
    "pressedContentColor": -4294967296
  }
}
```

注意：颜色值**没有引号**，是纯数字。

## 测试步骤

1. 刷新浏览器页面
2. 点击"加载示例"
3. 点击"开始转换"
4. 检查输出的 JSON 中颜色值是否为数字（无引号）
5. 复制 JSON 并在 ZL2 中导入测试

## 预期结果

✅ 颜色值应该是数字格式（无引号）
✅ ZL2 应该能够成功导入
✅ 不应该出现 "Numeric value overflow" 错误
