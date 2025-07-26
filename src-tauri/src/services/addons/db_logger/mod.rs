mod buffer;
mod constants;
mod event_handlers;
mod session_manager;
pub mod user_flag;

use async_trait::async_trait;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::{
    models::events::*,
    services::addons::interface::{Addon, AddonContext},
};

use buffer::LogBuffer;
use constants::*;
use event_handlers::EventProcessor;
use session_manager::SessionManager;
use user_flag::create_user_flag;

pub struct DBLoggerAddon {
    buffer: Arc<Mutex<LogBuffer>>,
    session_manager: Arc<SessionManager>,
    event_processor: EventProcessor,
}

impl DBLoggerAddon {
    pub fn new() -> Self {
        let session_manager = Arc::new(SessionManager::new());
        let event_processor = EventProcessor::new(session_manager.clone());

        Self {
            buffer: Arc::new(Mutex::new(LogBuffer::default())),
            session_manager,
            event_processor,
        }
    }

    async fn should_flush_and_process(
        &self,
        ctx: &AddonContext,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let should_flush = {
            let buffer_guard = self.buffer.lock().await;
            buffer_guard.total_entries() >= BATCH_SIZE
        };

        if should_flush {
            let mut buffer_guard = self.buffer.lock().await;
            self.event_processor
                .flush_buffer(ctx, &mut buffer_guard)
                .await?;
        }

        Ok(())
    }
}

#[async_trait]
impl Addon for DBLoggerAddon {
    fn name(&self) -> &'static str {
        "db-logger-addon"
    }

    async fn on_connected(&self, _ctx: &AddonContext) {
        println!("[DBLoggerAddon] Connected to stream");
    }

    async fn on_chat(&self, ctx: &AddonContext, event: &ChatEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_chat_event(ctx, event, &mut buffer_guard)
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging chat: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    // async fn on_kick(&self, ctx: &AddonContext, event: &UserEvent) {
    //     let mut buffer_guard = self.buffer.lock().await;
    //     if let Err(e) = self
    //         .event_processor
    //         .process_event_log(
    //             ctx,
    //             &event.channel_id,
    //             Some(&event.user.id),    // user_id
    //             Some(&event.user.label), // username
    //             None,                    // user_flag
    //             EVENT_TYPE_KICK,
    //             event,
    //             event.timestamp,
    //             &mut buffer_guard,
    //         )
    //         .await
    //     {
    //         eprintln!("[DBLoggerAddon] Error logging donation: {}", e);
    //         return;
    //     }
    //     drop(buffer_guard);

    //     if let Err(e) = self.should_flush_and_process(ctx).await {
    //         eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
    //     }
    // }

    async fn on_donation(&self, ctx: &AddonContext, event: &DonationEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                Some(&event.from),       // user_id
                Some(&event.from_label), // username
                None,                    // user_flag
                EVENT_TYPE_DONATION,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging donation: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_subscribe(&self, ctx: &AddonContext, event: &SubscribeEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                Some(&event.user_id), // user_id
                Some(&event.label),   // username
                None,                 // user_flag
                EVENT_TYPE_SUBSCRIBE,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging subscribe: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_kick_cancel(&self, ctx: &AddonContext, event: &SimplifiedUserEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                Some(&event.user_id), // user_id
                None,                 // username
                None,                 // user_flag
                EVENT_TYPE_KICK_CANCEL,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging kick cancel: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_mute(&self, ctx: &AddonContext, event: &MuteEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                Some(&event.user.id),                // user_id
                Some(&event.user.label),             // username
                Some(create_user_flag(&event.user)), // user_flag
                EVENT_TYPE_MUTE,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging mute: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_black(&self, ctx: &AddonContext, event: &SimplifiedUserEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                Some(&event.user_id), // user_id
                None,                 // username
                None,                 // user_flag
                EVENT_TYPE_BLACK,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging black: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_freeze(&self, ctx: &AddonContext, event: &FreezeEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                None, // user_id
                None, // username
                None, // user_flag
                EVENT_TYPE_FREEZE,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging freeze: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_notification(&self, ctx: &AddonContext, event: &NotificationEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                None, // user_id
                None, // username
                None, // user_flag,
                EVENT_TYPE_NOTIFICATION,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging notification: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_mission_donation(&self, ctx: &AddonContext, event: &MissionEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                Some(&event.from),       // user_id
                Some(&event.from_label), // username
                None,                    // user_flag
                EVENT_TYPE_MISSION_DONATION,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging mission donation: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_mission_total(&self, ctx: &AddonContext, event: &MissionTotalEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                None, // user_id
                None, // username
                None, // user_flag,
                EVENT_TYPE_MISSION_TOTAL,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging mission total: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_battle_mission_result(&self, ctx: &AddonContext, event: &BattleMissionResultEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                None, // user_id
                None, // username
                None, // user_flag,
                EVENT_TYPE_BATTLE_MISSION_RESULT,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging battle mission result: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_challenge_mission_result(
        &self,
        ctx: &AddonContext,
        event: &ChallengeMissionResultEvent,
    ) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                None, // user_id
                None, // username
                None, // user_flag,
                EVENT_TYPE_CHALLENGE_MISSION_RESULT,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!(
                "[DBLoggerAddon] Error logging challenge mission result: {}",
                e
            );
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn on_slow(&self, ctx: &AddonContext, event: &SlowEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                None, // user_id
                None, // username
                None, // user_flag,
                EVENT_TYPE_SLOW,
                event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging slow: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }

    async fn stop(&self, ctx: &AddonContext) {
        println!("[DBLoggerAddon] Stopping addon - cleaning up resources");

        // 남은 버퍼 데이터 모두 flush
        {
            let mut buffer_guard = self.buffer.lock().await;
            if let Err(e) = self
                .event_processor
                .flush_buffer(ctx, &mut buffer_guard)
                .await
            {
                eprintln!("[DBLoggerAddon] Error flushing buffer on stop: {}", e);
            }
        }

        // 현재 방송 세션 종료
        if let Err(e) = self
            .session_manager
            .end_session(ctx, chrono::Utc::now())
            .await
        {
            eprintln!(
                "[DBLoggerAddon] Error updating broadcast end time on stop: {}",
                e
            );
        }

        println!("[DBLoggerAddon] Cleanup completed");
    }

    async fn on_metadata_update(&self, ctx: &AddonContext, event: &MetadataEvent) {
        let mut buffer_guard = self.buffer.lock().await;
        if let Err(e) = self
            .event_processor
            .process_event_log(
                ctx,
                &event.channel_id,
                None, // user_id
                None, // username
                None, // user_flag,
                EVENT_TYPE_METADATA_UPDATE,
                &event,
                event.timestamp,
                &mut buffer_guard,
            )
            .await
        {
            eprintln!("[DBLoggerAddon] Error logging metadata update: {}", e);
            return;
        }
        drop(buffer_guard);

        if let Err(e) = self.should_flush_and_process(ctx).await {
            eprintln!("[DBLoggerAddon] Error during flush check: {}", e);
        }
    }
}
