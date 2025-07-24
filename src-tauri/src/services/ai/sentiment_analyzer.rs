use anyhow::Result;
use ndarray::{Array, Ix2};
use ort::execution_providers::CPUExecutionProvider;
use ort::session::Session;
use ort::value::Value;
use serde::Deserialize;
use std::path::PathBuf;
use std::sync::{Mutex, OnceLock};
use tokenizers::Tokenizer;

pub const SENTIMENT_THRESHOLD: f32 = 1.7;

/// 분석 결과를 프론트엔드로 전달하기 위한 구조체입니다.
#[derive(serde::Serialize, Clone, Deserialize, Debug)]
pub struct AnalysisResult {
    pub sentiment: Sentiment,
    pub score: f32,
}

#[derive(serde::Serialize, Clone, Copy, Debug, Deserialize)]
pub enum Sentiment {
    Positive,
    Negative,
    Neutral,
}

/// ONNX 세션과 토크나이저를 함께 보관할 구조체입니다.
pub struct SentimentAnalyzer {
    session: Mutex<Session>,
    tokenizer: Mutex<Tokenizer>,
}

static GLOBAL_SENTIMENT_ANALYZER: OnceLock<SentimentAnalyzer> = OnceLock::new();

impl SentimentAnalyzer {
    /// 글로벌 인스턴스 초기화 (splash.rs에서 호출)
    pub fn initialize(model_dir: PathBuf) -> Result<()> {
        println!(
            "Loading ONNX model and tokenizer from '{}'...",
            model_dir.display()
        );

        let session = Session::builder()?
            .with_execution_providers([CPUExecutionProvider::default().into()])?
            .commit_from_file(model_dir.join("model.onnx"))?;

        let tokenizer = Tokenizer::from_file(model_dir.join("tokenizer.json"))
            .map_err(|e| anyhow::anyhow!("Failed to load tokenizer: {}", e))?;

        let analyzer = SentimentAnalyzer {
            session: Mutex::new(session),
            tokenizer: Mutex::new(tokenizer),
        };

        GLOBAL_SENTIMENT_ANALYZER
            .set(analyzer)
            .map_err(|_| anyhow::anyhow!("SentimentAnalyzer already initialized"))?;

        println!("Model and tokenizer loaded successfully.");
        Ok(())
    }

    /// 글로벌 인스턴스 반환
    pub fn global() -> Option<&'static SentimentAnalyzer> {
        GLOBAL_SENTIMENT_ANALYZER.get()
    }

    /// 텍스트 감정 분석 수행
    pub fn analyze(&self, text: &str) -> Result<AnalysisResult, String> {
        let tokenizer = self
            .tokenizer
            .lock()
            .map_err(|e| format!("Failed to lock tokenizer: {}", e))?;
        let mut session = self
            .session
            .lock()
            .map_err(|e| format!("Failed to lock session: {}", e))?;

        let encoding = tokenizer
            .encode(text, true)
            .map_err(|e| format!("Failed to encode text: {}", e))?;
        let input_ids = encoding.get_ids();
        let attention_mask = encoding.get_attention_mask();
        let token_type_ids = encoding.get_type_ids();
        let seq_len = input_ids.len();

        let ids_array = Array::from_vec(input_ids.iter().map(|&x| x as i64).collect())
            .into_shape_with_order((1, seq_len))
            .map_err(|e| e.to_string())?;
        let mask_array = Array::from_vec(attention_mask.iter().map(|&x| x as i64).collect())
            .into_shape_with_order((1, seq_len))
            .map_err(|e| e.to_string())?;
        let type_ids_array = Array::from_vec(token_type_ids.iter().map(|&x| x as i64).collect())
            .into_shape_with_order((1, seq_len))
            .map_err(|e| e.to_string())?;

        let inputs = vec![
            (
                "input_ids".to_string(),
                Value::from_array(ids_array).map_err(|e| e.to_string())?,
            ),
            (
                "attention_mask".to_string(),
                Value::from_array(mask_array).map_err(|e| e.to_string())?,
            ),
            (
                "token_type_ids".to_string(),
                Value::from_array(type_ids_array).map_err(|e| e.to_string())?,
            ),
        ];

        // 모델 추론 실행
        let outputs = session
            .run(inputs)
            .map_err(|e| format!("Model inference failed: {}", e))?;

        let logits_tensor = outputs["logits"]
            .try_extract_tensor::<f32>()
            .map_err(|e| format!("Failed to extract 'logits' tensor: {}", e))?;

        let (shape, data) = logits_tensor;

        let shape_usize: Vec<usize> = shape.iter().map(|&d| d as usize).collect();
        let array = Array::from_shape_vec(shape_usize.as_slice(), data.to_vec())
            .map_err(|e| format!("Failed to create ndarray from tensor data: {}", e))?;

        let array_2d = array
            .into_dimensionality::<Ix2>()
            .map_err(|e| format!("Failed to convert ndarray to 2D: {}", e))?;

        let neg_logit = array_2d[[0, 0]];
        let pos_logit = array_2d[[0, 1]];

        let logit_diff = pos_logit - neg_logit;
        let score = logit_diff.tanh() * 2.0;
        let final_score = (score * 100.0).round() / 100.0;

        let sentiment = if final_score >= SENTIMENT_THRESHOLD {
            Sentiment::Positive
        } else if final_score <= -SENTIMENT_THRESHOLD {
            Sentiment::Negative
        } else {
            Sentiment::Neutral
        };

        Ok(AnalysisResult {
            sentiment,
            score: final_score,
        })
    }
}
