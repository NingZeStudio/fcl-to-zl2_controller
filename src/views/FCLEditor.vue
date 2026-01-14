<template>
  <div class="flex flex-col h-full gap-4">
    <!-- 实验性功能提示 -->
    <Alert variant="destructive" class="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50 py-2 px-4">
      <div class="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-sm">
        <AlertTriangle class="h-4 w-4" />
        <span class="font-bold">注意:</span>
        <span>FCL 编辑器目前为实验性功能，可能存在逻辑错误或不稳定的情况。相关问题概不负责处理。</span>
      </div>
    </Alert>

    <div class="flex flex-col lg:flex-row gap-6 h-[calc(100vh-250px)]">
      <!-- 左侧控制面板 -->
      <Card class="w-full lg:w-80 flex flex-col overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 class="font-semibold flex items-center gap-2">
            <Layers class="h-4 w-4" />
            视图组管理
          </h3>
        </div>
        
        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <div 
            v-for="group in layout.viewGroups" 
            :key="group.id"
            @click="activeGroupId = group.id"
            class="px-3 py-2 rounded-md cursor-pointer flex items-center justify-between group transition-colors"
            :class="activeGroupId === group.id ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'"
          >
            <div class="flex items-center gap-2 min-w-0">
              <input 
                v-if="activeGroupId === group.id"
                v-model="group.name"
                class="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium w-full"
                @click.stop
              />
              <span v-else class="truncate text-sm font-medium">{{ group.name }}</span>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click.stop="removeGroup(group.id)" class="p-1 hover:text-red-500" title="删除组">
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          <Button @click="addGroup" variant="ghost" size="sm" class="w-full mt-2 border-dashed border border-slate-300 dark:border-slate-600">
            <Plus class="h-3 w-3 mr-1" />
            添加视图组
          </Button>
        </div>

        <div class="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
          <div>
            <h3 class="font-semibold flex items-center gap-2 mb-3">
              <MousePointer2 class="h-4 w-4" />
              当前组按钮 ({{ activeGroup?.viewData.buttonList.length || 0 }})
            </h3>
            <div class="space-y-1 max-h-32 overflow-y-auto pr-1">
              <div 
                v-for="btn in activeGroup?.viewData.buttonList" 
                :key="btn.id"
                @click="activeButtonId = btn.id"
                class="px-3 py-1.5 rounded text-xs cursor-pointer flex items-center justify-between group transition-colors"
                :class="activeButtonId === btn.id ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'"
              >
                <span class="truncate font-medium">{{ btn.text || '未命名按钮' }}</span>
                <button @click.stop="removeButton(btn.id)" class="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity">
                  <Trash2 class="h-3 w-3" />
                </button>
              </div>
            </div>
            <Button @click="addButton" variant="outline" size="sm" class="w-full mt-3" :disabled="!activeGroupId">
              <Plus class="h-3 w-3 mr-1" />
              新建按钮
            </Button>
          </div>

          <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 class="font-semibold flex items-center gap-2 mb-3">
              <Maximize class="h-4 w-4 rotate-45" />
              当前组方向键 ({{ activeGroup?.viewData.directionList.length || 0 }})
            </h3>
            <div class="space-y-1 max-h-32 overflow-y-auto pr-1">
              <div 
                v-for="dir in activeGroup?.viewData.directionList" 
                :key="dir.id"
                @click="activeDirectionId = dir.id"
                class="px-3 py-1.5 rounded text-xs cursor-pointer flex items-center justify-between group transition-colors"
                :class="activeDirectionId === dir.id ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'"
              >
                <span class="truncate font-medium">{{ dir.id.substring(0, 8) }} (方向键)</span>
                <button @click.stop="removeDirection(dir.id)" class="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-opacity">
                  <Trash2 class="h-3 w-3" />
                </button>
              </div>
            </div>
            <Button @click="addDirection" variant="outline" size="sm" class="w-full mt-3" :disabled="!activeGroupId">
              <Plus class="h-3 w-3 mr-1" />
              新建方向键
            </Button>
          </div>
        </div>
      </Card>

      <!-- 中间画布 -->
      <Card class="flex-1 relative bg-slate-200 dark:bg-slate-900 overflow-hidden flex items-center justify-center p-4">
        <div 
          ref="canvasRef"
          class="bg-white dark:bg-slate-950 shadow-2xl relative border border-slate-300 dark:border-slate-700 overflow-hidden"
          :style="{ 
            aspectRatio: canvasSettings.ratio,
            width: '100%', 
            maxWidth: '1000px', 
            height: 'auto', 
            backgroundColor: canvasSettings.backgroundColor,
            backgroundImage: canvasSettings.backgroundImage ? `url(${canvasSettings.backgroundImage})` : (canvasSettings.gridVisible ? 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)' : 'none'),
            backgroundSize: canvasSettings.backgroundImage ? 'cover' : '20px 20px',
            backgroundPosition: 'center'
          }"
          @mousedown="handleCanvasMouseDown"
        >
          <!-- 按钮渲染 -->
          <div 
            v-for="btn in activeGroup?.viewData.buttonList" 
            :key="btn.id"
            class="absolute border-2 transition-shadow cursor-move flex items-center justify-center overflow-hidden text-center p-1 select-none"
            :class="[
              activeButtonId === btn.id ? 'border-blue-500 shadow-lg z-10' : 'border-slate-400 z-0'
            ]"
            :style="getButtonStyle(btn)"
            @mousedown.stop="handleButtonMouseDown($event, btn)"
          >
            <span class="font-bold pointer-events-none break-all">{{ btn.text }}</span>
          </div>

          <!-- 方向键渲染 -->
          <div 
            v-for="dir in activeGroup?.viewData.directionList" 
            :key="dir.id"
            class="absolute border-2 transition-shadow cursor-move select-none"
            :class="[
              activeDirectionId === dir.id ? 'border-blue-500 shadow-lg z-10' : 'border-slate-400 z-0'
            ]"
            :style="getDirectionStyle(dir)"
            @mousedown.stop="handleDirectionMouseDown($event, dir)"
          >
            <div class="relative w-full h-full flex items-center justify-center">
              <div class="absolute w-[30%] h-[30%] border-2 border-dashed border-slate-400/50 rounded-full"></div>
              <div class="absolute w-full h-px bg-slate-400/30"></div>
              <div class="absolute h-full w-px bg-slate-400/30"></div>
              <div class="font-bold text-[10px] text-slate-500/50">JOYSTICK</div>
            </div>
          </div>

          <!-- 画布坐标参考线 -->
           <div v-if="activeButton || activeDirection" class="absolute inset-0 pointer-events-none opacity-20">
             <div class="absolute w-full h-px bg-blue-500" :style="{ top: ((activeButton?.baseInfo.yPosition || activeDirection?.yPosition || 0) / 10) + '%' }"></div>
             <div class="absolute h-full w-px bg-blue-500" :style="{ left: ((activeButton?.baseInfo.xPosition || activeDirection?.xPosition || 0) / 10) + '%' }"></div>
             <div class="absolute text-[10px] text-blue-600 font-mono" :style="{ left: ((activeButton?.baseInfo.xPosition || activeDirection?.xPosition || 0) / 10) + '%', top: ((activeButton?.baseInfo.yPosition || activeDirection?.yPosition || 0) / 10) + '%', transform: 'translate(4px, 4px)' }">
               ({{ activeButton?.baseInfo.xPosition || activeDirection?.xPosition }}, {{ activeButton?.baseInfo.yPosition || activeDirection?.yPosition }})
             </div>
           </div>
        </div>
      </Card>

      <!-- 右侧属性面板 -->
      <Card class="w-full lg:w-96 flex flex-col overflow-hidden">
        <!-- 标签页切换 -->
        <div class="flex border-b border-slate-200 dark:border-slate-700">
          <button 
            @click="activeTab = 'properties'"
            class="flex-1 py-3 text-xs font-bold transition-colors border-b-2"
            :class="activeTab === 'properties' ? 'border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent text-slate-500 hover:text-slate-700'"
          >
            <div class="flex items-center justify-center gap-1">
              <Settings2 class="h-3.5 w-3.5" />
              属性
            </div>
          </button>
          <button 
            @click="activeTab = 'styles'"
            class="flex-1 py-3 text-xs font-bold transition-colors border-b-2"
            :class="activeTab === 'styles' ? 'border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent text-slate-500 hover:text-slate-700'"
          >
            <div class="flex items-center justify-center gap-1">
              <Palette class="h-3.5 w-3.5" />
              样式
            </div>
          </button>
          <button 
            @click="activeTab = 'canvas'"
            class="flex-1 py-3 text-xs font-bold transition-colors border-b-2"
            :class="activeTab === 'canvas' ? 'border-blue-500 text-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-transparent text-slate-500 hover:text-slate-700'"
          >
            <div class="flex items-center justify-center gap-1">
              <Monitor class="h-3.5 w-3.5" />
              画布
            </div>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <!-- 按钮属性面板 -->
          <div v-if="activeTab === 'properties'" class="space-y-6">
            <div v-if="activeButton" class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <!-- 基本信息 -->
              <section class="space-y-3">
                <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
                  基本信息
                </h4>
                <div class="space-y-3">
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-slate-500">显示文本</label>
                    <input v-model="activeButton.text" class="w-full px-3 py-2 text-sm border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-slate-500">引用样式</label>
                    <select v-model="activeButton.style" class="w-full px-3 py-2 text-sm border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
                      <option v-for="s in layout.buttonStyles" :key="s.name" :value="s.name">{{ s.name }}</option>
                    </select>
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-slate-500">可见性类型</label>
                    <div class="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      <button 
                        v-for="v in [{id:'ALWAYS', n:'始终'}, {id:'IN_GAME', n:'游戏'}, {id:'MENU', n:'菜单'}]" 
                        :key="v.id"
                        @click="activeButton.baseInfo.visibilityType = v.id as any"
                        class="py-1.5 text-[10px] font-bold rounded-md transition-all"
                        :class="activeButton.baseInfo.visibilityType === v.id ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'"
                      >
                        {{ v.n }}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 布局定位 -->
              <section class="space-y-4">
                <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
                  布局与尺寸
                </h4>
                <div class="space-y-4">
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-xs font-medium text-slate-500">X 轴位置</label>
                      <span class="text-xs font-mono font-bold text-blue-600">{{ activeButton.baseInfo.xPosition }}</span>
                    </div>
                    <input type="range" min="0" max="1000" v-model.number="activeButton.baseInfo.xPosition" class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div class="space-y-2">
                    <div class="flex justify-between items-center">
                      <label class="text-xs font-medium text-slate-500">Y 轴位置</label>
                      <span class="text-xs font-mono font-bold text-blue-600">{{ activeButton.baseInfo.yPosition }}</span>
                    </div>
                    <input type="range" min="0" max="1000" v-model.number="activeButton.baseInfo.yPosition" class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                </div>

                <div class="space-y-3 pt-2">
                  <div class="space-y-1.5">
                    <label class="text-xs font-medium text-slate-500">尺寸模式</label>
                    <div class="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                      <button 
                        @click="activeButton.baseInfo.sizeType = 'PERCENTAGE'"
                        class="py-1.5 text-[10px] font-bold rounded-md transition-all"
                        :class="activeButton.baseInfo.sizeType === 'PERCENTAGE' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'"
                      >
                        百分比
                      </button>
                      <button 
                        @click="activeButton.baseInfo.sizeType = 'ABSOLUTE'"
                        class="py-1.5 text-[10px] font-bold rounded-md transition-all"
                        :class="activeButton.baseInfo.sizeType === 'ABSOLUTE' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'"
                      >
                        绝对值 (DP)
                      </button>
                    </div>
                  </div>

                  <!-- 百分比尺寸编辑 -->
                  <div v-if="activeButton.baseInfo.sizeType === 'PERCENTAGE'" class="space-y-4">
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-xs font-medium text-slate-500">宽度 (千分比)</label>
                        <span class="text-xs font-mono font-bold text-blue-600">{{ activeButton.baseInfo.percentageWidth!.size }}</span>
                      </div>
                      <input type="range" min="1" max="1000" v-model.number="activeButton.baseInfo.percentageWidth!.size" class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-xs font-medium text-slate-500">高度 (千分比)</label>
                        <span class="text-xs font-mono font-bold text-blue-600">{{ activeButton.baseInfo.percentageHeight!.size }}</span>
                      </div>
                      <input type="range" min="1" max="1000" v-model.number="activeButton.baseInfo.percentageHeight!.size" class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  </div>

                  <!-- 绝对尺寸编辑 -->
                  <div v-else class="space-y-4">
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-xs font-medium text-slate-500">宽度 (DP)</label>
                        <span class="text-xs font-mono font-bold text-blue-600">{{ activeButton.baseInfo.absoluteWidth }}</span>
                      </div>
                      <input type="range" min="1" max="500" v-model.number="activeButton.baseInfo.absoluteWidth" class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div class="space-y-2">
                      <div class="flex justify-between items-center">
                        <label class="text-xs font-medium text-slate-500">高度 (DP)</label>
                        <span class="text-xs font-mono font-bold text-blue-600">{{ activeButton.baseInfo.absoluteHeight }}</span>
                      </div>
                      <input type="range" min="1" max="500" v-model.number="activeButton.baseInfo.absoluteHeight" class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  </div>
                </div>
              </section>

              <!-- 事件配置 -->
              <section class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
                    事件与交互
                  </h4>
                  <div class="flex gap-2">
                    <label class="flex items-center gap-1.5 cursor-pointer group">
                      <input type="checkbox" v-model="activeButton.event.pointerFollow" class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span class="text-[10px] text-slate-500 group-hover:text-blue-600 transition-colors">指针跟随</span>
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer group">
                      <input type="checkbox" v-model="activeButton.event.Movable" class="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <span class="text-[10px] text-slate-500 group-hover:text-blue-600 transition-colors">可移动</span>
                    </label>
                  </div>
                </div>

                <div class="space-y-2">
                  <div 
                    v-for="evtKey in ['pressEvent', 'longPressEvent', 'clickEvent', 'doubleClickEvent']" 
                    :key="evtKey"
                    class="border rounded-lg overflow-hidden dark:border-slate-700 transition-all hover:border-blue-300 dark:hover:border-blue-700"
                    :class="{ 'border-blue-500 shadow-md': expandedEvent === evtKey }"
                  >
                    <button 
                      @click="expandedEvent = expandedEvent === evtKey ? '' : evtKey"
                      class="w-full px-3 py-2.5 text-xs font-bold flex items-center justify-between transition-colors"
                      :class="expandedEvent === evtKey ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'"
                    >
                      <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full" :class="expandedEvent === evtKey ? 'bg-white' : 'bg-blue-500'"></div>
                        {{ getEventName(evtKey) }}
                      </div>
                      <ChevronDown class="h-3 w-3 transition-transform" :class="{ 'rotate-180': expandedEvent === evtKey }" />
                    </button>
                    
                    <div v-if="expandedEvent === evtKey" class="p-3 space-y-4 bg-white dark:bg-slate-900 border-t dark:border-slate-700">
                      <div class="grid grid-cols-2 gap-2">
                        <button 
                          @click="(activeButton.event as any)[evtKey].autoKeep = !(activeButton.event as any)[evtKey].autoKeep"
                          class="flex items-center justify-center gap-2 p-2 border rounded-lg transition-all text-[10px] font-bold"
                          :class="(activeButton.event as any)[evtKey].autoKeep ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'"
                        >
                          <RotateCcw class="h-3 w-3" />
                          开关模式
                        </button>
                        <button 
                          @click="(activeButton.event as any)[evtKey].input = !(activeButton.event as any)[evtKey].input"
                          class="flex items-center justify-center gap-2 p-2 border rounded-lg transition-all text-[10px] font-bold"
                          :class="(activeButton.event as any)[evtKey].input ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'"
                        >
                          <Type class="h-3 w-3" />
                          文本输入
                        </button>
                      </div>

                      <div class="space-y-2">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">输出键码</label>
                        <input 
                          :value="(activeButton.event as any)[evtKey].outputKeycodes.join(', ')"
                          @input="e => updateEventKeycodes(evtKey, (e.target as HTMLInputElement).value)"
                          placeholder="例如: 57, 17"
                          class="w-full px-3 py-2 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div v-if="(activeButton.event as any)[evtKey].input" class="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">文本内容</label>
                        <input 
                          v-model="(activeButton.event as any)[evtKey].outputText"
                          placeholder="输入触发的文本..."
                          class="w-full px-3 py-2 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 操作 -->
              <div class="pt-4 flex flex-col gap-2">
                <Button @click="duplicateButton" variant="outline" size="sm" class="w-full border-blue-200 hover:bg-blue-50 text-blue-600 dark:border-blue-900 dark:hover:bg-blue-950">
                  <Copy class="h-3.5 w-3.5 mr-2" />
                  克隆当前按钮
                </Button>
                <Button @click="removeButton(activeButton.id)" variant="ghost" size="sm" class="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Trash2 class="h-3.5 w-3.5 mr-2" />
                  删除当前按钮
                </Button>
              </div>
            </div>

            <!-- 方向键属性编辑面板 -->
            <div v-else-if="activeDirection" class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <section class="space-y-4">
                <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
                  基本信息 (Joystick)
                </h4>
                
                <div class="grid grid-cols-2 gap-3">
                  <div class="space-y-1.5">
                    <label class="text-[10px] text-slate-500 font-bold">X 坐标 (0-1000)</label>
                    <input type="number" v-model.number="activeDirection.xPosition" class="w-full px-3 py-2 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] text-slate-500 font-bold">Y 坐标 (0-1000)</label>
                    <input type="number" v-model.number="activeDirection.yPosition" class="w-full px-3 py-2 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] text-slate-500 font-bold">宽度</label>
                    <input type="number" v-model.number="activeDirection.width" class="w-full px-3 py-2 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div class="space-y-1.5">
                    <label class="text-[10px] text-slate-500 font-bold">高度</label>
                    <input type="number" v-model.number="activeDirection.height" class="w-full px-3 py-2 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <label class="text-[10px] text-slate-500 font-bold">引用样式</label>
                  <select v-model="activeDirection.style" class="w-full px-3 py-2 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option v-for="s in layout.buttonStyles" :key="s.name" :value="s.name">{{ s.name }}</option>
                  </select>
                </div>
              </section>

              <section class="space-y-4">
                <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
                  事件配置 (8-Directions)
                </h4>
                
                <div class="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  <div v-for="evtKey in ['upEvent', 'downEvent', 'leftEvent', 'rightEvent', 'upLeftEvent', 'upRightEvent', 'downLeftEvent', 'downRightEvent']" :key="evtKey" class="border rounded-lg dark:border-slate-700 overflow-hidden">
                    <div 
                      @click="expandedEvent = (expandedEvent === evtKey ? '' : evtKey)"
                      class="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <span class="text-xs font-bold">{{ getDirectionEventName(evtKey) }}</span>
                      <ChevronDown class="h-3.5 w-3.5 transition-transform" :class="{ 'rotate-180': expandedEvent === evtKey }" />
                    </div>
                    
                    <div v-if="expandedEvent === evtKey" class="p-3 space-y-4 bg-white dark:bg-slate-900 border-t dark:border-slate-700">
                      <div class="space-y-2">
                        <label class="text-[10px] font-bold text-slate-400 uppercase">输出键码</label>
                        <input 
                          :value="(activeDirection as any)[evtKey].outputKeycodes.join(', ')"
                          @input="e => updateDirectionEventKeycodes(evtKey, (e.target as HTMLInputElement).value)"
                          placeholder="例如: 57, 17"
                          class="w-full px-3 py-2 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div class="pt-4">
                <Button @click="removeDirection(activeDirection.id)" variant="ghost" size="sm" class="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <Trash2 class="h-3.5 w-3.5 mr-2" />
                  删除当前方向键
                </Button>
              </div>
            </div>
            
            <div v-else class="h-64 flex flex-col items-center justify-center text-slate-400 text-sm italic gap-3">
              <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center animate-pulse">
                <MousePointer2 class="h-8 w-8 opacity-20" />
              </div>
              请选择一个按钮或方向键进行编辑
            </div>
          </div>

          <!-- 样式管理面板 -->
          <div v-else-if="activeTab === 'styles'" class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div class="flex items-center justify-between">
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
                样式列表
              </h4>
              <Button @click="addNewStyle" variant="outline" size="xs" class="h-7 text-[10px] font-bold">
                <Plus class="h-3 w-3 mr-1" />
                新建样式
              </Button>
            </div>

            <div class="space-y-2">
              <div 
                v-for="style in layout.buttonStyles" 
                :key="style.name"
                class="border rounded-xl dark:border-slate-700 overflow-hidden transition-all"
                :class="{ 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900': editingStyleName === style.name }"
              >
                <div 
                  @click="editingStyleName = style.name"
                  class="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-8 h-8 rounded-lg shadow-inner border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden"
                      :style="{ backgroundColor: fclToRgba(style.fillColor), borderColor: fclToRgba(style.strokeColor) }"
                    >
                      <span :style="{ color: fclToRgba(style.textColor), fontSize: '10px' }">Ab</span>
                    </div>
                    <span class="text-sm font-bold">{{ style.name }}</span>
                  </div>
                  <button v-if="layout.buttonStyles.length > 1" @click.stop="removeStyle(style.name)" class="p-1.5 hover:text-red-500 transition-colors">
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>

                <!-- 样式编辑详情 -->
                <div v-if="editingStyleName === style.name" class="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t dark:border-slate-700 space-y-6">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">样式名称</label>
                    <input v-model="style.name" class="w-full px-3 py-2 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>

                  <!-- 颜色预设 -->
                  <div class="space-y-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase">快速预设颜色</label>
                    <div class="flex flex-wrap gap-1.5">
                      <button 
                        v-for="p in PRESET_COLORS" 
                        :key="p.name"
                        @click="style.fillColor = p.value"
                        class="w-6 h-6 rounded-md border border-slate-200 dark:border-slate-700 transition-transform hover:scale-110 shadow-sm"
                        :style="{ backgroundColor: fclToRgba(p.value) }"
                        :title="p.name"
                      ></button>
                    </div>
                  </div>

                  <!-- 常规状态 -->
                  <div class="space-y-4">
                    <label class="text-[10px] font-bold text-blue-500 uppercase flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                      常规状态 (Normal)
                    </label>
                    <div class="grid grid-cols-2 gap-3">
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-500 font-bold">文字颜色</label>
                        <div class="flex gap-1.5 items-center">
                          <input type="color" :value="fclToHex(style.textColor).substring(0, 7)" @input="e => updateStyleColor(style, 'textColor', (e.target as HTMLInputElement).value)" class="w-8 h-8 p-0.5 border rounded-md bg-white dark:bg-slate-800 cursor-pointer" />
                          <input :value="fclToHex(style.textColor)" @change="e => style.textColor = hexToFcl((e.target as HTMLInputElement).value)" class="flex-1 px-1.5 py-1.5 text-[9px] border rounded font-mono bg-white dark:bg-slate-800" />
                        </div>
                      </div>
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-500 font-bold">背景颜色</label>
                        <div class="flex gap-1.5 items-center">
                          <input type="color" :value="fclToHex(style.fillColor).substring(0, 7)" @input="e => updateStyleColor(style, 'fillColor', (e.target as HTMLInputElement).value)" class="w-8 h-8 p-0.5 border rounded-md bg-white dark:bg-slate-800 cursor-pointer" />
                          <input :value="fclToHex(style.fillColor)" @change="e => style.fillColor = hexToFcl((e.target as HTMLInputElement).value)" class="flex-1 px-1.5 py-1.5 text-[9px] border rounded font-mono bg-white dark:bg-slate-800" />
                        </div>
                      </div>
                    </div>

                    <div class="space-y-4">
                      <div class="space-y-2">
                        <div class="flex justify-between items-center">
                          <label class="text-[10px] text-slate-500 font-bold">字体大小</label>
                          <span class="text-[10px] font-mono font-bold text-blue-600">{{ style.textSize }}px</span>
                        </div>
                        <input type="range" min="2" max="50" v-model.number="style.textSize" class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                      <div class="space-y-2">
                        <div class="flex justify-between items-center">
                          <label class="text-[10px] text-slate-500 font-bold">圆角半径</label>
                          <span class="text-[10px] font-mono font-bold text-blue-600">{{ style.cornerRadius }}px</span>
                        </div>
                        <input type="range" min="0" max="100" v-model.number="style.cornerRadius" class="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                    </div>
                  </div>

                  <!-- 按下状态 -->
                  <div class="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <label class="text-[10px] font-bold text-amber-500 uppercase flex items-center gap-2">
                      <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                      按下状态 (Pressed)
                    </label>
                    <div class="grid grid-cols-2 gap-3">
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-500 font-bold">文字颜色</label>
                        <div class="flex gap-1.5 items-center">
                          <input type="color" :value="fclToHex(style.textColorPressed).substring(0, 7)" @input="e => updateStyleColor(style, 'textColorPressed', (e.target as HTMLInputElement).value)" class="w-8 h-8 p-0.5 border rounded-md bg-white dark:bg-slate-800 cursor-pointer" />
                          <input :value="fclToHex(style.textColorPressed)" @change="e => style.textColorPressed = hexToFcl((e.target as HTMLInputElement).value)" class="flex-1 px-1.5 py-1.5 text-[9px] border rounded font-mono bg-white dark:bg-slate-800" />
                        </div>
                      </div>
                      <div class="space-y-1.5">
                        <label class="text-[10px] text-slate-500 font-bold">背景颜色</label>
                        <div class="flex gap-1.5 items-center">
                          <input type="color" :value="fclToHex(style.fillColorPressed).substring(0, 7)" @input="e => updateStyleColor(style, 'fillColorPressed', (e.target as HTMLInputElement).value)" class="w-8 h-8 p-0.5 border rounded-md bg-white dark:bg-slate-800 cursor-pointer" />
                          <input :value="fclToHex(style.fillColorPressed)" @change="e => style.fillColorPressed = hexToFcl((e.target as HTMLInputElement).value)" class="flex-1 px-1.5 py-1.5 text-[9px] border rounded font-mono bg-white dark:bg-slate-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 画布设置面板 -->
          <div v-else-if="activeTab === 'canvas'" class="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <section class="space-y-4">
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
                比例与显示
              </h4>
              <div class="space-y-3">
                <label class="text-xs font-medium text-slate-500">预设比例</label>
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    v-for="r in PRESET_RATIOS" 
                    :key="r.name"
                    @click="canvasSettings.ratio = r.value"
                    class="py-2 text-[10px] font-bold border rounded-lg transition-all"
                    :class="Math.abs(canvasSettings.ratio - r.value) < 0.01 ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'hover:bg-slate-50 dark:hover:bg-slate-800'"
                  >
                    {{ r.name }}
                  </button>
                </div>
                <div class="flex items-center gap-2 pt-2">
                  <label class="text-xs font-medium text-slate-500 whitespace-nowrap">自定义:</label>
                  <input type="number" v-model.number="canvasSettings.ratio" step="0.1" class="w-full px-3 py-1.5 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700" />
                </div>
              </div>

              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <label class="text-xs font-medium text-slate-500">预览透明度</label>
                  <span class="text-xs font-mono font-bold text-blue-600">{{ canvasSettings.opacity }}%</span>
                </div>
                <input type="range" min="10" max="100" v-model.number="canvasSettings.opacity" class="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>

              <div class="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer" @click="canvasSettings.gridVisible = !canvasSettings.gridVisible">
                <div class="flex items-center gap-2">
                  <Maximize class="h-4 w-4 text-blue-500" />
                  <span class="text-xs font-bold">显示辅助网格</span>
                </div>
                <div class="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full relative transition-colors" :class="{ 'bg-blue-500': canvasSettings.gridVisible }">
                  <div class="w-3 h-3 bg-white rounded-full absolute top-0.5 left-0.5 transition-transform" :style="{ transform: canvasSettings.gridVisible ? 'translateX(16px)' : 'translateX(0)' }"></div>
                </div>
              </div>
            </section>

            <section class="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              <h4 class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <div class="w-1 h-3 bg-blue-500 rounded-full"></div>
                背景设置
              </h4>
              <div class="space-y-3">
                <label class="text-xs font-medium text-slate-500">画布背景颜色</label>
                <div class="flex gap-2 items-center">
                  <input type="color" v-model="canvasSettings.backgroundColor" class="w-10 h-10 p-1 border rounded-lg bg-white dark:bg-slate-800 cursor-pointer" />
                  <input v-model="canvasSettings.backgroundColor" class="flex-1 px-3 py-2 text-xs border rounded-md font-mono bg-white dark:bg-slate-800" />
                </div>
              </div>

              <div class="space-y-3">
                <label class="text-xs font-medium text-slate-500">上传背景图</label>
                <div v-if="canvasSettings.backgroundImage" class="relative group rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg">
                  <img :src="canvasSettings.backgroundImage" class="w-full h-32 object-cover" />
                  <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button @click="bgInputRef?.click()" size="xs" variant="outline" class="bg-white/20 border-white text-white hover:bg-white/40">更换</Button>
                    <Button @click="clearBgImage" size="xs" variant="ghost" class="text-white hover:bg-red-500/50">移除</Button>
                  </div>
                </div>
                <div 
                  v-else
                  @click="bgInputRef?.click()"
                  class="h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
                >
                  <ImageIcon class="h-8 w-8 text-slate-400" />
                  <span class="text-xs font-bold text-slate-500">点击上传背景图 (PNG/JPG)</span>
                </div>
                <input ref="bgInputRef" type="file" accept="image/*" class="hidden" @change="handleBgUpload" />
              </div>
            </section>
          </div>
        </div>
      </Card>
    </div>

    <!-- 底部操作栏 -->
    <div class="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span class="text-xs font-bold text-slate-500">已自动保存到本地</span>
        </div>
        <div class="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>
        <div class="flex items-center gap-4">
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400 font-bold uppercase">控制器名称</span>
            <input v-model="layout.name" class="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-slate-700 dark:text-slate-200" />
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <Button @click="triggerImport" variant="outline" class="h-10 px-4 font-bold border-blue-200 hover:bg-blue-50 text-blue-600">
          <Upload class="h-4 w-4 mr-2" />
          导入配置
        </Button>
        <Button @click="resetLayout" variant="ghost" class="h-10 px-4 font-bold text-slate-500 hover:text-red-500">
          <RotateCcw class="h-4 w-4 mr-2" />
          重置布局
        </Button>
        <Button @click="exportJson" variant="default" class="h-10 px-6 font-bold shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
          <Download class="h-4 w-4 mr-2" />
          导出布局
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { 
  Plus, 
  Trash2, 
  Layers, 
  MousePointer2, 
  Settings2, 
  Download,
  Copy,
  Upload,
  Palette,
  ChevronDown,
  Monitor,
  Image as ImageIcon,
  RotateCcw,
  Maximize,
  AlertTriangle
} from 'lucide-vue-next'
import Card from '../components/Card.vue'
import Button from '../components/Button.vue'
import Alert from '../components/Alert.vue'
import type { FCLController, FCLButton, FCLViewGroup, FCLButtonStyle } from '../types/fcl'
import { fclToHex, hexToFcl, fclToRgba } from '../utils/color'

