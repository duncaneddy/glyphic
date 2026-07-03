<script setup lang="ts">
import SectionCard from "./SectionCard.vue";
import ShapePicker from "./ShapePicker.vue";
import { useEditorStore } from "../stores/editor";
import { BODY_SHAPES, EYE_BALL_SHAPES, EYE_FRAME_SHAPES } from "../engine/types";
import { bodyPreview, eyeBallPreview, eyeFramePreview } from "../lib/shape-previews";

const editor = useEditorStore();

const bodyPreviews = Object.fromEntries(BODY_SHAPES.map((s) => [s, bodyPreview(s)]));
const eyeFramePreviews = Object.fromEntries(EYE_FRAME_SHAPES.map((s) => [s, eyeFramePreview(s)]));
const eyeBallPreviews = Object.fromEntries(EYE_BALL_SHAPES.map((s) => [s, eyeBallPreview(s)]));
</script>

<template>
  <SectionCard title="Shape">
    <div class="grid grid-cols-3 gap-4">
      <ShapePicker label="Body shape" :options="BODY_SHAPES" :previews="bodyPreviews"
        v-model="editor.config.style.bodyShape" />
      <ShapePicker label="Eye frame" :options="EYE_FRAME_SHAPES" :previews="eyeFramePreviews"
        v-model="editor.config.style.eyeFrameShape" />
      <ShapePicker label="Eyeball" :options="EYE_BALL_SHAPES" :previews="eyeBallPreviews"
        v-model="editor.config.style.eyeBallShape" />
    </div>
  </SectionCard>
</template>
