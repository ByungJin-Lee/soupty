use hangul::HangulExt;

pub fn decompose_hangul_to_string(text: &str) -> String {
    text.chars().fold("".to_owned(), |acc, c| {
        acc + &c
            .jamos()
            .map(|j| j.collect::<String>())
            .unwrap_or(c.to_string())
    })
}
