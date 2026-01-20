use super::colors::{bold_color, color, dim, Colors};
use super::content::{Experience, NavItem, SiteContent, Skill, EXPERIENCES, NAV_ITEMS, SKILLS};
use super::layout::{box_bottom, box_empty, box_row, box_top, center};

const WIDTH: usize = 67;

/// ASCII art logo for "VISUAL ALCHEMIST"
const LOGO: &str = r#"██╗   ██╗██╗███████╗██╗   ██╗ █████╗ ██╗
██║   ██║██║██╔════╝██║   ██║██╔══██╗██║
██║   ██║██║███████╗██║   ██║███████║██║
╚██╗ ██╔╝██║╚════██║██║   ██║██╔══██║██║
 ╚████╔╝ ██║███████║╚██████╔╝██║  ██║███████╗
  ╚═══╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝"#;

/// Render the complete terminal UI
pub fn render() -> String {
    let mut output = String::new();

    output.push_str(&render_header());
    output.push('\n');
    output.push_str(&render_experience());
    output.push('\n');
    output.push_str(&render_skills());
    output.push('\n');
    output.push_str(&render_navigation());
    output.push('\n');
    output.push_str(&render_footer());
    output.push('\n');

    output
}

fn render_header() -> String {
    let mut lines = Vec::new();

    lines.push(box_top(WIDTH, None));
    lines.push(box_empty(WIDTH));

    // Logo
    for line in LOGO.lines() {
        let centered = center(&color(line, Colors::RED), WIDTH - 4);
        lines.push(box_row(&centered, WIDTH));
    }

    // Subtitle
    lines.push(box_row(&center(&bold_color("ALCHEMIST", Colors::RED), WIDTH - 4), WIDTH));
    lines.push(box_empty(WIDTH));

    // Name and title
    lines.push(box_row(
        &center(
            &format!(
                "{} — {}",
                bold_color(SiteContent::NAME, Colors::WHITE),
                color(SiteContent::TITLE, Colors::RED)
            ),
            WIDTH - 4,
        ),
        WIDTH,
    ));

    // Location and year
    lines.push(box_row(
        &center(
            &format!(
                "{}{}{}",
                dim(SiteContent::LOCATION),
                dim("  "),
                dim(SiteContent::YEAR)
            ),
            WIDTH - 4,
        ),
        WIDTH,
    ));

    lines.push(box_empty(WIDTH));

    // Tagline - wrap it manually
    let tagline = SiteContent::TAGLINE;
    let max_line = WIDTH - 8;

    for wrapped_line in wrap_text(tagline, max_line) {
        lines.push(box_row(&center(&color(&wrapped_line, Colors::LIGHT_GRAY), WIDTH - 4), WIDTH));
    }

    lines.push(box_empty(WIDTH));
    lines.push(box_bottom(WIDTH));

    lines.join("\n")
}

fn render_experience() -> String {
    let mut lines = Vec::new();

    lines.push(box_top(WIDTH, Some("Experience")));
    lines.push(box_empty(WIDTH));

    for (i, exp) in EXPERIENCES.iter().enumerate() {
        lines.push(box_row(&format_experience(exp), WIDTH));
        lines.push(box_row(&dim(exp.period), WIDTH));
        lines.push(box_row(&color(exp.description, Colors::LIGHT_GRAY), WIDTH));

        if i < EXPERIENCES.len() - 1 {
            lines.push(box_empty(WIDTH));
        }
    }

    lines.push(box_empty(WIDTH));
    lines.push(box_bottom(WIDTH));

    lines.join("\n")
}

fn format_experience(exp: &Experience) -> String {
    let status_color = if exp.status == "ACTIVE" {
        Colors::GREEN
    } else {
        Colors::YELLOW
    };

    format!(
        "{}  {}  {} — {}",
        dim(&format!("[{}]", exp.code)),
        color(exp.status, status_color),
        bold_color(exp.title, Colors::WHITE),
        color(exp.role, Colors::RED)
    )
}

fn render_skills() -> String {
    let mut lines = Vec::new();

    lines.push(box_top(WIDTH, Some("Skills")));
    lines.push(box_empty(WIDTH));

    for skill in SKILLS.iter() {
        lines.push(box_row(&format_skill(skill), WIDTH));
    }

    lines.push(box_empty(WIDTH));
    lines.push(box_bottom(WIDTH));

    lines.join("\n")
}

fn format_skill(skill: &Skill) -> String {
    format!(
        "{}  {}{}{}",
        color(skill.num, Colors::RED),
        bold_color(&format!("{:<18}", skill.name), Colors::WHITE),
        "  ",
        dim(skill.tools)
    )
}

fn render_navigation() -> String {
    let mut lines = Vec::new();

    lines.push(box_top(WIDTH, Some("Navigation")));
    lines.push(box_empty(WIDTH));

    for nav in NAV_ITEMS.iter() {
        lines.push(box_row(&format_nav(nav), WIDTH));
    }

    lines.push(box_empty(WIDTH));
    lines.push(box_bottom(WIDTH));

    lines.join("\n")
}

fn format_nav(nav: &NavItem) -> String {
    let cmd = color(nav.command, Colors::WHITE);
    let desc = dim(nav.description);
    let padding = 35_usize.saturating_sub(nav.command.len());
    format!(
        "{}  {}{}{}",
        color("$", Colors::RED),
        cmd,
        " ".repeat(padding),
        desc
    )
}

fn render_footer() -> String {
    format!(
        "  {} • {}",
        color(SiteContent::WEBSITE, Colors::RED),
        color(SiteContent::EMAIL, Colors::LIGHT_GRAY)
    )
}

/// Simple text wrapper
fn wrap_text(text: &str, max_width: usize) -> Vec<String> {
    let mut lines = Vec::new();
    let mut current_line = String::new();

    for word in text.split_whitespace() {
        if current_line.is_empty() {
            current_line = word.to_string();
        } else if current_line.len() + 1 + word.len() <= max_width {
            current_line.push(' ');
            current_line.push_str(word);
        } else {
            lines.push(current_line);
            current_line = word.to_string();
        }
    }

    if !current_line.is_empty() {
        lines.push(current_line);
    }

    lines
}