// 预设颜色
const PRESET_COLORS = [
  { name: '透明', value: 0 },
  { name: '白色', value: -1 },
  { name: '黑色', value: -16777216 },
  { name: '灰色', value: -12303292 },
  { name: '红色', value: -65536 },
  { name: '蓝色', value: -16776961 },
  { name: '黄色', value: -256 },
  { name: '绿色', value: -16711936 },
  { name: 'ZL2 蓝', value: -16744193 },
  { name: 'ZL2 灰', value: -14211289 },
]

// 预设比例
const PRESET_RATIOS = [
  { name: '16:9', value: 16/9 },
  { name: '16:10', value: 16/10 },
  { name: '4:3', value: 4/3 },
  { name: '21:9', value: 21/9 },
  { name: '手机竖屏', value: 9/16 },
]

const layout = ref<FCLController>({
  id: Math.random().toString(36).substring(2, 10),
  name: '新建 FCL 布局',
  version: '1.0.0',
  versionCode: 1,
  author: 'FCL Editor',
  description: '由 FCL 转换器在线编辑器创建',
  controllerVersion: 3,
  buttonStyles: [{
    name: 'default',
    textColor: -1,
    textSize: 14,
    strokeWidth: 1,
    strokeColor: -12303292,
    cornerRadius: 8,
    fillColor: -16777216,
    textColorPressed: -1,
    textSizePressed: 14,
    strokeWidthPressed: 1,
    strokeColorPressed: -12303292,
    cornerRadiusPressed: 8,
    fillColorPressed: -12303292
  }],
  directionStyles: [],
  viewGroups: [{
    id: 'default_group',
    name: '默认视图组',
    visibility: 'VISIBLE',
    viewData: {
      buttonList: [],
      directionList: []
    }
  }]
})

