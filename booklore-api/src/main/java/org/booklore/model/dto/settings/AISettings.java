package org.booklore.model.dto.settings;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AISettings {
    @Builder.Default
    private boolean enabled = false;
    @Builder.Default
    private String apiKey = "";
    @Builder.Default
    private String baseUrl = "https://api.groq.com/openai/v1/chat/completions";
    @Builder.Default
    private String model = "llama-3.3-70b-versatile";
}
