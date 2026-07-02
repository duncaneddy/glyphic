use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Template {
    pub id: String,
    pub name: String,
    pub style: Value,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct HistoryEntry {
    pub id: String,
    pub name: String,
    pub config: Value,
    pub created_at: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub preview_svg: Option<String>,
}

fn write_atomic(path: &Path, bytes: &[u8]) -> Result<(), String> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let tmp = path.with_extension("tmp");
    fs::write(&tmp, bytes).map_err(|e| e.to_string())?;
    fs::rename(&tmp, path).map_err(|e| e.to_string())
}

// ---- pure, directory-parameterized logic ----

pub fn list_templates_in(dir: &Path) -> Vec<Template> {
    let mut out: Vec<Template> = fs::read_dir(dir.join("templates"))
        .into_iter()
        .flatten()
        .flatten()
        .filter(|e| e.path().extension().is_some_and(|x| x == "json"))
        .filter_map(|e| serde_json::from_slice(&fs::read(e.path()).ok()?).ok())
        .collect();
    out.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    out
}

pub fn save_template_in(dir: &Path, t: &Template) -> Result<(), String> {
    let bytes = serde_json::to_vec_pretty(t).map_err(|e| e.to_string())?;
    write_atomic(&dir.join("templates").join(format!("{}.json", t.id)), &bytes)
}

pub fn delete_template_in(dir: &Path, id: &str) -> Result<(), String> {
    fs::remove_file(dir.join("templates").join(format!("{id}.json"))).map_err(|e| e.to_string())
}

pub fn list_history_in(dir: &Path) -> Vec<HistoryEntry> {
    let mut out: Vec<HistoryEntry> = fs::read_dir(dir.join("history"))
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|e| {
            let mut entry: HistoryEntry =
                serde_json::from_slice(&fs::read(e.path().join("config.json")).ok()?).ok()?;
            entry.preview_svg = fs::read_to_string(e.path().join("preview.svg")).ok();
            Some(entry)
        })
        .collect();
    out.sort_by(|a, b| b.created_at.cmp(&a.created_at));
    out
}

pub fn save_history_entry_in(dir: &Path, entry: &HistoryEntry) -> Result<(), String> {
    let folder = dir.join("history").join(&entry.id);
    let mut on_disk = entry.clone();
    let preview = on_disk.preview_svg.take();
    let bytes = serde_json::to_vec_pretty(&on_disk).map_err(|e| e.to_string())?;
    write_atomic(&folder.join("config.json"), &bytes)?;
    if let Some(svg) = preview {
        write_atomic(&folder.join("preview.svg"), svg.as_bytes())?;
    }
    Ok(())
}

pub fn delete_history_entry_in(dir: &Path, id: &str) -> Result<(), String> {
    fs::remove_dir_all(dir.join("history").join(id)).map_err(|e| e.to_string())
}

pub fn get_settings_in(dir: &Path) -> Value {
    fs::read(dir.join("settings.json"))
        .ok()
        .and_then(|b| serde_json::from_slice(&b).ok())
        .unwrap_or_else(|| serde_json::json!({}))
}

pub fn set_settings_in(dir: &Path, settings: &Value) -> Result<(), String> {
    let bytes = serde_json::to_vec_pretty(settings).map_err(|e| e.to_string())?;
    write_atomic(&dir.join("settings.json"), &bytes)
}

// ---- tauri command wrappers ----

fn data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path().app_data_dir().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_templates(app: AppHandle) -> Result<Vec<Template>, String> {
    Ok(list_templates_in(&data_dir(&app)?))
}

#[tauri::command]
pub fn save_template(app: AppHandle, template: Template) -> Result<(), String> {
    save_template_in(&data_dir(&app)?, &template)
}

#[tauri::command]
pub fn delete_template(app: AppHandle, id: String) -> Result<(), String> {
    delete_template_in(&data_dir(&app)?, &id)
}

#[tauri::command]
pub fn list_history(app: AppHandle) -> Result<Vec<HistoryEntry>, String> {
    Ok(list_history_in(&data_dir(&app)?))
}

#[tauri::command]
pub fn save_history_entry(app: AppHandle, entry: HistoryEntry) -> Result<(), String> {
    save_history_entry_in(&data_dir(&app)?, &entry)
}

#[tauri::command]
pub fn delete_history_entry(app: AppHandle, id: String) -> Result<(), String> {
    delete_history_entry_in(&data_dir(&app)?, &id)
}

#[tauri::command]
pub fn get_settings(app: AppHandle) -> Result<Value, String> {
    Ok(get_settings_in(&data_dir(&app)?))
}

#[tauri::command]
pub fn set_settings(app: AppHandle, settings: Value) -> Result<(), String> {
    set_settings_in(&data_dir(&app)?, &settings)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn tpl(id: &str) -> Template {
        Template {
            id: id.into(), name: format!("T {id}"), style: json!({"fill": {"type": "solid"}}),
            created_at: "2026-07-01T00:00:00Z".into(), updated_at: "2026-07-01T00:00:00Z".into(),
        }
    }

    #[test]
    fn template_roundtrip_and_delete() {
        let dir = tempfile::tempdir().unwrap();
        save_template_in(dir.path(), &tpl("a")).unwrap();
        save_template_in(dir.path(), &tpl("b")).unwrap();
        let listed = list_templates_in(dir.path());
        assert_eq!(listed.len(), 2);
        delete_template_in(dir.path(), "a").unwrap();
        assert_eq!(list_templates_in(dir.path()).len(), 1);
        assert_eq!(list_templates_in(dir.path())[0].id, "b");
    }

    #[test]
    fn corrupt_template_is_skipped() {
        let dir = tempfile::tempdir().unwrap();
        save_template_in(dir.path(), &tpl("ok")).unwrap();
        std::fs::write(dir.path().join("templates/bad.json"), "{not json").unwrap();
        assert_eq!(list_templates_in(dir.path()).len(), 1);
    }

    #[test]
    fn history_roundtrip_newest_first_with_preview() {
        let dir = tempfile::tempdir().unwrap();
        let mk = |id: &str, ts: &str| HistoryEntry {
            id: id.into(), name: id.into(), config: json!({"content": {}}),
            created_at: ts.into(), preview_svg: Some(format!("<svg>{id}</svg>")),
        };
        save_history_entry_in(dir.path(), &mk("old", "2026-01-01T00:00:00Z")).unwrap();
        save_history_entry_in(dir.path(), &mk("new", "2026-06-01T00:00:00Z")).unwrap();
        let listed = list_history_in(dir.path());
        assert_eq!(listed[0].id, "new");
        assert_eq!(listed[1].preview_svg.as_deref(), Some("<svg>old</svg>"));
        delete_history_entry_in(dir.path(), "old").unwrap();
        assert_eq!(list_history_in(dir.path()).len(), 1);
    }

    #[test]
    fn settings_default_to_empty_object() {
        let dir = tempfile::tempdir().unwrap();
        assert_eq!(get_settings_in(dir.path()), json!({}));
        set_settings_in(dir.path(), &json!({"lastStyle": {"x": 1}})).unwrap();
        assert_eq!(get_settings_in(dir.path())["lastStyle"]["x"], 1);
    }
}
