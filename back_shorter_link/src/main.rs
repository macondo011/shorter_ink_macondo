use actix_cors::Cors;
use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder};
use actix_web::http::header;
use rand::distributions::Alphanumeric;
use rand::{thread_rng, Rng};
use serde::Deserialize;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Clone)]
struct AppState {
    links: Arc<Mutex<HashMap<String, String>>>,
}
#[derive(Deserialize)]
struct Link {
    url: String,
}

fn generate_short_id() -> String {
    let mut rng = thread_rng();
    (0..5)
        .map(|_| rng.sample(Alphanumeric))
        .map(char::from)
        .collect()
}

#[post("/shorten")]
async fn shorten_link(state: web::Data<AppState>, json: web::Json<Link>) -> impl Responder {
    let original_url = json.url.clone();
    let short_id = generate_short_id();

    let mut links = state.links.lock().unwrap();
    links.insert(short_id.clone(), original_url);

    let short_url = format!("http://127.0.0.1:8080/{}", short_id);
    HttpResponse::Ok().body(short_url)
}

#[get("/{short_url}")]
async fn redirect(state: web::Data<AppState>, req: HttpRequest) -> impl Responder {
    let short_url = req.match_info().get("short_url").unwrap_or("");

    let links = state.links.lock().unwrap();

    if let Some(original_url) = links.get(short_url) {
        HttpResponse::Found()
            .append_header(("Location", original_url.as_str()))
            .finish()
    } else {
        HttpResponse::NotFound().body("URL not found")
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let state = web::Data::new(AppState {
        links: Arc::new(Mutex::new(HashMap::new())),
    });

    HttpServer::new(move || {
        App::new()
        .wrap(
            Cors::default()
                .allowed_origin("http://localhost:5173") // Reemplaza con el origen de tu frontend
                .allowed_methods(vec!["GET", "POST"])
                .allowed_headers(vec![header::CONTENT_TYPE])
                .max_age(3600),
        )
            .app_data(state.clone())
            .service(shorten_link)
            .service(redirect)
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
