use anyhow::Result;
use ndarray::{Array, Ix2};
use ort::execution_providers::CPUExecutionProvider;
use ort::session::Session;
use ort::value::Value;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use tokenizers::Tokenizer;

pub const SENTIMENT_THRESHOLD: f32 = 1.7;

/// 분석 결과를 프론트엔드로 전달하기 위한 구조체입니다.
#[derive(serde::Serialize)]
pub struct AnalysisResult {
    pub sentiment: Sentiment,
    pub score: f32,
}

#[derive(serde::Serialize, Clone, Copy, Debug)]
pub enum Sentiment {
    Positive,
    Negative,
    Neutral,
}

/// ONNX 세션과 토크나이저를 함께 보관할 상태(State) 구조체입니다.
pub struct OnnxSession {
    pub session: Mutex<Session>,
    pub tokenizer: Mutex<Tokenizer>,
}

impl OnnxSession {
    /// 모델과 토크나이저를 로드하여 새로운 OnnxSession 인스턴스를 생성합니다.
    pub fn new(model_dir: PathBuf) -> Result<Self> {
        println!(
            "Loading ONNX model and tokenizer from '{}'...",
            model_dir.display()
        );

        // ort 2.0에서는 Environment를 명시적으로 만들 필요 없이 바로 빌더를 시작할 수 있습니다.
        // 내부적으로 기본 Environment가 사용됩니다.
        let session = Session::builder()?
            // .with_optimization_level(GraphOptimizationLevel::Level3)?
            .with_execution_providers([CPUExecutionProvider::default().into()])?
            .commit_from_file(model_dir.join("model.onnx"))?;

        let tokenizer = Tokenizer::from_file(model_dir.join("tokenizer.json"))
            .map_err(|e| anyhow::anyhow!("Failed to load tokenizer: {}", e))?;

        println!("Model and tokenizer loaded successfully.");

        Ok(Self {
            session: Mutex::new(session),
            tokenizer: Mutex::new(tokenizer),
        })
    }
}

/// 프론트엔드에서 호출할 Tauri 커맨드 함수입니다.
#[tauri::command]
pub async fn analyze_chat(
    text: String,
    state: State<'_, OnnxSession>,
) -> std::result::Result<AnalysisResult, String> {
    // 이 부분은 이전의 안정성이 강화된 코드와 동일합니다.
    let tokenizer = state
        .tokenizer
        .lock()
        .map_err(|e| format!("Failed to lock tokenizer: {}", e))?;
    let mut session = state
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

    // 1. `try_extract_tensor`를 호출하여 `Result<(&Shape, &[f32])>`를 받습니다.
    let logits_tensor = outputs["logits"]
        .try_extract_tensor::<f32>()
        .map_err(|e| format!("Failed to extract 'logits' tensor: {}", e))?;

    // 2. 튜플을 모양(shape)과 데이터 슬라이스(&[f32])로 분해합니다.
    let (shape, data) = logits_tensor;

    // 3. 모양과 데이터를 사용하여 `ndarray::Array`를 생성합니다.
    let shape_usize: Vec<usize> = shape.iter().map(|&d| d as usize).collect();
    let array = Array::from_shape_vec(shape_usize.as_slice(), data.to_vec())
        .map_err(|e| format!("Failed to create ndarray from tensor data: {}", e))?;

    // 4. 생성된 `ndarray`를 `CowArray`로 변환하여 softmax 함수에 전달합니다.
    let array_2d = array
        .into_dimensionality::<Ix2>()
        .map_err(|e| format!("Failed to convert ndarray to 2D: {}", e))?;
    // 이 부분은 로짓만으로도 is_positive를 판단할 수 있지만, softmax를 통해 명시적으로 계산하는 것이 더 안전하고 명확합니다.

    // 4-2. 로짓 값을 직접 사용하여 점수(-2.0 ~ +2.0) 계산
    // array_2d는 [[부정 로짓, 긍정 로짓]] 형태의 2D 배열임
    let neg_logit = array_2d[[0, 0]];
    let pos_logit = array_2d[[0, 1]];

    // 로짓 값의 차이를 계산
    let logit_diff = pos_logit - neg_logit;

    // tanh 함수를 사용하여 값을 -1.0 ~ +1.0 사이로 압축하고, 2를 곱해 -2.0 ~ +2.0 범위로 스케일링
    let score = logit_diff.tanh() * 2.0;

    // 소수점 첫째 자리까지 반올림
    let final_score = (score * 100.0).round() / 100.0;

    let sentiment: Sentiment; // 타입을 Sentiment Enum으로 변경

    if final_score >= SENTIMENT_THRESHOLD {
        sentiment = Sentiment::Positive; // 강력한 긍정
    } else if final_score <= -SENTIMENT_THRESHOLD {
        sentiment = Sentiment::Negative; // 강력한 부정
    } else {
        sentiment = Sentiment::Neutral; // 애매하거나 중립적인 감정
    }

    let result = AnalysisResult {
        sentiment,
        score: final_score,
    };

    Ok(result)
}
