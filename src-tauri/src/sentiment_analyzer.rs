use anyhow::Result;
use ndarray::{Array, CowArray, Ix2};
use ort::execution_providers::CPUExecutionProvider;
use ort::session::Session;
use ort::value::Value;
use std::path::Path;
use std::sync::Mutex;
use tauri::State;
use tokenizers::Tokenizer;

/// 분석 결과를 프론트엔드로 전달하기 위한 구조체입니다.
#[derive(serde::Serialize)]
pub struct AnalysisResult {
    pub is_positive: bool,
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
        let model_dir = Path::new("ai-models/sentiment");

        println!(
            "Loading ONNX model and tokenizer from '{}'...",
            model_dir.display()
        );

        // ort 2.0에서는 Environment를 명시적으로 만들 필요 없이 바로 빌더를 시작할 수 있습니다.
        // 내부적으로 기본 Environment가 사용됩니다.
        let session = Session::builder()?
            // .with_optimization_level(GraphOptimizationLevel::Level3)?
            .with_execution_providers([CPUExecutionProvider::default().into()])?
            .commit_from_file(model_dir.join("koelectra_sentiment.onnx"))?;

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
    println!("{}", text);

    // 이 부분은 이전의 안정성이 강화된 코드와 동일합니다.
    let tokenizer = state
        .tokenizer
        .lock()
        .map_err(|e| format!("Tokenizer 잠금 실패: {}", e))?;
    let mut session = state
        .session
        .lock()
        .map_err(|e| format!("Session 잠금 실패: {}", e))?;

    let encoding = tokenizer.encode(text, true).unwrap();
    let input_ids = encoding.get_ids();
    let attention_mask = encoding.get_attention_mask();
    let token_type_ids = encoding.get_type_ids();
    let seq_len = input_ids.len();

    // let array_input_ids = Array::from_shape_vec((1, input_len), input_ids)
    //     .map_err(|e| format!("input_ids 배열 생성 실패: {}", e))?;
    // let array_attention_mask = Array::from_shape_vec((1, input_len), attention_mask)
    //     .map_err(|e| format!("attention_mask 배열 생성 실패: {}", e))?;

    // let inputs = ort::inputs! {
    //     "input_ids" => Value::from_array(array_input_ids).map_err(|e| format!("input_ids 값 생성 실패: {}", e))?,
    //     "attention_mask" => Value::from_array(array_attention_mask).map_err(|e| format!("attention_mask 값 생성 실패: {}", e))?,
    // };

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
        .map_err(|e| format!("모델 추론 실패: {}", e))?;

    // 1. `try_extract_tensor`를 호출하여 `Result<(&Shape, &[f32])>`를 받습니다.
    let logits_tensor = outputs["logits"]
        .try_extract_tensor::<f32>()
        .map_err(|e| format!("'logits' 텐서 추출 실패: {}", e))?;

    // 2. 튜플을 모양(shape)과 데이터 슬라이스(&[f32])로 분해합니다.
    let (shape, data) = logits_tensor;

    // 3. 모양과 데이터를 사용하여 `ndarray::Array`를 생성합니다.
    let shape_usize: Vec<usize> = shape.iter().map(|&d| d as usize).collect();
    let array = Array::from_shape_vec(shape_usize.as_slice(), data.to_vec())
        .map_err(|e| format!("텐서 데이터로 ndarray 생성 실패: {}", e))?;

    // 4. 생성된 `ndarray`를 `CowArray`로 변환하여 softmax 함수에 전달합니다.
    let array_2d = array
        .into_dimensionality::<Ix2>()
        .map_err(|e| format!("ndarray 2D 변환 실패: {}", e))?;
    let probabilities = softmax(&CowArray::from(&array_2d));

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
        is_positive: max_idx == 1,
        score: max_prob,
    };

    Ok(result)
}
