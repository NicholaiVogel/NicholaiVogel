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
    let inner_width = width - 2;

    match title {
        Some(t) => {
            let title_colored = color(&format!(" {} ", t), Colors::CYAN);
            let title_len = t.len() + 2; // account for spaces
            let line_len = inner_width.saturating_sub(title_len);
            dim(&format!(
                "{}{}{}{}",
                Box::TOP_LEFT,
                Box::HORIZONTAL,
                title_colored,
                format!("{}{}", dim(&horizontal_line(line_len)), dim(&Box::TOP_RIGHT.to_string()))
            ))
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

/// Strip ANSI codes and return visible length
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
            len += 1;
        }
    }

    len
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
