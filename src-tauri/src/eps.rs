use svg2pdf::usvg::{self, Node, Paint};
use usvg::tiny_skia_path::PathSegment;
use std::fmt::Write as _;

pub fn svg_to_eps(svg: &str) -> Result<String, String> {
    let tree = usvg::Tree::from_str(svg, &usvg::Options::default()).map_err(|e| e.to_string())?;
    let h = tree.size().height();
    let w = tree.size().width();
    let mut out = String::new();
    out.push_str("%!PS-Adobe-3.0 EPSF-3.0\n");
    let _ = writeln!(out, "%%BoundingBox: 0 0 {} {}", w.ceil() as i64, h.ceil() as i64);
    out.push_str("%%LanguageLevel: 3\n%%Pages: 1\n%%EndComments\n");
    emit_group(tree.root(), h, &mut out)?;
    out.push_str("showpage\n%%EOF\n");
    Ok(out)
}

fn emit_group(group: &usvg::Group, h: f32, out: &mut String) -> Result<(), String> {
    for node in group.children() {
        match node {
            Node::Group(g) => emit_group(g, h, out)?,
            Node::Path(p) => emit_path(p, h, out)?,
            Node::Image(i) => emit_image(i, h, out)?,
            Node::Text(_) => {}
        }
    }
    Ok(())
}

/// Apply a transform to a point, then flip to PostScript's bottom-left origin.
/// Used for both path geometry and gradient/paint coordinates: usvg's
/// `Path::data()` is in the element's LOCAL coordinate space ("absolute" in
/// usvg's docs means absolute path commands, not device space), so the
/// node's `abs_transform()` must be applied before the y-flip.
fn xform_flip(x: f32, y: f32, h: f32, t: usvg::Transform) -> (f32, f32) {
    let tx = t.sx * x + t.kx * y + t.tx;
    let ty = t.ky * x + t.sy * y + t.ty;
    (tx, h - ty)
}

fn path_construction(p: &usvg::Path, h: f32) -> String {
    let t = p.abs_transform();
    let mut d = String::from("newpath\n");
    let mut last = (0f32, 0f32);
    for seg in p.data().segments() {
        match seg {
            PathSegment::MoveTo(pt) => {
                last = xform_flip(pt.x, pt.y, h, t);
                let _ = writeln!(d, "{:.4} {:.4} moveto", last.0, last.1);
            }
            PathSegment::LineTo(pt) => {
                last = xform_flip(pt.x, pt.y, h, t);
                let _ = writeln!(d, "{:.4} {:.4} lineto", last.0, last.1);
            }
            PathSegment::QuadTo(c, pt) => {
                // elevate quadratic to cubic
                let cq = xform_flip(c.x, c.y, h, t);
                let end = xform_flip(pt.x, pt.y, h, t);
                let c1 = (last.0 + 2.0 / 3.0 * (cq.0 - last.0), last.1 + 2.0 / 3.0 * (cq.1 - last.1));
                let c2 = (end.0 + 2.0 / 3.0 * (cq.0 - end.0), end.1 + 2.0 / 3.0 * (cq.1 - end.1));
                let _ = writeln!(d, "{:.4} {:.4} {:.4} {:.4} {:.4} {:.4} curveto", c1.0, c1.1, c2.0, c2.1, end.0, end.1);
                last = end;
            }
            PathSegment::CubicTo(c1, c2, pt) => {
                let a = xform_flip(c1.x, c1.y, h, t);
                let b = xform_flip(c2.x, c2.y, h, t);
                let end = xform_flip(pt.x, pt.y, h, t);
                let _ = writeln!(d, "{:.4} {:.4} {:.4} {:.4} {:.4} {:.4} curveto", a.0, a.1, b.0, b.1, end.0, end.1);
                last = end;
            }
            PathSegment::Close => d.push_str("closepath\n"),
        }
    }
    d
}

fn rgb(c: usvg::Color) -> (f32, f32, f32) {
    (c.red as f32 / 255.0, c.green as f32 / 255.0, c.blue as f32 / 255.0)
}

fn stops_c0_c1(stops: &[usvg::Stop]) -> ((f32, f32, f32), (f32, f32, f32)) {
    let first = stops.first().map(|s| rgb(s.color())).unwrap_or((0.0, 0.0, 0.0));
    let last = stops.last().map(|s| rgb(s.color())).unwrap_or(first);
    (first, last)
}

