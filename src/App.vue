<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          FCL → ZL2 控件转换器
        </h1>
        <p class="text-slate-600 dark:text-slate-400">
          将 Fold Craft Launcher 控件配置转换为 ZalithLauncher 2 格式
        </p>
      </div>

      <!-- 警告提示 -->
      <Alert variant="default" class="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
        <div class="flex items-start gap-3">
          <AlertCircle class="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div class="flex-1">
            <h3 class="font-semibold text-amber-900 dark:text-amber-100 mb-1">重要提示</h3>
            <p class="text-sm text-amber-800 dark:text-amber-200">
              转换后的 ZL2 配置使用了安全的颜色值。如需自定义颜色，请使用 ZL2 编辑器的可视化颜色选择器，
              <strong>不要</strong>手动修改颜色值，否则可能导致应用崩溃。
            </p>
          </div>
        </div>
      </Alert>

      <!-- 主要内容区 -->
      <div class="grid md:grid-cols-2 gap-6">
        <!-- 输入区 -->
        <Card class="p-6">
          <div class="mb-4">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FileInput class="h-5 w-5" />
              FCL 控件配置 (输入)
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              粘贴 FCL 控件的 JSON 配置
            </p>
          </div>
          
          <div
            class="relative"
            @dragover.prevent
            @dragenter.prevent
            @drop="handleFileDrop"
          >
            <Textarea
              v-model="fclInput"
              placeholder='粘贴 FCL JSON 配置，或拖拽 JSON 文件到此处...'
              class="font-mono text-xs h-[500px]"
              :class="{ 'border-red-500': inputError, 'border-blue-500 bg-blue-50 dark:bg-blue-950': isDragOver }"
              @dragover="isDragOver = true"
              @dragleave="isDragOver = false"
            />
          </div>
          
          <div v-if="inputError" class="mt-2 text-sm text-red-600 dark:text-red-400">
            {{ inputError }}
          </div>

          <div class="mt-4 flex gap-2">
            <Button @click="loadExample" variant="outline" size="sm" class="flex items-center gap-2">
              <FileText class="h-4 w-4" />
              加载示例
            </Button>
            <Button @click="triggerFileInput" variant="outline" size="sm" class="flex items-center gap-2">
              <FileInput class="h-4 w-4" />
              导入文件
            </Button>
            <Button @click="clearInput" variant="ghost" size="sm" class="flex items-center gap-2">
              <X class="h-4 w-4" />
              清空
            </Button>
          </div>
          
          <!-- 隐藏的文件输入 -->
          <input
            ref="fileInputRef"
            type="file"
            accept=".json"
            @change="handleFileImport"
            class="hidden"
          />
        </Card>

        <!-- 输出区 -->
        <Card class="p-6">
          <div class="mb-4">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FileOutput class="h-5 w-5" />
              ZL2 控件配置 (输出)
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              转换后的 ZL2 JSON 配置
            </p>
          </div>
          
          <Textarea
            v-model="zl2Output"
            placeholder="转换结果将显示在这里..."
            class="font-mono text-xs h-[500px]"
            readonly
          />

          <div v-if="conversionStats" class="mt-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
            <div class="font-semibold mb-1 text-slate-900 dark:text-white">转换统计</div>
            <div class="space-y-1 text-slate-700 dark:text-slate-300">
              <div>• 控件层: {{ conversionStats.layers }}</div>
              <div>• 按钮: {{ conversionStats.buttons }}</div>
              <div>• 方向键: {{ conversionStats.directions }}</div>
              <div>• 样式: {{ conversionStats.styles }}</div>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <Button @click="copyOutput" variant="default" size="sm" class="flex items-center gap-2" :disabled="!zl2Output">
              <Copy class="h-4 w-4" />
              复制结果
            </Button>
            <Button @click="downloadOutput" variant="outline" size="sm" class="flex items-center gap-2" :disabled="!zl2Output">
              <Download class="h-4 w-4" />
              下载 JSON
            </Button>
          </div>
        </Card>
      </div>

      <!-- 转换按钮 -->
      <div class="mt-6 text-center">
        <Button 
          @click="convert" 
          size="lg" 
          class="px-8 py-6 text-lg"
          :disabled="!fclInput || converting"
        >
          <ArrowRight class="h-5 w-5 mr-2" />
          {{ converting ? '转换中...' : '开始转换' }}
        </Button>
      </div>

      <!-- 使用说明 -->
      <Card class="mt-8 p-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">使用说明</h3>
        <ol class="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li>粘贴 FCL JSON 配置到左侧输入框，或点击"导入文件"选择 JSON 文件</li>
          <li>点击"开始转换"按钮</li>
          <li>在右侧查看转换后的 ZL2 配置</li>
          <li>复制或下载转换结果（文件名格式：zl2_控件ID.json）</li>
          <li>在 ZL2 启动器中导入转换后的配置</li>
        </ol>
        
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
          <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-sm">转换说明</h4>
          <ul class="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 支持拖拽或点击导入 FCL JSON 文件</li>
            <li>• 方向键会被转换为 8 个独立按钮（支持斜向移动）</li>
            <li>• 键码会自动映射为 GLFW 格式</li>
            <li>• 样式使用安全的颜色值，避免崩溃</li>
            <li>• 输出文件名自动包含原控件 ID</li>
          </ul>
        </div>
      </Card>

      <!-- 页脚 -->
      <div class="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>基于 FCL 和 ZL2 控件系统文档开发</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  AlertCircle, 
  FileInput, 
  FileOutput, 
  ArrowRight, 
  Copy, 
  Download,
  FileText,
  X
} from 'lucide-vue-next'
import Card from './components/Card.vue'
import Button from './components/Button.vue'
import Textarea from './components/Textarea.vue'
import Alert from './components/Alert.vue'
import { FCLToZL2Converter } from './converter/converter'
import type { FCLController } from './types/fcl'

