pub struct TokenAnalyzer;

impl TokenAnalyzer {
    pub fn new() -> Self {
        Self
    }

    pub fn tokenize(&self, text: &str) -> Vec<String> {
        text.split_whitespace()
            .map(|word| self.clean_token(word))
            .filter(|token| !token.is_empty())
            .collect()
    }

    fn clean_token(&self, token: &str) -> String {
        token
            .chars()
            .filter(|c| c.is_alphanumeric() || c.is_whitespace() || *c == '_' || *c == '-')
            .collect::<String>()
            .trim()
            .to_lowercase()
    }
}
