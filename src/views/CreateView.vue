<script setup lang="ts">
import PreviewPanel from "../components/PreviewPanel.vue";
import ContentSection from "../components/ContentSection.vue";
import ColorSection from "../components/ColorSection.vue";
</script>

<template>
  <div class="flex gap-6 p-6 h-full overflow-hidden">
    <div class="flex-1 space-y-3 overflow-y-auto pr-2" data-testid="editor-sections">
      <!-- ContentSection / ColorSection / LogoSection / ShapeSection / TemplateSection mount here -->
      <ContentSection />
      <ColorSection />
    </div>
    <aside class="w-80 shrink-0">
      <PreviewPanel />
    </aside>
  </div>
</template>
