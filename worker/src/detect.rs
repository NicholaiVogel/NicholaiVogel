/// Detect if the request is from a terminal client

pub fn is_terminal_client(user_agent: &str) -> bool {
    let ua = user_agent.to_lowercase();

    // Common terminal HTTP clients
    ua.contains("curl")
        || ua.contains("wget")
        || ua.contains("httpie")
        || ua.contains("fetch")  // node-fetch, etc when explicitly set
        || ua.starts_with("python-requests")
        || ua.starts_with("python-urllib")
        || ua.starts_with("go-http-client")
        || ua.starts_with("rust-")
        // Text browsers
        || ua.contains("lynx")
        || ua.contains("links")
        || ua.contains("w3m")
        || ua.contains("elinks")
        // Other CLI tools
        || ua.contains("aria2")
        || ua.contains("powershell")
        // Empty or minimal user agents often indicate CLI tools
        || ua.is_empty()
        || ua == "-"
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_curl_detection() {
        assert!(is_terminal_client("curl/7.68.0"));
        assert!(is_terminal_client("curl/8.0.1"));
    }

    #[test]
    fn test_wget_detection() {
        assert!(is_terminal_client("Wget/1.21"));
    }

    #[test]
    fn test_browser_not_detected() {
        assert!(!is_terminal_client(
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
        ));
        assert!(!is_terminal_client(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        ));
    }

    #[test]
    fn test_httpie_detection() {
        assert!(is_terminal_client("HTTPie/3.2.1"));
    }
}
