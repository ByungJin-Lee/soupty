use anyhow::Result;
use ndarray::{Array, CowArray, Ix2};
use ort::session::builder::GraphOptimizationLevel;
use ort::session::Session;
use ort::value::Value;
use std::path::Path;
use std::sync::Mutex;
use tauri::State;
use tokenizers::Tokenizer;

/// 분석 결과를 프론트엔드로 전달하기 위한 구조체입니다.
#[derive(serde::Serialize)]
pub struct AnalysisResult {
    pub label: String,
    pub score: f32,
}

/// ONNX 모델의 출력(logits)을 0과 1 사이의 확률 값으로 변환하는 소프트맥스 함수입니다.
fn softmax(array: &CowArray<'_, f32, Ix2>) -> Vec<f32> {
    let max_val = array.iter().fold(f32::NEG_INFINITY, |a, &b| a.max(b));
    let exps: Vec<f32> = array.iter().map(|&x| (x - max_val).exp()).collect();
    let sum_exps: f32 = exps.iter().sum();
    exps.into_iter().map(|x| x / sum_exps).collect()
}

/// ONNX 세션과 토크나이저를 함께 보관할 상태(State) 구조체입니다.
pub struct OnnxSession {
    pub session: Mutex<Session>,
    pub tokenizer: Mutex<Tokenizer>,
}

impl OnnxSession {
    /// 모델과 토크나이저를 로드하여 새로운 OnnxSession 인스턴스를 생성합니다.
    pub fn new() -> Result<Self> {
        let model_dir = Path::new("ai-models/korean-hatespeech-classifier");

        println!(
            "Loading ONNX model and tokenizer from '{}'...",
            model_dir.display()
        );

        // ort 2.0에서는 Environment를 명시적으로 만들 필요 없이 바로 빌더를 시작할 수 있습니다.
        // 내부적으로 기본 Environment가 사용됩니다.
        let session = Session::builder()?
            .with_optimization_level(GraphOptimizationLevel::Level3)?
            .commit_from_file(model_dir.join("model.onnx"))?;

        let tokenizer = Tokenizer::from_file(model_dir.join("tokenizer.json"))
            .map_err(|e| anyhow::anyhow!("Tokenizer 로딩 실패: {}", e))?;

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
        .map_err(|e| format!("Tokenizer 잠금 실패: {}", e))?;
    let session = state
        .session
        .lock()
        .map_err(|e| format!("Session 잠금 실패: {}", e))?;

    let encoding = tokenizer.encode(&*text, true).map_err(|e| e.to_string())?;

    let input_ids: Vec<i64> = encoding.get_ids().iter().map(|&x| x as i64).collect();
    let attention_mask: Vec<i64> = encoding
        .get_attention_mask()
        .iter()
        .map(|&x| x as i64)
        .collect();

    let input_len = input_ids.len();

    let array_input_ids = Array::from_shape_vec((1, input_len), input_ids)
        .map_err(|e| format!("input_ids 배열 생성 실패: {}", e))?;
    let array_attention_mask = Array::from_shape_vec((1, input_len), attention_mask)
        .map_err(|e| format!("attention_mask 배열 생성 실패: {}", e))?;

    let inputs = ort::inputs! {
        "input_ids" => Value::from_array(array_input_ids).map_err(|e| format!("input_ids 값 생성 실패: {}", e))?,
        "attention_mask" => Value::from_array(array_attention_mask).map_err(|e| format!("attention_mask 값 생성 실패: {}", e))?,
    };

    let outputs = session
        .run(inputs)
        .map_err(|e| format!("모델 추론 실패: {}", e))?;

    let output_tensor = outputs["logits"]
        .try_extract_tensor::<f32>()
        .map_err(|e| format!("'logits' 텐서 추출 실패: {}", e))?;

    let probabilities = softmax(&output_tensor.view().into());

    let labels = ["negative", "positive"];
    let (max_idx, max_prob) =
        probabilities
            .iter()
            .enumerate()
            .fold((0, 0.0f32), |(idx_max, val_max), (idx, &val)| {
                if val > val_max {
                    (idx, val)
                } else {
                    (idx_max, val_max)
                }
            });

    let result = AnalysisResult {
        label: labels[max_idx].to_string(),
        score: max_prob,
    };

    Ok(result)
}