// 画布设置
const activeTab = ref<'properties' | 'styles' | 'canvas'>('properties')
const activeGroupId = ref('default_group')
const activeButtonId = ref('')
const activeDirectionId = ref('')
const editingStyleName = ref('default')
const expandedEvent = ref('pressEvent')
const canvasRef = ref<HTMLElement | null>(null)
const importInputRef = ref<HTMLInputElement | null>(null)
const bgInputRef = ref<HTMLInputElement | null>(null)

// 画布设置
const canvasSettings = ref({
  ratio: 16/9,
  backgroundColor: '#0f172a',
  backgroundImage: '',
  gridVisible: true,
  gridSnap: true,
  gridSize: 20, // 千分比单位
  opacity: 100
})

const activeGroup = computed(() => 
  layout.value.viewGroups.find(g => g.id === activeGroupId.value)
)

const activeButton = computed(() => {
  if (!activeGroup.value) return null
  return activeGroup.value.viewData.buttonList.find(b => b.id === activeButtonId.value)
})

const activeDirection = computed(() => {
  if (!activeGroup.value) return null
  return activeGroup.value.viewData.directionList.find(d => d.id === activeDirectionId.value)
})

// 监听活动元素切换，同步 Tab
watch([activeButtonId, activeDirectionId], ([newBtn, newDir]) => {
  if (newBtn || newDir) {
    activeTab.value = 'properties'
    if (newBtn) activeDirectionId.value = ''
    if (newDir) activeButtonId.value = ''
  }
})

