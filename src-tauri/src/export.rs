#[tauri::command]
pub fn export_vector(svg: String, format: String, path: String) -> Result<(), String> {
    let _ = (svg, path);
    match format.as_str() {
        "pdf" => Err("PDF export not implemented yet".into()),
        "eps" => Err("EPS export not implemented yet".into()),
        other => Err(format!("Unknown vector format: {other}")),
    }
}
