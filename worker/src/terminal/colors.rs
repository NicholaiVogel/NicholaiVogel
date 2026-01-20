/// ANSI color palette matching the site's aesthetic
/// Primary accent: #dd4132 (red)
/// Secondary: #22D3EE (cyan)

pub struct Colors;

impl Colors {
    // Reset
    pub const RESET: &'static str = "\x1b[0m";

    // Primary text colors
    pub const WHITE: &'static str = "\x1b[97m";
    pub const GRAY: &'static str = "\x1b[90m";
    pub const LIGHT_GRAY: &'static str = "\x1b[37m";

    // Accent colors (using 256-color mode for better matching)
    // #dd4132 -> closest is 196 (red) or 167 (indian red)
    pub const RED: &'static str = "\x1b[38;5;167m";
    pub const BRIGHT_RED: &'static str = "\x1b[38;5;196m";

    // #22D3EE -> closest is 51 (cyan) or 87 (dark turquoise)
    pub const CYAN: &'static str = "\x1b[38;5;87m";
    pub const BRIGHT_CYAN: &'static str = "\x1b[38;5;51m";

    // Status colors
    pub const GREEN: &'static str = "\x1b[38;5;78m";
    pub const YELLOW: &'static str = "\x1b[38;5;220m";

    // Text styles
    pub const BOLD: &'static str = "\x1b[1m";
    pub const DIM: &'static str = "\x1b[2m";
}

/// Format text with a specific color
pub fn color(text: &str, color: &str) -> String {
    format!("{}{}{}", color, text, Colors::RESET)
}

/// Format text as bold
pub fn bold(text: &str) -> String {
    format!("{}{}{}", Colors::BOLD, text, Colors::RESET)
}

/// Format text with color and bold
pub fn bold_color(text: &str, color: &str) -> String {
    format!("{}{}{}{}", Colors::BOLD, color, text, Colors::RESET)
}

/// Format text as dim/muted
pub fn dim(text: &str) -> String {
    format!("{}{}{}", Colors::DIM, text, Colors::RESET)
}