const fclInput = ref('')
const zl2Output = ref('')
const inputError = ref('')
const converting = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const currentFclId = ref('')
const isDragOver = ref(false)
const conversionStats = ref<{
  layers: number
  buttons: number
  directions: number
  styles: number
} | null>(null)

const converter = new FCLToZL2Converter()

function convert() {
  inputError.value = ''
  converting.value = true
  
  try {
    const fclController: FCLController = JSON.parse(fclInput.value)
    
    // 验证基本结构
    if (!fclController.viewGroups || !Array.isArray(fclController.viewGroups)) {
      throw new Error('无效的 FCL 配置：缺少 viewGroups')
    }

    // 保存 FCL 控件 ID 用于文件名
    currentFclId.value = fclController.id || 'unknown'

    // 执行转换
    const zl2Layout = converter.convert(fclController)
    
    // 先序列化为 JSON
    let jsonStr = JSON.stringify(zl2Layout, null, 2)
    
    // 将颜色值字符串转换为数字（移除引号）
    // 匹配类似 "backgroundColor": "-9223372036854775808" 的模式
    jsonStr = jsonStr.replace(/"(-?\d{10,})"/g, '$1')
    
    zl2Output.value = jsonStr

    // 统计信息
    const totalButtons = fclController.viewGroups.reduce(
      (sum, g) => sum + g.viewData.buttonList.length, 0
    )
    const totalDirections = fclController.viewGroups.reduce(
      (sum, g) => sum + g.viewData.directionList.length, 0
    )

    conversionStats.value = {
      layers: fclController.viewGroups.length,
      buttons: totalButtons,
      directions: totalDirections,
      styles: fclController.buttonStyles.length
    }
  } catch (error) {
    inputError.value = error instanceof Error ? error.message : '转换失败'
    zl2Output.value = ''
    conversionStats.value = null
    currentFclId.value = ''
  } finally {
    converting.value = false
  }
}

function copyOutput() {
  if (zl2Output.value) {
    navigator.clipboard.writeText(zl2Output.value)
    alert('已复制到剪贴板！')
  }
}

function downloadOutput() {
  if (zl2Output.value) {
    const blob = new Blob([zl2Output.value], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // 使用 FCL 控件 ID 作为文件名
    const fileName = currentFclId.value ? `zl2_${currentFclId.value}.json` : 'zl2_control_layout.json'
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }
}

function clearInput() {
  fclInput.value = ''
  inputError.value = ''
  currentFclId.value = ''
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!file.name.endsWith('.json')) {
    inputError.value = '请选择 JSON 文件'
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      // 验证是否为有效的 JSON
      JSON.parse(content)
      fclInput.value = content
      inputError.value = ''
    } catch (error) {
      inputError.value = '文件格式错误：不是有效的 JSON 文件'
    }
  }
  
  reader.onerror = () => {
    inputError.value = '文件读取失败'
  }
  
  reader.readAsText(file)
  
  // 清空 input 值，允许重复选择同一文件
  target.value = ''
}

function handleFileDrop(event: DragEvent) {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return
  
  const file = files[0]
  if (!file.name.endsWith('.json')) {
    inputError.value = '请拖拽 JSON 文件'
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      // 验证是否为有效的 JSON
      JSON.parse(content)
      fclInput.value = content
      inputError.value = ''
    } catch (error) {
      inputError.value = '文件格式错误：不是有效的 JSON 文件'
    }
  }
  
  reader.onerror = () => {
    inputError.value = '文件读取失败'
  }
  
  reader.readAsText(file)
}

function loadExample() {
  // 加载 FCL 示例配置
  fetch('/fcl控件文档/FCL控件系统示例.json')
    .then(res => res.text())
    .then(text => {
      fclInput.value = text
      inputError.value = ''
    })
    .catch(() => {
      inputError.value = '无法加载示例文件'
    })
}
</script>