fn emit_path(p: &usvg::Path, h: f32, out: &mut String) -> Result<(), String> {
    let Some(fill) = p.fill() else { return Ok(()) };
    let construction = path_construction(p, h);
    let (fill_op, clip_op) = match fill.rule() {
        usvg::FillRule::EvenOdd => ("eofill", "eoclip"),
        usvg::FillRule::NonZero => ("fill", "clip"),
    };
    // Gradient paint coordinates live in the element's local user space; compose
    // the path's absolute transform with the gradient's own transform so the
    // shading lands in the same absolute space as the transformed geometry.
    let abs = p.abs_transform();
    match fill.paint() {
        Paint::Color(c) => {
            let (r, g, b) = rgb(*c);
            let _ = writeln!(out, "{construction}{r:.4} {g:.4} {b:.4} setrgbcolor\n{fill_op}");
        }
        Paint::LinearGradient(lg) => {
            let t = abs.pre_concat(lg.transform());
            let (x1, y1) = xform_flip(lg.x1(), lg.y1(), h, t);
            let (x2, y2) = xform_flip(lg.x2(), lg.y2(), h, t);
            let ((r0, g0, b0), (r1, g1, b1)) = stops_c0_c1(lg.stops());
            let _ = writeln!(
                out,
                "gsave\n{construction}{clip_op}\n<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [{x1:.4} {y1:.4} {x2:.4} {y2:.4}] /Extend [true true] /Function << /FunctionType 2 /Domain [0 1] /C0 [{r0:.4} {g0:.4} {b0:.4}] /C1 [{r1:.4} {g1:.4} {b1:.4}] /N 1 >> >> shfill\ngrestore"
            );
        }
        Paint::RadialGradient(rg) => {
            let t = abs.pre_concat(rg.transform());
            let (cx, cy) = xform_flip(rg.cx(), rg.cy(), h, t);
            // Uniform scale factor to map the radius into absolute space.
            let scale = ((t.sx * t.sx + t.ky * t.ky).sqrt() + (t.kx * t.kx + t.sy * t.sy).sqrt()) / 2.0;
            let radius = rg.r().get() * scale;
            let ((r0, g0, b0), (r1, g1, b1)) = stops_c0_c1(rg.stops());
            let _ = writeln!(
                out,
                "gsave\n{construction}{clip_op}\n<< /ShadingType 3 /ColorSpace /DeviceRGB /Coords [{cx:.4} {cy:.4} 0 {cx:.4} {cy:.4} {radius:.4}] /Extend [true true] /Function << /FunctionType 2 /Domain [0 1] /C0 [{r0:.4} {g0:.4} {b0:.4}] /C1 [{r1:.4} {g1:.4} {b1:.4}] /N 1 >> >> shfill\ngrestore"
            );
        }
        Paint::Pattern(_) => return Err("Patterns are not supported in EPS export".into()),
    }
    Ok(())
}

