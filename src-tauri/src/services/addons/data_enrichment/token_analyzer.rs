use lazy_static::lazy_static;
use lindera::dictionary::load_dictionary_from_kind;
use lindera::mode::Mode;
use lindera::segmenter::Segmenter;
use lindera::tokenizer::Tokenizer;
use lindera::LinderaResult;

pub struct TokenAnalyzer {
    tokenizer: Tokenizer,
}

lazy_static! {
    static ref GLOBAL_TOKEN_ANALYZER: TokenAnalyzer =
        TokenAnalyzer::new().expect("Failed to initialize TokenAnalyzer");
}

impl TokenAnalyzer {
    pub fn new() -> LinderaResult<Self> {
        let dic = load_dictionary_from_kind(lindera::dictionary::DictionaryKind::KoDic)?;
        let segmenter = Segmenter::new(Mode::Normal, dic, None);
        let tokenizer = Tokenizer::new(segmenter);

        Ok(Self { tokenizer })
    }

    pub fn global() -> &'static TokenAnalyzer {
        &GLOBAL_TOKEN_ANALYZER
    }

    pub fn tokenize(&self, text: &str) -> Vec<String> {
        match self.tokenizer.tokenize(text) {
            Ok(mut tokens) => {
                tokens
                    .iter_mut()
                    .filter_map(|token| {
                        let details = token.details();
                        if details.len() > 0 {
                            match details[0].as_ref() {
                                "NNG" | "NNP" => Some(token.text.to_string()),
                                // NNB 의존명사 제외
                                _ => None,
                            }
                        } else {
                            None
                        }
                    })
                    .collect()
            }
            Err(_) => Vec::new(),
        }
    }
}
