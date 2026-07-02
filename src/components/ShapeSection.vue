<script setup lang="ts">
import SectionCard from "./SectionCard.vue";
import ShapePicker from "./ShapePicker.vue";
import { useEditorStore } from "../stores/editor";
import { BODY_SHAPES, EYE_BALL_SHAPES, EYE_FRAME_SHAPES } from "../engine/types";

const editor = useEditorStore();
</script>

<template>
  <SectionCard title="Shape">
    <ShapePicker label="Body shape" prefix="body" :options="BODY_SHAPES"
      v-model="editor.config.style.bodyShape" />
    <ShapePicker label="Eye frame" prefix="eye-frame" :options="EYE_FRAME_SHAPES"
      v-model="editor.config.style.eyeFrameShape" />
    <ShapePicker label="Eyeball" prefix="eyeball" :options="EYE_BALL_SHAPES"
      v-model="editor.config.style.eyeBallShape" />
  </SectionCard>
</template>