fn emit_image(node: &usvg::Image, h: f32, out: &mut String) -> Result<(), String> {
    let data: &[u8] = match node.kind() {
        usvg::ImageKind::PNG(d) | usvg::ImageKind::JPEG(d) => d,
        _ => return Err("Only PNG/JPEG logos are supported in EPS export".into()),
    };
    let img = image::load_from_memory(data).map_err(|e| e.to_string())?.to_rgb8();
    let (iw, ih) = img.dimensions();
    // usvg's `abs_bounding_box()` is unreliable for images in 0.45, so derive the
    // placement rectangle from the raster `size()` and the (translate+scale)
    // `abs_transform`. The logo subset never rotates/skews the image.
    let raster = node.size();
    let t = node.abs_transform();
    let (dw, dh) = (raster.width() * t.sx, raster.height() * t.sy);
    let x = t.tx;
    let y = h - t.ty - dh; // PS origin bottom-left
    let _ = writeln!(out, "gsave\n{x:.4} {y:.4} translate\n{dw:.4} {dh:.4} scale");
    let _ = writeln!(
        out,
        "/DeviceRGB setcolorspace\n<< /ImageType 1 /Width {iw} /Height {ih} /BitsPerComponent 8 /Decode [0 1 0 1 0 1] /ImageMatrix [{iw} 0 0 -{ih} 0 {ih}] /DataSource currentfile /ASCIIHexDecode filter >> image"
    );
    let raw = img.into_raw();
    for chunk in raw.chunks(36) {
        for byte in chunk {
            let _ = write!(out, "{byte:02x}");
        }
        out.push('\n');
    }
    out.push_str(">\ngrestore\n");
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    const SOLID: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33"><rect width="33" height="33" fill="#ffffff"/><path fill="#112233" d="M4,4h1v1h-1Z"/></svg>"##;
    const GRADIENT: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse" x1="0" y1="16.5" x2="33" y2="16.5"><stop offset="0" stop-color="#000000"/><stop offset="1" stop-color="#ff0000"/></linearGradient></defs><path fill="url(#g)" d="M4,4h1v1h-1Z"/></svg>"##;
    const SOLID_TRANSFORMED: &str = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33"><rect width="33" height="33" fill="#ffffff"/><g transform="translate(5,0)"><path fill="#112233" d="M4,4h1v1h-1Z"/></g></svg>"##;

    /// Pulls the x-coordinate out of the last "N N moveto" line in an EPS body
    /// (the background rect in SOLID emits its own moveto first, so we want the
    /// one belonging to the small foreground path).
    fn last_moveto_x(eps: &str) -> f32 {
        let line = eps.lines().rev().find(|l| l.trim_end().ends_with("moveto")).expect("no moveto in output");
        let x: f32 = line.split_whitespace().next().expect("empty moveto line").parse().expect("non-numeric moveto x");
        x
    }

    #[test]
    fn eps_has_valid_dsc_structure() {
        let eps = svg_to_eps(SOLID).unwrap();
        assert!(eps.starts_with("%!PS-Adobe-3.0 EPSF-3.0\n"));
        assert!(eps.contains("%%BoundingBox: 0 0 33 33"));
        assert!(eps.contains("setrgbcolor"));
        assert!(eps.trim_end().ends_with("%%EOF"));
    }

    #[test]
    fn eps_gradient_emits_shfill() {
        let eps = svg_to_eps(GRADIENT).unwrap();
        assert!(eps.contains("/ShadingType 2"));
        assert!(eps.contains("shfill"));
    }

    #[test]
    fn eps_flips_y_axis() {
        // Path at SVG y=4 (top) must land near PS y=28 (33 - 4 - 1) in the output.
        let eps = svg_to_eps(SOLID).unwrap();
        assert!(eps.contains("29") || eps.contains("28"), "expected flipped y coordinates:\n{eps}");
    }

    #[test]
    fn eps_applies_group_transform_to_path_geometry() {
        // A <g transform="translate(5,0)"> around the path must shift the emitted
        // moveto x-coordinate by 5, proving abs_transform() is applied to geometry.
        let plain = svg_to_eps(SOLID).unwrap();
        let transformed = svg_to_eps(SOLID_TRANSFORMED).unwrap();
        let dx = last_moveto_x(&transformed) - last_moveto_x(&plain);
        assert!((dx - 5.0).abs() < 1e-3, "expected moveto x shifted by 5, got dx={dx}");
    }

    #[test]
    fn eps_rejects_garbage() {
        assert!(svg_to_eps("nope").is_err());
    }

    #[test]
    fn eps_image_places_logo_in_bounds() {
        // 2x2 PNG placed at x=10 y=10 w=8 h=8 in a 33x33 canvas.
        let svg = r##"<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 33 33"><image x="10" y="10" width="8" height="8" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAEElEQVR4nGP4z8AARAwQCgAf7gP9i18U1AAAAABJRU5ErkJggg=="/></svg>"##;
        let eps = svg_to_eps(svg).unwrap();
        assert!(eps.contains("ASCIIHexDecode"), "expected raster image operator:\n{eps}");
        // Placement: translate (10, 15) scale (8 8) -> stays within [0,33].
        assert!(eps.contains("10.0000 15.0000 translate"), "unexpected placement:\n{eps}");
        assert!(eps.contains("8.0000 8.0000 scale"), "unexpected scale:\n{eps}");
    }

    /// Optional viewer-equivalent smoke check: if Ghostscript is on PATH, render
    /// the EPS to a PNG at 150dpi and assert it is non-empty. Skipped when `gs`
    /// is absent so CI stays green on headless machines without Ghostscript.
    #[test]
    fn eps_renders_with_ghostscript_when_available() {
        let gs = std::process::Command::new("gs").arg("--version").output();
        if gs.is_err() {
            eprintln!("skipping: ghostscript (gs) not found on PATH");
            return;
        }
        let dir = std::env::temp_dir();
        for (name, svg) in [("solid", SOLID), ("gradient", GRADIENT)] {
            let eps = svg_to_eps(svg).unwrap();
            let eps_path = dir.join(format!("glyphic-eps-{name}.eps"));
            let png_path = dir.join(format!("glyphic-eps-{name}.png"));
            std::fs::write(&eps_path, &eps).unwrap();
            let status = std::process::Command::new("gs")
                .args([
                    "-dNOPAUSE",
                    "-dBATCH",
                    "-dEPSCrop",
                    "-sDEVICE=png16m",
                    "-r150",
                    &format!("-sOutputFile={}", png_path.display()),
                    eps_path.to_str().unwrap(),
                ])
                .status()
                .expect("failed to run gs");
            assert!(status.success(), "gs failed to render {name}.eps");
            let meta = std::fs::metadata(&png_path).expect("no png produced");
            assert!(meta.len() > 0, "gs produced an empty png for {name}");
        }
    }
}
