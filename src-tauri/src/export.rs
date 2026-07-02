use svg2pdf::usvg;

pub fn svg_to_pdf(svg: &str) -> Result<Vec<u8>, String> {
    let tree = usvg::Tree::from_str(svg, &usvg::Options::default()).map_err(|e| e.to_string())?;
    svg2pdf::to_pdf(
        &tree,
        svg2pdf::ConversionOptions::default(),
        svg2pdf::PageOptions::default(),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn export_vector(svg: String, format: String, path: String) -> Result<(), String> {
    let bytes = match format.as_str() {
        "pdf" => svg_to_pdf(&svg)?,
        "eps" => return Err("EPS export not implemented yet".into()),
        other => return Err(format!("Unknown vector format: {other}")),
    };
    std::fs::write(&path, bytes).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="16.5" x2="33" y2="16.5"><stop offset="0" stop-color="#0b3d91"/><stop offset="1" stop-color="#6a0dad"/></linearGradient></defs><rect width="33" height="33" fill="#ffffff"/><path fill="url(#g)" d="M4,4h1v1h-1Z M6,4h1v1h-1Z"/></svg>"##;

    #[test]
    fn pdf_has_valid_header_and_content() {
        let pdf = svg_to_pdf(SAMPLE).unwrap();
        assert!(pdf.starts_with(b"%PDF-"));
        assert!(pdf.len() > 500);
    }

    #[test]
    fn pdf_rejects_garbage() {
        assert!(svg_to_pdf("not an svg").is_err());
    }
}
