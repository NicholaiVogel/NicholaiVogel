use super::colors::{color, dim, Colors};

/// Box drawing characters
pub struct Box;

impl Box {
    pub const TOP_LEFT: char = '┌';
    pub const TOP_RIGHT: char = '┐';
    pub const BOTTOM_LEFT: char = '└';
    pub const BOTTOM_RIGHT: char = '┘';
    pub const HORIZONTAL: char = '─';
    pub const VERTICAL: char = '│';
    pub const T_RIGHT: char = '├';
    pub const T_LEFT: char = '┤';
}

/// Render a horizontal line
pub fn horizontal_line(width: usize) -> String {
    Box::HORIZONTAL.to_string().repeat(width)
}

/// Render a box top border with optional title
pub fn box_top(width: usize, title: Option<&str>) -> String {
    let inner_width = width - 2; // subtract corners

    match title {
        Some(t) => {
            // Title format: ┌─ Title ───────┐
            // We need: corner + dash + space + title + space + dashes + corner
            let title_display = format!(" {} ", t);
            let title_visible_len = title_display.len(); // all ASCII, so len() works
            // Subtract: 1 for the dash before title, title_visible_len for title
            let remaining_dashes = inner_width.saturating_sub(1 + title_visible_len);

            format!(
                "{}{}{}{}{}",
                dim(&Box::TOP_LEFT.to_string()),
                dim(&Box::HORIZONTAL.to_string()),
                color(&title_display, Colors::RED),
                dim(&horizontal_line(remaining_dashes)),
                dim(&Box::TOP_RIGHT.to_string())
            )
        }
        None => dim(&format!(
            "{}{}{}",
            Box::TOP_LEFT,
            horizontal_line(inner_width),
            Box::TOP_RIGHT
        )),
    }
}

/// Render a box bottom border
pub fn box_bottom(width: usize) -> String {
    let inner_width = width - 2;
    dim(&format!(
        "{}{}{}",
        Box::BOTTOM_LEFT,
        horizontal_line(inner_width),
        Box::BOTTOM_RIGHT
    ))
}

/// Render a box row with content
pub fn box_row(content: &str, width: usize) -> String {
    let visible_len = strip_ansi_len(content);
    let padding = width.saturating_sub(visible_len + 4);
    format!(
        "{}  {}{}  {}",
        dim(&Box::VERTICAL.to_string()),
        content,
        " ".repeat(padding),
        dim(&Box::VERTICAL.to_string())
    )
}

/// Render an empty box row
pub fn box_empty(width: usize) -> String {
    box_row("", width)
}

/// Strip ANSI codes and return visible display width
/// Accounts for double-width unicode characters (block chars, CJK, etc)
fn strip_ansi_len(s: &str) -> usize {
    let mut len = 0;
    let mut in_escape = false;

    for c in s.chars() {
        if c == '\x1b' {
            in_escape = true;
        } else if in_escape {
            if c == 'm' {
                in_escape = false;
            }
        } else {
            len += char_width(c);
        }
    }

    len
}

/// Get the display width of a character
/// Half-blocks are single-width, full-blocks vary by terminal
pub fn char_width(c: char) -> usize {
    match c {
        // Half-block characters - reliably single-width
        '▀' | '▄' | '▌' | '▐' => 1,
        // Single-line box drawing (what we use for borders) - single width
        '┌' | '┐' | '└' | '┘' | '│' | '─' | '├' | '┤' | '┬' | '┴' | '┼' => 1,
        // Most other characters are single width
        _ => 1,
    }
}

/// Get display width of a string (accounting for ANSI codes and double-width chars)
pub fn display_width(s: &str) -> usize {
    strip_ansi_len(s)
}

/// Pad a string with spaces on the right to reach target display width
pub fn pad_to_width(text: &str, target_width: usize) -> String {
    let current_width = display_width(text);
    if current_width >= target_width {
        return text.to_string();
    }
    format!("{}{}", text, " ".repeat(target_width - current_width))
}

/// Center text within a given width
pub fn center(text: &str, width: usize) -> String {
    let visible_len = strip_ansi_len(text);
    if visible_len >= width {
        return text.to_string();
    }
    let padding = (width - visible_len) / 2;
    format!("{}{}", " ".repeat(padding), text)
}

/// Pad text to the right
pub fn pad_right(text: &str, width: usize) -> String {
    let visible_len = strip_ansi_len(text);
    if visible_len >= width {
        return text.to_string();
    }
    format!("{}{}", text, " ".repeat(width - visible_len))
}
