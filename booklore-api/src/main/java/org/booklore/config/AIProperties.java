package org.booklore.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.ai")
public class AIProperties {
    private boolean enabled = false;
    private String apiKey;
    private String baseUrl = "https://api.groq.com/openai/v1/chat/completions";
    private String model = "llama-3.1-70b-versatile";
}
