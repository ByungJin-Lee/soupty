use async_trait::async_trait;
use tauri::Emitter;

use crate::{
    models::events::ChatEvent,
    services::addons::interface::{Addon, AddonContext},
};

pub struct DefaultUIAddon {}

impl DefaultUIAddon {
    pub fn new() -> Self {
        Self {}
    }
}

#[async_trait]
impl Addon for DefaultUIAddon {
    fn name(&self) -> &'static str {
        "default-ui-addon"
    }

    async fn on_chat(&self, ctx: &AddonContext, event: &ChatEvent) {
        ctx.app_handle.emit("log:chat", event);
        return;
    }
}
