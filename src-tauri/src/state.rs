use std::sync::Arc;

use crate::services::db::service::DBService;

pub struct AppState {
    pub db: Arc<DBService>,
}
