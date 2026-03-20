package org.booklore.service;

import tools.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.booklore.model.dto.settings.AISettings;
import org.booklore.service.appsettings.AppSettingService;
import org.booklore.model.entity.BookMetadataEntity;
import org.booklore.repository.BookMetadataRepository;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final HttpClient httpClient;
    private final AppSettingService appSettingService;
    private final BookMetadataRepository bookMetadataRepository;
    private final ObjectMapper objectMapper;

    public String chat(String userMessage) throws Exception {
        AISettings aiSettings = appSettingService.getAppSettings().getAiSettings();
        if (aiSettings == null || !aiSettings.isEnabled()) {
            return "L'assistant IA est actuellement désactivé.";
        }

        List<BookMetadataEntity> allMetadata = bookMetadataRepository.findAll();
        
        String bookContext = allMetadata.stream()
                .map(m -> String.format("- \"%s\" par %s (Genre: %s). Résumé: %s",
                        m.getTitle(),
                        m.getAuthors() != null ? m.getAuthors().stream().map(a -> a.getName()).collect(Collectors.joining(", ")) : "Inconnu",
                        m.getCategories() != null ? m.getCategories().stream().map(c -> c.getName()).collect(Collectors.joining(", ")) : "Non classé",
                        m.getDescription() != null ? (m.getDescription().length() > 200 ? m.getDescription().substring(0, 200) + "..." : m.getDescription()) : "Pas de résumé"))
                .collect(Collectors.joining("\n"));

        String systemMessage = "Tu es l'assistant de Booklore, un système de gestion de bibliothèque personnelle. " +
                "Ton but est d'aider l'utilisateur à naviguer dans ses livres. " +
                "Réponds en français de manière amicale.\n" +
                "Voici la liste des livres de l'utilisateur :\n" + bookContext;

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", aiSettings.getModel());
        requestBody.put("messages", List.of(
                Map.of("role", "system", "content", systemMessage),
                Map.of("role", "user", "content", userMessage)
        ));

        String jsonBody = objectMapper.writeValueAsString(requestBody);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(aiSettings.getBaseUrl()))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + aiSettings.getApiKey())
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Erreur Groq API: {} - {}", response.statusCode(), response.body());
            return "Une erreur est survenue lors de la communication avec l'IA.";
        }

        Map<String, Object> responseMap = objectMapper.readValue(response.body(), Map.class);
        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
        if (choices != null && !choices.isEmpty()) {
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        }

        return "Je n'ai pas pu générer de réponse.";
    }
}
