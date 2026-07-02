mod export;
mod store;

#[tauri::command]
fn write_file(path: String, contents: Vec<u8>) -> Result<(), String> {
    std::fs::write(&path, contents).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            write_file,
            export::export_vector,
            store::list_templates, store::save_template, store::delete_template,
            store::list_history, store::save_history_entry, store::delete_history_entry,
            store::get_settings, store::set_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