// 持久化存储
function saveToLocal() {
  localStorage.setItem('fcl_editor_layout', JSON.stringify(layout.value))
  localStorage.setItem('fcl_editor_canvas', JSON.stringify(canvasSettings.value))
}

function resetLayout() {
  if (!confirm('确定要重置当前布局吗？所有未导出的更改将丢失。')) return
  
  localStorage.removeItem('fcl_editor_layout')
  localStorage.removeItem('fcl_editor_canvas')
  
  location.reload()
}

function loadFromLocal() {
  const savedLayout = localStorage.getItem('fcl_editor_layout')
  const savedCanvas = localStorage.getItem('fcl_editor_canvas')
  if (savedLayout) {
    try {
      layout.value = JSON.parse(savedLayout)
      if (layout.value.viewGroups.length > 0) {
        activeGroupId.value = layout.value.viewGroups[0].id
      }
    } catch (e) {
      console.error('加载本地布局失败', e)
    }
  }
  if (savedCanvas) {
    try {
      canvasSettings.value = JSON.parse(savedCanvas)
    } catch (e) {
      console.error('加载本地画布设置失败', e)
    }
  }
}

watch([layout, canvasSettings], () => {
  saveToLocal()
}, { deep: true })

// 处理背景图片上传
function handleBgUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (event) => {
    canvasSettings.value.backgroundImage = event.target?.result as string
  }
  reader.readAsDataURL(file)
}

