<script setup lang="ts">
import SectionCard from "./SectionCard.vue";
import { useEditorStore } from "../stores/editor";
import type { ContentType, QrContent } from "../engine/types";

const editor = useEditorStore();

const TYPES: Array<{ id: ContentType; label: string }> = [
  { id: "url", label: "URL" }, { id: "text", label: "Text" },
  { id: "email", label: "Email" }, { id: "phone", label: "Phone" },
  { id: "sms", label: "SMS" }, { id: "wifi", label: "WiFi" },
  { id: "vcard", label: "vCard" }, { id: "location", label: "Location" },
];

const DEFAULTS: Record<ContentType, QrContent> = {
  url: { type: "url", url: "" },
  text: { type: "text", text: "" },
  email: { type: "email", address: "" },
  phone: { type: "phone", number: "" },
  sms: { type: "sms", number: "", message: "" },
  wifi: { type: "wifi", ssid: "", password: "", encryption: "WPA", hidden: false },
  vcard: { type: "vcard", firstName: "" },
  location: { type: "location", latitude: 0, longitude: 0 },
};

function setType(t: ContentType) {
  if (editor.config.content.type !== t) editor.config.content = { ...DEFAULTS[t] };
}

const VCARD_FIELDS = [
  ["firstName", "First name"], ["lastName", "Last name"], ["org", "Company"],
  ["title", "Job title"], ["phone", "Phone (work)"], ["mobile", "Mobile"],
  ["email", "Email"], ["website", "Website"], ["street", "Street"],
  ["city", "City"], ["state", "State"], ["zip", "ZIP"], ["country", "Country"],
] as const;
</script>

<template>
  <SectionCard title="Content">
    <div class="flex flex-wrap gap-1">
      <button v-for="t in TYPES" :key="t.id"
        class="rounded-full border px-3 py-1 text-xs"
        :class="editor.config.content.type === t.id
          ? 'border-gray-900 bg-gray-900 text-white dark:border-gray-100 dark:bg-gray-100 dark:text-gray-900' : 'border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800'"
        @click="setType(t.id)">
        {{ t.label }}
      </button>
    </div>

    <div class="space-y-2 text-sm">
      <template v-if="editor.config.content.type === 'url'">
        <input v-model="editor.config.content.url" placeholder="https://example.com"
          class="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
      </template>

      <template v-else-if="editor.config.content.type === 'text'">
        <textarea v-model="editor.config.content.text" rows="3" placeholder="Your text"
          class="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
      </template>

      <template v-else-if="editor.config.content.type === 'email'">
        <input v-model="editor.config.content.address" placeholder="name@example.com"
          class="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
        <input v-model="editor.config.content.subject" placeholder="Subject (optional)"
          class="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
        <textarea v-model="editor.config.content.body" rows="2" placeholder="Body (optional)"
          class="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
      </template>

      <template v-else-if="editor.config.content.type === 'phone'">
        <input v-model="editor.config.content.number" placeholder="+1 555 0100"
          class="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
      </template>

      <template v-else-if="editor.config.content.type === 'sms'">
        <input v-model="editor.config.content.number" placeholder="+1 555 0100"
          class="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
        <textarea v-model="editor.config.content.message" rows="2" placeholder="Message (optional)"
          class="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
      </template>

      <template v-else-if="editor.config.content.type === 'wifi'">
        <input v-model="editor.config.content.ssid" placeholder="Network name (SSID)"
          class="w-full rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
        <div class="flex gap-2">
          <select v-model="editor.config.content.encryption"
            class="rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100">
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None</option>
          </select>
          <input v-if="editor.config.content.encryption !== 'nopass'"
            v-model="editor.config.content.password" placeholder="Password"
            class="flex-1 rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
        </div>
        <label class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <input v-model="editor.config.content.hidden" type="checkbox" /> Hidden network
        </label>
      </template>

      <template v-else-if="editor.config.content.type === 'vcard'">
        <div class="grid grid-cols-2 gap-2">
          <input v-for="[key, label] in VCARD_FIELDS" :key="key"
            v-model="(editor.config.content as Record<string, any>)[key]" :placeholder="label"
            class="rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
        </div>
      </template>

      <template v-else-if="editor.config.content.type === 'location'">
        <div class="flex gap-2">
          <input v-model.number="editor.config.content.latitude" type="number" step="any"
            placeholder="Latitude" class="flex-1 rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          <input v-model.number="editor.config.content.longitude" type="number" step="any"
            placeholder="Longitude" class="flex-1 rounded border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
        </div>
      </template>
    </div>
  </SectionCard>
</template>
