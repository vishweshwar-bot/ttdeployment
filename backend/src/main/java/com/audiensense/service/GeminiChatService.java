package com.audiensense.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class GeminiChatService {

    private static final String PERSONITY_PROMPT =
            "You are AudienSense AI, an empathetic, passionate movie expert. "
                    + "Respond with warmth and enthusiasm. Give personalized movie recommendations "
                    + "especially for Tollywood and Hollywood blockbusters based on the user's mood or request. "
                    + "Keep responses conversational and relatively brief.";

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiChatService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String chat(String message, String language) {
        if (message == null || message.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Message cannot be empty");
        }

        String langInstruction = (language != null && !language.isBlank() && !language.equalsIgnoreCase("All Languages")) 
                ? " You MUST reply entirely in " + language + "." : "";
        String prompt = PERSONITY_PROMPT + langInstruction + " User says: " + message.trim();
        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        String endpoint = apiUrl + "?key=" + apiKey;

        try {
            JsonNode response = restTemplate.postForEntity(endpoint, request, JsonNode.class).getBody();

            if (response == null || response.path("candidates").isEmpty()) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY,
                        "Gemini returned no candidate response");
            }

            JsonNode candidate = response.path("candidates").path(0);
            JsonNode parts = candidate.path("content").path("parts");
            if (parts.isEmpty() || parts.path(0).path("text").asText().isBlank()) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY,
                        "Gemini returned no text response");
            }

            String text = parts.path(0).path("text").asText().trim();
            if (text.isBlank()) {
                throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY,
                        "Gemini returned an empty text response");
            }

            return text;
        } catch (HttpClientErrorException exception) {
            System.err.println("Gemini API error response: " + exception.getStatusCode());
            exception.printStackTrace();
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY,
                    "Gemini API request failed with status " + exception.getStatusCode(), exception);
        } catch (ResponseStatusException exception) {
            exception.printStackTrace();
            throw exception;
        } catch (Exception exception) {
            exception.printStackTrace();
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY,
                    "Unable to process Gemini AI response", exception);
        }
    }
}