function clearBgImage() {
  canvasSettings.value.backgroundImage = ''
}

// 样式计算
function getButtonStyle(btn: FCLButton) {
  const style = layout.value.buttonStyles.find(s => s.name === btn.style) || layout.value.buttonStyles[0]
  
  return {
    left: `${btn.baseInfo.xPosition / 10}%`,
    top: `${btn.baseInfo.yPosition / 10}%`,
    width: btn.baseInfo.sizeType === 'PERCENTAGE' 
      ? `${btn.baseInfo.percentageWidth!.size / 10}%` 
      : `${btn.baseInfo.absoluteWidth}px`,
    height: btn.baseInfo.sizeType === 'PERCENTAGE' 
      ? `${btn.baseInfo.percentageHeight!.size / 10}%` 
      : `${btn.baseInfo.absoluteHeight}px`,
    transform: 'translate(-50%, -50%)',
    backgroundColor: fclToRgba(style?.fillColor || 0),
    border: `${style?.strokeWidth || 1}px solid ${fclToRgba(style?.strokeColor || 0)}`,
    color: fclToRgba(style?.textColor || -1),
    borderRadius: `${style?.cornerRadius || 4}px`,
    fontSize: `${(style?.textSize || 14) * 0.8}px`,
    opacity: canvasSettings.value.opacity / 100
  }
}

