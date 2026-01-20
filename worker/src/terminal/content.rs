/// Content data for the terminal UI

pub struct SiteContent;

impl SiteContent {
    pub const NAME: &'static str = "Nicholai Vogel";
    pub const TITLE: &'static str = "VFX Supervisor & Technical Artist";
    pub const LOCATION: &'static str = "Colorado Springs, CO";
    pub const YEAR: &'static str = "Portfolio 2026";

    pub const TAGLINE: &'static str =
        "A problem solver who loves visual effects. Creating for clients like Stinkfilms, Interscope, and Ralph Lauren.";

    pub const EMAIL: &'static str = "nicholai@nicholai.work";
    pub const WEBSITE: &'static str = "https://nicholai.work";
}

pub struct Experience {
    pub code: &'static str,
    pub status: &'static str,
    pub title: &'static str,
    pub role: &'static str,
    pub period: &'static str,
    pub description: &'static str,
}

pub const EXPERIENCES: &[Experience] = &[
    Experience {
        code: "SYS.01",
        status: "ACTIVE",
        title: "Biohazard VFX",
        role: "Founder & Owner",
        period: "2022 — PRESENT",
        description: "Founded cloud-based VFX studio for commercial & music work.",
    },
    Experience {
        code: "SYS.02",
        status: "DAEMON",
        title: "Freelance",
        role: "VFX Generalist",
        period: "2016 — PRESENT",
        description: "Houdini • Blender • Nuke • ComfyUI • After Effects",
    },
];

pub struct Skill {
    pub num: &'static str,
    pub name: &'static str,
    pub tools: &'static str,
}

pub const SKILLS: &[Skill] = &[
    Skill {
        num: "01",
        name: "Compositing",
        tools: "Nuke • ComfyUI • After Effects",
    },
    Skill {
        num: "02",
        name: "3D Generalist",
        tools: "Houdini • Blender • Maya • USD",
    },
    Skill {
        num: "03",
        name: "AI Integration",
        tools: "Stable Diffusion • LoRAs • Langgraph",
    },
    Skill {
        num: "04",
        name: "Development",
        tools: "Python • React • Docker • Linux",
    },
];

pub struct NavItem {
    pub command: &'static str,
    pub description: &'static str,
}

pub const NAV_ITEMS: &[NavItem] = &[
    NavItem {
        command: "curl nicholai.work",
        description: "this page",
    },
    NavItem {
        command: "curl nicholai.work/blog",
        description: "blog posts",
    },
    NavItem {
        command: "curl nicholai.work/llms.txt",
        description: "LLM-friendly index",
    },
];
