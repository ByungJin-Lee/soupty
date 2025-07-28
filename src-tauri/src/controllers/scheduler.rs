use std::collections::HashMap;
use std::future::Future;
use std::pin::Pin;
use std::sync::Arc;
use std::time::Duration;

use tauri::async_runtime::{spawn, JoinHandle};
use tokio::sync::Mutex;

pub type BoxFuture<T> = Pin<Box<dyn Future<Output = T> + Send + 'static>>;

#[derive(Clone)]
pub struct Scheduler {
    tasks: Arc<Mutex<HashMap<String, JoinHandle<()>>>>,
}

impl Scheduler {
    pub fn new() -> Self {
        Self {
            tasks: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn schedule_recurring<F, Fut>(&self, id: &str, interval: Duration, task: F)
    where
        F: Fn() -> Fut + Send + Sync + 'static,
        Fut: Future<Output = ()> + Send + 'static,
    {
        let task_id = id.to_string();

        let handle = spawn(async move {
            let mut interval_timer = tokio::time::interval(interval);

            loop {
                interval_timer.tick().await;
                task().await;
            }
        });

        let mut tasks = self.tasks.lock().await;
        if let Some(old_task) = tasks.insert(task_id.clone(), handle) {
            old_task.abort();
        }
    }

    pub async fn cancel_task(&self, id: &str) {
        let mut tasks = self.tasks.lock().await;
        if let Some(task) = tasks.remove(id) {
            task.abort();
        }
    }

    pub async fn cancel_all(&self) {
        let mut tasks = self.tasks.lock().await;
        for (_, task) in tasks.drain() {
            task.abort();
        }
    }
}

impl Default for Scheduler {
    fn default() -> Self {
        Self::new()
    }
}