function getDirectionStyle(dir: FCLDirection) {
  const style = layout.value.buttonStyles.find(s => s.name === dir.style) || layout.value.buttonStyles[0]
  const w = (dir.baseInfo.sizeType === 'PERCENTAGE' ? dir.baseInfo.percentageWidth?.size : dir.baseInfo.absoluteWidth) || 200
  const h = (dir.baseInfo.sizeType === 'PERCENTAGE' ? dir.baseInfo.percentageHeight?.size : dir.baseInfo.absoluteHeight) || 200
  
  return {
    left: `${dir.baseInfo.xPosition / 10}%`,
    top: `${dir.baseInfo.yPosition / 10}%`,
    width: `${w / 10}%`,
    height: `${h / 10}%`,
    transform: 'translate(-50%, -50%)',
    backgroundColor: fclToRgba(style?.fillColor || 0, 0.4),
    border: `${style?.strokeWidth || 1}px solid ${fclToRgba(style?.strokeColor || 0)}`,
    borderRadius: '50%',
    opacity: canvasSettings.value.opacity / 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}

// 拖拽逻辑
let isDragging = false
let dragTarget: any = null
let dragType: 'button' | 'direction' = 'button'
let startX = 0
let startY = 0
let initialX = 0
let initialY = 0

function handleButtonMouseDown(e: MouseEvent, btn: FCLButton) {
  activeButtonId.value = btn.id
  isDragging = true
  dragTarget = btn
  dragType = 'button'
  startX = e.clientX
  startY = e.clientY
  initialX = btn.baseInfo.xPosition
  initialY = btn.baseInfo.yPosition

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

function handleDirectionMouseDown(e: MouseEvent, dir: FCLDirection) {
  activeDirectionId.value = dir.id
  isDragging = true
  dragTarget = dir
  dragType = 'direction'
  startX = e.clientX
  startY = e.clientY
  initialX = dir.baseInfo.xPosition
  initialY = dir.baseInfo.yPosition

  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging || !dragTarget || !canvasRef.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const dx = ((e.clientX - startX) / rect.width) * 1000
  const dy = ((e.clientY - startY) / rect.height) * 1000

  let newX = Math.round(initialX + dx)
  let newY = Math.round(initialY + dy)

  // 网格吸附
  if (canvasSettings.value.gridSnap) {
    newX = Math.round(newX / canvasSettings.value.gridSize) * canvasSettings.value.gridSize
    newY = Math.round(newY / canvasSettings.value.gridSize) * canvasSettings.value.gridSize
  }

  newX = Math.max(0, Math.min(1000, newX))
  newY = Math.max(0, Math.min(1000, newY))

  if (dragType === 'button') {
    dragTarget.baseInfo.xPosition = newX
    dragTarget.baseInfo.yPosition = newY
  } else {
    dragTarget.baseInfo.xPosition = newX
    dragTarget.baseInfo.yPosition = newY
  }
}

function handleMouseUp() {
  isDragging = false
  dragTarget = null
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
}

// 键盘微调
function handleKeyDown(e: KeyboardEvent) {
  if ((!activeButton.value && !activeDirection.value) || ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return

  const target = activeButton.value || activeDirection.value
  if (!target) return

  const step = e.shiftKey ? 10 : 1
  let handled = true

  // 统一位置处理逻辑
  const pos = (activeButton.value || activeDirection.value)!.baseInfo

  switch (e.key) {
    case 'ArrowLeft':
      pos.xPosition = Math.max(0, pos.xPosition - step)
      break
    case 'ArrowRight':
      pos.xPosition = Math.min(1000, pos.xPosition + step)
      break
    case 'ArrowUp':
      pos.yPosition = Math.max(0, pos.yPosition - step)
      break
    case 'ArrowDown':
      pos.yPosition = Math.min(1000, pos.yPosition + step)
      break
    case 'Delete':
    case 'Backspace':
      if (confirm(`确定要删除选中的${activeButton.value ? '按钮' : '方向键'}吗？`)) {
        if (activeButton.value) removeButton(activeButton.value.id)
        else removeDirection(activeDirection.value!.id)
      }
      break
    default:
      handled = false
  }

  if (handled) e.preventDefault()
}

function handleCanvasMouseDown(e: MouseEvent) {
  if ((e.target as HTMLElement).closest('.cursor-move')) return
  activeButtonId.value = ''
  activeDirectionId.value = ''
}

// 导入逻辑
function triggerImport() {
  importInputRef.value?.click()
}

function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const json = JSON.parse(event.target?.result as string)
      if (json.viewGroups && Array.isArray(json.viewGroups)) {
        // 简单的数据完整性补全
        json.viewGroups.forEach((g: any) => {
          if (!g.viewData) g.viewData = { buttonList: [], directionList: [] }
          if (!g.viewData.directionList) g.viewData.directionList = []
          g.viewData.buttonList.forEach((b: any) => {
            if (!b.event) b.event = createDefaultButtonEvent()
            if (!b.baseInfo.percentageWidth) b.baseInfo.percentageWidth = { reference: 'SCREEN_WIDTH', size: 60 }
            if (!b.baseInfo.percentageHeight) b.baseInfo.percentageHeight = { reference: 'SCREEN_WIDTH', size: 60 }
          })
          g.viewData.directionList.forEach((d: any) => {
            if (!d.upEvent) d.upEvent = createDefaultEvent()
            if (!d.downEvent) d.downEvent = createDefaultEvent()
            if (!d.leftEvent) d.leftEvent = createDefaultEvent()
            if (!d.rightEvent) d.rightEvent = createDefaultEvent()
          })
        })
        layout.value = json
        activeGroupId.value = json.viewGroups[0]?.id || ''
        activeButtonId.value = ''
        activeDirectionId.value = ''
      } else {
        alert('无效的 FCL 配置文件：缺少 viewGroups 字段')
      }
    } catch (err) {
      alert('解析 JSON 失败，请检查文件格式')
    }
  }
  reader.readAsText(file)
  if (importInputRef.value) importInputRef.value.value = ''
}

