use std::sync::Arc;

use tokio::sync::Mutex;

use crate::{controllers::main_controller::MainController, services::db::service::DBService};

pub struct AppState {
    pub db: Arc<DBService>,
    pub main_controller: Arc<Mutex<MainController>>,
}
