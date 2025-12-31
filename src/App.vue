<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
      <!-- 标题 -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div class="text-center md:text-left">
          <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {{ conversionMode === 'fcl-to-zl2' ? 'FCL → ZL2' : 'ZL2 → FCL' }} 控件转换器
          </h1>
          <p class="text-slate-600 dark:text-slate-400">
            {{ conversionMode === 'fcl-to-zl2' ? '将 Fold Craft Launcher 控件配置转换为 ZalithLauncher 2 格式' : '将 ZalithLauncher 2 控件配置转换为 Fold Craft Launcher 格式' }}
          </p>
        </div>
        <div class="flex w-full md:w-auto bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <button 
            @click="conversionMode = 'fcl-to-zl2'"
            class="flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors"
            :class="conversionMode === 'fcl-to-zl2' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
          >
            FCL → ZL2
          </button>
          <button 
            @click="conversionMode = 'zl2-to-fcl'"
            class="flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-colors"
            :class="conversionMode === 'zl2-to-fcl' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'"
          >
            ZL2 → FCL
          </button>
        </div>
      </div>

      <!-- 警告提示 -->
      <Alert variant="default" class="mb-6 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
        <div class="flex items-start gap-3">
          <AlertCircle class="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div class="flex-1">
            <h3 class="font-semibold text-amber-900 dark:text-amber-100 mb-1">重要提示</h3>
            <p v-if="conversionMode === 'fcl-to-zl2'" class="text-sm text-amber-800 dark:text-amber-200">
              转换后的 ZL2 配置使用了安全的颜色值。如需自定义颜色，请使用 ZL2 编辑器的可视化颜色选择器，
              <strong>不要</strong>手动修改颜色值，否则可能导致应用崩溃。
            </p>
            <p v-else class="text-sm text-amber-800 dark:text-amber-200">
              ZL2 转换为 FCL 时，由于 FCL 坐标系精度较低（千分比），转换后的位置可能存在微小偏差。
              此外，ZL2 的颜色值无法完美映射回 FCL，建议在 FCL 编辑器中重新调整控件样式。
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
              {{ conversionMode === 'fcl-to-zl2' ? 'FCL 控件配置 (输入)' : 'ZL2 控件配置 (输入)' }}
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              {{ conversionMode === 'fcl-to-zl2' ? '粘贴 FCL 控件的 JSON 配置' : '粘贴 ZL2 控件的 JSON 配置' }}
            </p>
          </div>
          
          <div
            class="relative"
            @dragover.prevent
            @dragenter.prevent
            @drop="handleFileDrop"
          >
            <Textarea
              v-model="inputContent"
              :placeholder='conversionMode === "fcl-to-zl2" ? "粘贴 FCL JSON 配置，或拖拽 JSON 文件到此处..." : "粘贴 ZL2 JSON 配置，或拖拽 JSON 文件到此处..."'
              class="font-mono text-xs h-[350px] md:h-[500px]"
              :class="{ 'border-red-500': inputError, 'border-blue-500 bg-blue-50 dark:bg-blue-950': isDragOver }"
              @dragover="isDragOver = true"
              @dragleave="isDragOver = false"
            />
          </div>
          
          <div v-if="inputError" class="mt-2 text-sm text-red-600 dark:text-red-400">
            {{ inputError }}
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <Button @click="loadExample" variant="outline" size="sm" class="flex-1 md:flex-none flex items-center justify-center gap-2">
              <FileText class="h-4 w-4" />
              示例
            </Button>
            <Button @click="triggerFileInput" variant="outline" size="sm" class="flex-1 md:flex-none flex items-center justify-center gap-2">
              <FileInput class="h-4 w-4" />
              导入
            </Button>
            <Button @click="clearInput" variant="ghost" size="sm" class="flex-1 md:flex-none flex items-center justify-center gap-2">
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
              {{ conversionMode === 'fcl-to-zl2' ? 'ZL2 控件配置 (输出)' : 'FCL 控件配置 (输出)' }}
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              {{ conversionMode === 'fcl-to-zl2' ? '转换后的 ZL2 JSON 配置' : '转换后的 FCL JSON 配置' }}
            </p>
          </div>
          
          <Textarea
            v-model="outputContent"
            placeholder="转换结果将显示在这里..."
            class="font-mono text-xs h-[350px] md:h-[500px]"
            readonly
          />

          <div v-if="conversionStats" class="mt-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-md text-sm">
            <div class="font-semibold mb-1 text-slate-900 dark:text-white">转换统计</div>
            <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-4 gap-y-1 text-slate-700 dark:text-slate-300">
              <div>• 控件层: {{ conversionStats.layers }}</div>
              <div>• 按钮: {{ conversionStats.buttons }}</div>
              <div v-if="conversionStats.directions > 0">• 方向键: {{ conversionStats.directions }}</div>
              <div>• 样式: {{ conversionStats.styles }}</div>
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <Button @click="copyOutput" variant="default" size="sm" class="flex-1 md:flex-none flex items-center justify-center gap-2" :disabled="!outputContent">
              <Copy class="h-4 w-4" />
              复制
            </Button>
            <Button @click="downloadOutput" variant="outline" size="sm" class="flex-1 md:flex-none flex items-center justify-center gap-2" :disabled="!outputContent">
              <Download class="h-4 w-4" />
              下载
            </Button>
          </div>
        </Card>
      </div>

      <!-- 转换按钮 -->
      <div class="mt-6 flex flex-col items-center gap-4">
        <Button 
          @click="convert" 
          size="lg" 
          class="w-full md:w-auto px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
          :disabled="!inputContent || converting"
        >
          <div v-if="converting" class="absolute inset-0 bg-blue-600/20 animate-pulse"></div>
          <ArrowRight v-if="!converting" class="h-5 w-5 mr-2" />
          <Loader2 v-else class="h-5 w-5 mr-2 animate-spin" />
          {{ converting ? '转换中...' : '开始转换' }}
        </Button>
        
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div v-if="showSuccess" class="text-green-600 dark:text-green-400 flex items-center gap-2 font-medium">
            <CheckCircle2 class="h-5 w-5" />
            转换成功！
          </div>
        </transition>
      </div>

      <!-- 使用说明 -->
      <Card class="mt-8 p-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">使用说明</h3>
        <ol class="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <li v-if="conversionMode === 'fcl-to-zl2'">粘贴 FCL JSON 配置到左侧输入框，或点击"导入文件"选择 JSON 文件</li>
          <li v-else>粘贴 ZL2 JSON 配置到左侧输入框，或点击"导入文件"选择 JSON 文件</li>
          
          <li>点击"开始转换"按钮</li>
          <li>在右侧查看转换后的结果</li>
          
          <li v-if="conversionMode === 'fcl-to-zl2'">复制或下载转换结果（文件名格式：zl2_控件ID.json）</li>
          <li v-else>复制或下载转换结果（文件名格式：fcl_控件ID.json）</li>
          
          <li v-if="conversionMode === 'fcl-to-zl2'">在 ZL2 启动器中导入转换后的配置</li>
          <li v-else>在 FCL 启动器中导入或替换对应的控件 JSON 文件</li>
        </ol>
        
        <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
          <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-sm">转换说明</h4>
          <ul class="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• 支持拖拽或点击导入 JSON 文件</li>
            <template v-if="conversionMode === 'fcl-to-zl2'">
              <li>• 方向键会被转换为 8 个独立按钮（支持斜向移动）</li>
              <li>• 键码会自动映射为 GLFW 格式</li>
              <li>• 样式使用安全的颜色值，避免崩溃</li>
            </template>
            <template v-else>
              <li>• ZL2 的所有按钮会被转换为 FCL 普通按钮（buttonList）</li>
              <li>• 不会尝试识别方向盘，保留原始按钮布局以获得更好的兼容性</li>
              <li>• GLFW 键码会自动映射回 FCL 数字键码</li>
              <li>• 坐标从万分比缩放到千分比，存在约 1% 的精度损失</li>
            </template>
            <li>• 输出文件名自动包含原控件 ID 或名称</li>
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
import { ref, computed, watch } from 'vue'
import { 
  AlertCircle, 
  FileInput, 
  FileOutput, 
  ArrowRight, 
  Copy, 
  Download,
  FileText,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-vue-next'
import Card from './components/Card.vue'
import Button from './components/Button.vue'
import Textarea from './components/Textarea.vue'
import Alert from './components/Alert.vue'
import { FCLToZL2Converter, ZL2ToFCLConverter } from './converter'
import type { FCLController } from './types/fcl'
import type { ZL2ControlLayout } from './types/zl2'

const conversionMode = ref<'fcl-to-zl2' | 'zl2-to-fcl'>('fcl-to-zl2')
const inputContent = ref('')
const outputContent = ref('')
const inputError = ref('')
const converting = ref(false)
const showSuccess = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const currentId = ref('')
const isDragOver = ref(false)
const conversionStats = ref<{
  layers: number
  buttons: number
  directions: number
  styles: number
} | null>(null)

const fclToZl2 = new FCLToZL2Converter()
const zl2ToFcl = new ZL2ToFCLConverter()

// 监听转换模式变化，自动清空输入和输出，确保内容跟随状态变化
watch(conversionMode, () => {
  clearInput()
})

function convert() {
  inputError.value = ''
  converting.value = true
  
  try {
    const inputJson = JSON.parse(inputContent.value)
    
    if (conversionMode.value === 'fcl-to-zl2') {
      const fclController = inputJson as FCLController
      // 验证基本结构
      if (!fclController.viewGroups || !Array.isArray(fclController.viewGroups)) {
        throw new Error('无效的 FCL 配置：缺少 viewGroups')
      }

      currentId.value = fclController.id || 'unknown'
      const zl2Layout = fclToZl2.convert(fclController)
      
      let jsonStr = JSON.stringify(zl2Layout, null, 2)
      jsonStr = jsonStr.replace(/"(-?\d{10,})"/g, '$1')
      outputContent.value = jsonStr

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
    } else {
      const zl2Layout = inputJson as ZL2ControlLayout
      // 验证基本结构
      if (!zl2Layout.layers || !Array.isArray(zl2Layout.layers)) {
        throw new Error('无效的 ZL2 配置：缺少 layers')
      }

      currentId.value = zl2Layout.info.name.default.toLowerCase().replace(/\s+/g, '_') || 'converted_fcl'
      const fclController = zl2ToFcl.convert(zl2Layout)
      // 使用生成的 FCL ID 作为下载文件名的一部分
      currentId.value = fclController.id
      outputContent.value = JSON.stringify(fclController, null, 2)

      // 统计信息
      const totalButtons = zl2Layout.layers.reduce(
        (sum, l) => sum + (l.normalButtons?.length || 0), 0
      )

      conversionStats.value = {
        layers: zl2Layout.layers.length,
        buttons: totalButtons,
        directions: 0,
        styles: zl2Layout.styles?.length || 0
      }
    }
  } catch (error) {
    inputError.value = error instanceof Error ? error.message : '转换失败'
  } finally {
    converting.value = false
    if (!inputError.value) {
      showSuccess.value = true
      setTimeout(() => {
        showSuccess.value = false
      }, 3000)
    }
  }
}

async function copyOutput() {
  if (!outputContent.value) return
  
  try {
    await navigator.clipboard.writeText(outputContent.value)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

function downloadOutput() {
  if (!outputContent.value) return
  
  const blob = new Blob([outputContent.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const prefix = conversionMode.value === 'fcl-to-zl2' ? 'zl2_' : 'fcl_'
  a.href = url
  a.download = `${prefix}${currentId.value}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function clearInput() {
  inputContent.value = ''
  outputContent.value = ''
  inputError.value = ''
  conversionStats.value = null
  currentId.value = ''
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
      inputContent.value = content
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
      inputContent.value = content
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
  if (conversionMode.value === 'fcl-to-zl2') {
    inputContent.value = JSON.stringify({
      id: "example01",
      name: "示例控制器",
      author: "FCL Team",
      description: "这是一个示例控制器配置",
      version: "1.0.0",
      versionCode: 1,
      controllerVersion: 3,
      buttonStyles: [
        {
          name: "default",
          textColor: -1,
          strokeColor: -12303292,
          fillColor: 0
        }
      ],
      directionStyles: [],
      viewGroups: [
        {
          id: "main",
          name: "主控制",
          visibility: "VISIBLE",
          viewData: {
            buttonList: [
              {
                id: "btn-jump",
                text: "跳跃",
                style: "default",
                baseInfo: {
                  xPosition: 850,
                  yPosition: 700,
                  sizeType: "PERCENTAGE",
                  percentageWidth: { reference: "SCREEN_WIDTH", size: 60 },
                  percentageHeight: { reference: "SCREEN_WIDTH", size: 60 }
                },
                event: {
                  pressEvent: { outputKeycodes: [57] }
                }
              }
            ],
            directionList: [
              {
                id: "dir-move",
                style: "default",
                baseInfo: {
                  xPosition: 150,
                  yPosition: 700,
                  sizeType: "PERCENTAGE",
                  percentageWidth: { reference: "SCREEN_WIDTH", size: 120 },
                  percentageHeight: { reference: "SCREEN_WIDTH", size: 120 }
                },
                event: {
                  upKeycode: 17,
                  downKeycode: 31,
                  leftKeycode: 29,
                  rightKeycode: 32
                }
              }
            ]
          }
        }
      ]
    }, null, 2)
  } else {
    inputContent.value = JSON.stringify({
      info: {
        name: { default: "ZL2 示例配置", matchQueue: [] },
        author: { default: "ZL2 Team", matchQueue: [] },
        description: { default: "这是一个 ZL2 示例配置", matchQueue: [] },
        versionCode: 1,
        versionName: "1.0.0"
      },
      layers: [
        {
          name: "主层",
          uuid: "layer-main",
          hide: false,
          normalButtons: [
            {
              text: { default: "跳跃", matchQueue: [] },
              uuid: "btn-jump",
              position: { x: 8500, y: 7000 },
              buttonSize: {
                type: "percentage",
                widthPercentage: 600,
                heightPercentage: 600,
                widthReference: "screen_width",
                heightReference: "screen_width"
              },
              buttonStyle: "style-default",
              clickEvents: [{ type: "key", key: "GLFW_KEY_SPACE" }]
            }
          ]
        }
      ],
      styles: [
        {
          uuid: "style-default",
          lightStyle: { backgroundColor: -9223372036854775808 }
        }
      ]
    }, null, 2)
  }
}
</script>