// 操作逻辑
function addGroup() {
  const id = Math.random().toString(36).substring(2, 10)
  layout.value.viewGroups.push({
    id,
    name: `视图组 ${layout.value.viewGroups.length + 1}`,
    visibility: 'VISIBLE',
    viewData: {
      buttonList: [],
      directionList: []
    }
  })
  activeGroupId.value = id
}

function removeGroup(id: string) {
  if (layout.value.viewGroups.length <= 1) return
  if (!confirm('确定要删除该视图组及其所有按钮吗？')) return
  layout.value.viewGroups = layout.value.viewGroups.filter(g => g.id !== id)
  if (activeGroupId.value === id) {
    activeGroupId.value = layout.value.viewGroups[0].id
  }
}

function addButton() {
  if (!activeGroup.value) return
  const id = Math.random().toString(36).substring(2, 10)
  const newBtn: FCLButton = {
    id,
    text: '新按钮',
    style: layout.value.buttonStyles[0]?.name || 'default',
    baseInfo: {
      visibilityType: 'ALWAYS',
      xPosition: 500,
      yPosition: 500,
      sizeType: 'PERCENTAGE',
      percentageWidth: { reference: 'SCREEN_WIDTH', size: 60 },
      percentageHeight: { reference: 'SCREEN_WIDTH', size: 60 },
      absoluteWidth: 60,
      absoluteHeight: 60
    },
    event: createDefaultButtonEvent()
  }
  activeGroup.value.viewData.buttonList.push(newBtn)
  activeButtonId.value = id
}

