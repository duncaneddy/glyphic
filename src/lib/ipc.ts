import { invoke } from "@tauri-apps/api/core";
import type { HistoryEntry, QrStyle, Template } from "../engine/types";

export const listTemplates = () => invoke<Template[]>("list_templates");
export const saveTemplate = (template: Template) => invoke<void>("save_template", { template });
export const deleteTemplate = (id: string) => invoke<void>("delete_template", { id });

export const listHistory = () => invoke<HistoryEntry[]>("list_history");
export const saveHistoryEntry = (entry: HistoryEntry) => invoke<void>("save_history_entry", { entry });
export const deleteHistoryEntry = (id: string) => invoke<void>("delete_history_entry", { id });

export interface Settings { lastStyle?: QrStyle }
export const getSettings = () => invoke<Settings>("get_settings");
export const setSettings = (settings: Settings) => invoke<void>("set_settings", { settings });
