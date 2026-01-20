use worker::*;

mod detect;
mod terminal;

#[event(fetch)]
async fn main(req: Request, env: Env, _ctx: Context) -> Result<Response> {
    console_error_panic_hook::set_once();

    let user_agent = req
        .headers()
        .get("User-Agent")
        .unwrap_or(None)
        .unwrap_or_default();

    if detect::is_terminal_client(&user_agent) {
        // Return ANSI terminal UI
        let body = terminal::render();
        let headers = Headers::new();
        headers.set("Content-Type", "text/plain; charset=utf-8")?;
        headers.set("X-Terminal-UI", "true")?;

        return Response::ok(body).map(|r| r.with_headers(headers));
    }

    // Pass through to the static site (Pages)
    let pages_origin = env.var("PAGES_ORIGIN")?.to_string();
    let url = req.url()?;
    let path = url.path();
    let query = url.query().map(|q| format!("?{}", q)).unwrap_or_default();
    let origin_url = format!("{}{}{}", pages_origin, path, query);

    // Fetch from the origin (Cloudflare Pages)
    let origin_req = Request::new(&origin_url, Method::Get)?;

    Fetch::Request(origin_req).send().await
}