function removeButton(id: string) {
  if (!activeGroup.value) return
  activeGroup.value.viewData.buttonList = activeGroup.value.viewData.buttonList.filter(b => b.id !== id)
  if (activeButtonId.value === id) {
    activeButtonId.value = ''
  }
}

// 方向键操作
function addDirection() {
  if (!activeGroup.value) return
  
  const id = Math.random().toString(36).substring(2, 10)
  const newDir: FCLDirection = {
    id,
    style: 'default',
    baseInfo: {
      visibilityType: 'ALWAYS',
      xPosition: 400,
      yPosition: 400,
      sizeType: 'PERCENTAGE',
      percentageWidth: { reference: 'SCREEN_WIDTH', size: 200 },
      percentageHeight: { reference: 'SCREEN_WIDTH', size: 200 },
      absoluteWidth: 200,
      absoluteHeight: 200
    },
    event: {
      upKeycode: 17, // W
      downKeycode: 31, // S
      leftKeycode: 30, // A
      rightKeycode: 32, // D
      followOption: 'FIXED',
      sneak: false,
      sneakKeycode: 42 // Shift
    } as any // 扩展属性通过 any 绕过
  }
  
  // 扩展 8 方向事件支持
  const extendedEvent = newDir.event as any
  extendedEvent.upEvent = createDefaultEvent()
  extendedEvent.downEvent = createDefaultEvent()
  extendedEvent.leftEvent = createDefaultEvent()
  extendedEvent.rightEvent = createDefaultEvent()
  extendedEvent.upLeftEvent = createDefaultEvent()
  extendedEvent.upRightEvent = createDefaultEvent()
  extendedEvent.downLeftEvent = createDefaultEvent()
  extendedEvent.downRightEvent = createDefaultEvent()
  
  // 预填默认键码
  extendedEvent.upEvent.outputKeycodes = [17]
  extendedEvent.downEvent.outputKeycodes = [31]
  extendedEvent.leftEvent.outputKeycodes = [30]
  extendedEvent.rightEvent.outputKeycodes = [32]
  extendedEvent.upLeftEvent.outputKeycodes = [17, 30]
  extendedEvent.upRightEvent.outputKeycodes = [17, 32]
  extendedEvent.downLeftEvent.outputKeycodes = [31, 30]
  extendedEvent.downRightEvent.outputKeycodes = [31, 32]

  activeGroup.value.viewData.directionList.push(newDir)
  activeDirectionId.value = id
}

function removeDirection(id: string) {
  if (!activeGroup.value) return
  activeGroup.value.viewData.directionList = activeGroup.value.viewData.directionList.filter(d => d.id !== id)
  if (activeDirectionId.value === id) {
    activeDirectionId.value = ''
  }
}

function duplicateButton() {
  if (!activeButton.value || !activeGroup.value) return
  const newBtn = JSON.parse(JSON.stringify(activeButton.value))
  newBtn.id = Math.random().toString(36).substring(2, 10)
  newBtn.baseInfo.xPosition = Math.min(1000, newBtn.baseInfo.xPosition + 20)
  newBtn.baseInfo.yPosition = Math.min(1000, newBtn.baseInfo.yPosition + 20)
  activeGroup.value.viewData.buttonList.push(newBtn)
  activeButtonId.value = newBtn.id
}

function createDefaultButtonEvent() {
  return {
    pointerFollow: false,
    Movable: false,
    pressEvent: createDefaultEvent(),
    longPressEvent: createDefaultEvent(),
    clickEvent: createDefaultEvent(),
    doubleClickEvent: createDefaultEvent()
  }
}

function createDefaultEvent() {
  return {
    autoKeep: false,
    autoClick: false,
    openMenu: false,
    switchTouchMode: false,
    switchMouseMode: false,
    input: false,
    quickInput: false,
    outputText: '',
    outputKeycodes: [],
    bindViewGroup: []
  }
}

function getEventName(key: string) {
  const map: any = {
    pressEvent: '按下事件',
    longPressEvent: '长按事件',
    clickEvent: '单击事件',
    doubleClickEvent: '双击事件'
  }
  return map[key] || key
}

function getDirectionEventName(key: string) {
  const map: any = {
    upEvent: '向上 (Up)',
    downEvent: '向下 (Down)',
    leftEvent: '向左 (Left)',
    rightEvent: '向右 (Right)',
    upLeftEvent: '左上 (Up-Left)',
    upRightEvent: '右上 (Up-Right)',
    downLeftEvent: '左下 (Down-Left)',
    downRightEvent: '右下 (Down-Right)'
  }
  return map[key] || key
}

function updateEventKeycodes(evtKey: string, val: string) {
  if (!activeButton.value) return
  (activeButton.value.event as any)[evtKey].outputKeycodes = val
    .split(',')
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n))
}

function updateDirectionEventKeycodes(evtKey: string, val: string) {
  if (!activeDirection.value) return
  (activeDirection.value as any)[evtKey].outputKeycodes = val
    .split(',')
    .map(s => parseInt(s.trim()))
    .filter(n => !isNaN(n))
}

// 样式操作
function addNewStyle() {
  const name = `style_${layout.value.buttonStyles.length + 1}`
  layout.value.buttonStyles.push({
    ...JSON.parse(JSON.stringify(layout.value.buttonStyles[0])),
    name
  })
  editingStyleName.value = name
}

function removeStyle(name: string) {
  if (layout.value.buttonStyles.length <= 1) return
  if (!confirm(`确定要删除样式 "${name}" 吗？引用该样式的按钮将变回默认样式。`)) return
  layout.value.buttonStyles = layout.value.buttonStyles.filter(s => s.name !== name)
  
  // 更新引用
  layout.value.viewGroups.forEach(g => {
    g.viewData.buttonList.forEach(b => {
      if (b.style === name) b.style = layout.value.buttonStyles[0].name
    })
    g.viewData.directionList?.forEach(d => {
      if (d.style === name) d.style = layout.value.buttonStyles[0].name
    })
  })
  
  if (editingStyleName.value === name) {
    editingStyleName.value = layout.value.buttonStyles[0].name
  }
}

function updateStyleColor(style: FCLButtonStyle, key: keyof FCLButtonStyle, hex: string) {
  (style as any)[key] = hexToFcl(hex)
}

function exportJson() {
  const json = JSON.stringify(layout.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `fcl_layout_${layout.value.id || 'export'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
</style>
