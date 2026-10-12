package com.audiensense.service;

import com.audiensense.entity.Movie;
import com.audiensense.repository.MovieRepository;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class GeminiChatService {

    private static final Logger log = LoggerFactory.getLogger(GeminiChatService.class);

    private static final String PERSONITY_PROMPT =
            "You are AudienSense AI, an empathetic, passionate movie expert. "
                    + "Respond with warmth and enthusiasm. Give personalized movie recommendations "
                    + "especially for Tollywood and Hollywood blockbusters based on the user's mood or request. "
                    + "Keep responses conversational, engaging, and relatively brief.";

    private final RestTemplate restTemplate;
    private final MovieRepository movieRepository;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;

    public GeminiChatService(RestTemplate restTemplate, MovieRepository movieRepository) {
        this.restTemplate = restTemplate;
        this.movieRepository = movieRepository;
    }

    public String chat(String message, String language) {
        if (message == null || message.isBlank()) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Message cannot be empty");
        }

        String trimmedMessage = message.trim();
        String selectedLanguage = (language != null && !language.isBlank()) ? language.trim() : "English";

        // If Gemini API Key is missing or default placeholder, gracefully use smart local recommendation
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("your_") || apiKey.contains("PLACEHOLDER")) {
            log.info("GEMINI_API_KEY is not configured or placeholder. Serving intelligent fallback recommendations.");
            return generateSmartFallback(trimmedMessage, selectedLanguage);
        }

        // Try primary model first, with fallback to gemini-1.5-flash
        List<String> targetUrls = buildCandidateUrls(apiUrl);

        for (String endpointUrl : targetUrls) {
            try {
                String responseText = callGeminiEndpoint(endpointUrl, trimmedMessage, selectedLanguage);
                if (responseText != null && !responseText.isBlank()) {
                    return responseText;
                }
            } catch (HttpStatusCodeException e) {
                log.warn("Gemini API call to {} failed with status {}: {}", endpointUrl, e.getStatusCode(), e.getResponseBodyAsString());
            } catch (Exception e) {
                log.warn("Gemini API call to {} failed: {}", endpointUrl, e.getMessage());
            }
        }

        // If all Gemini endpoints fail (rate limit, quota exceeded, network timeout, or invalid key),
        // fallback gracefully so user always receives delightful, meaningful movie recommendations!
        log.warn("All Gemini API calls failed. Seamlessly serving smart conversational movie recommendations.");
        return generateSmartFallback(trimmedMessage, selectedLanguage);
    }

    private List<String> buildCandidateUrls(String configuredUrl) {
        List<String> urls = new ArrayList<>();
        if (configuredUrl != null && !configuredUrl.isBlank()) {
            urls.add(configuredUrl.trim());
        }
        // Fallback models in case configured model (e.g. gemini-flash-latest or gemini-2.0-flash) is unavailable
        String flash20 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
        String flash15 = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

        if (!urls.contains(flash20)) {
            urls.add(flash20);
        }
        if (!urls.contains(flash15)) {
            urls.add(flash15);
        }
        return urls;
    }

    private String callGeminiEndpoint(String baseUrl, String userMessage, String language) {
        String langInstruction = (language != null && !language.equalsIgnoreCase("All Languages"))
                ? " You MUST reply entirely in " + language + "." : "";
        String prompt = PERSONITY_PROMPT + langInstruction + " User says: " + userMessage;

        Map<String, Object> payload = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                ))
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
        String endpoint = baseUrl + (baseUrl.contains("?") ? "&key=" : "?key=") + apiKey.trim();

        JsonNode response = restTemplate.postForEntity(endpoint, request, JsonNode.class).getBody();
        if (response == null || response.path("candidates").isEmpty()) {
            return null;
        }

        JsonNode candidate = response.path("candidates").path(0);
        JsonNode parts = candidate.path("content").path("parts");
        if (parts.isEmpty()) {
            return null;
        }

        String text = parts.path(0).path("text").asText().trim();
        return text.isBlank() ? null : text;
    }

    /**
     * Generates a warm, highly-personalized conversational response using the local movie database.
     * Guarantees 100% uptime for AudienSense AI even if the remote LLM quota/network is unreachable.
     */
    public String generateSmartFallback(String userMessage, String language) {
        String lower = userMessage.toLowerCase(Locale.ROOT);
        boolean isTelugu = "Telugu".equalsIgnoreCase(language);
        boolean isHindi = "Hindi".equalsIgnoreCase(language);
        boolean isTamil = "Tamil".equalsIgnoreCase(language);

        // Greetings
        if (lower.matches(".*\\b(hi|hello|hey|namaste|vanakkam|namaskaram|greetings|start|hola)\\b.*")) {
            if (isTelugu) {
                return "నమస్కారం! నేను AudienSense AI. మీకు నచ్చిన టాలీవుడ్ మరియు హాలీవుడ్ సూపర్ హిట్ సినిమాలను రికమండ్ చేయడానికి ఇక్కడ ఉన్నాను. మీకు ఏ జానర్ లేదా హీరో సినిమా చూడాలని ఉంది?";
            } else if (isHindi) {
                return "नमस्ते! मैं हूँ AudienSense AI. टॉलीवुड और हॉलीवुड की बेहतरीन मूवी सिफारिशों के लिए मैं यहाँ हूँ। आज आप किस जॉनर या मूड की फिल्म देखना चाहते हैं?";
            } else if (isTamil) {
                return "வணக்கம்! நான் AudienSense AI. உங்களுக்கு பிடித்த பிளாக்பஸ்டர் திரைப்படங்களை பரிந்துரைக்க நான் தயார். இன்று என்ன வகையான திரைப்படம் பார்க்க விரும்புகிறீர்கள்?";
            }
            return "Hey there! 🎬 I'm AudienSense AI, your movie expert. Whether you're in the mood for high-octane Tollywood mass action, mind-bending Hollywood sci-fi, or a touching drama, I've got you covered! What are you in the mood for today?";
        }

        // Match Genre or mood
        String detectedGenre = null;
        if (lower.contains("action") || lower.contains("mass") || lower.contains("fight") || lower.contains("thrill")) {
            detectedGenre = "Action";
        } else if (lower.contains("sci-fi") || lower.contains("science") || lower.contains("space") || lower.contains("time")) {
            detectedGenre = "Sci-Fi";
        } else if (lower.contains("drama") || lower.contains("emotional") || lower.contains("story")) {
            detectedGenre = "Drama";
        } else if (lower.contains("comedy") || lower.contains("funny") || lower.contains("laugh")) {
            detectedGenre = "Comedy";
        } else if (lower.contains("romance") || lower.contains("romantic") || lower.contains("love")) {
            detectedGenre = "Romance";
        } else if (lower.contains("horror") || lower.contains("scary") || lower.contains("ghost")) {
            detectedGenre = "Horror";
        } else if (lower.contains("crime") || lower.contains("mafia") || lower.contains("gangster") || lower.contains("detective")) {
            detectedGenre = "Crime";
        }

        // Query database for matching movies
        List<Movie> matchedMovies = new ArrayList<>();
        try {
            if (detectedGenre != null) {
                var page = movieRepository.findFiltered(null, detectedGenre, org.springframework.data.domain.PageRequest.of(0, 4));
                if (page != null && page.getContent() != null) {
                    matchedMovies = page.getContent();
                }
            }
            if (matchedMovies.isEmpty()) {
                var trendingList = movieRepository.findTrending();
                if (trendingList != null) {
                    matchedMovies = trendingList.stream().limit(4).toList();
                }
            }
        } catch (Exception e) {
            log.warn("Database lookup in smart fallback: {}", e.getMessage());
        }

        if (matchedMovies.isEmpty()) {
            // Built-in cinematic essentials fallback
            if (isTelugu) {
                return "మీ కోసం కొన్ని ఆల్‌టైమ్ బ్లాక్‌బస్టర్స్:\n1. RRR - ఎస్.ఎస్. రాజమౌళి విజువల్ మాస్టర్‌పీస్ ⭐ 8.8\n2. బాహుబలి 2 - భారతీయ సినిమా గర్వకారణం ⭐ 8.2\n3. ఇంటర్‌స్టెల్లార్ - అద్భుతమైన సైన్స్ ఫిక్షన్ ఎపిక్ ⭐ 8.7\nమీరు వీటిలో ఏది చూడాలనుకుంటున్నారు?";
            } else if (isHindi) {
                return "यहाँ आपके लिए कुछ शानदार सिफारिशें हैं:\n1. RRR - राजामौली की अविश्वसनीय एक्शन मास्टरपीस ⭐ 8.8\n2. द डार्क नाइट - क्रिस्टोफर नोलन की क्लासिक ⭐ 9.0\n3. इंटरस्टेलर - एक अविस्मरणीय साइंस-फाई यात्रा ⭐ 8.7\nक्या आप इनमें से कोई देखना चाहेंगे?";
            }
            return "Here are top-tier recommendations for you:\n"
                    + "⭐ The Dark Knight (IMDb 9.0) - Christopher Nolan's legendary superhero masterpiece.\n"
                    + "⭐ Interstellar (IMDb 8.7) - An emotional, breathtaking space epic.\n"
                    + "⭐ Baahubali 2 / RRR (IMDb 8.2+) - Indian cinema at its grandest scale.\n"
                    + "Let me know your favorite genre or actors, and I'll tailor even more suggestions!";
        }

        // Build engaging response with actual database movies
        StringBuilder sb = new StringBuilder();
        if (detectedGenre != null) {
            sb.append("Here are handpicked **").append(detectedGenre).append("** blockbusters you'll love:\n\n");
        } else {
            sb.append("Here are top-rated movies highly recommended right now:\n\n");
        }

        for (Movie m : matchedMovies) {
            sb.append("🎬 **").append(m.getTitle()).append("**");
            if (m.getImdbRating() != null && m.getImdbRating() > 0) {
                sb.append(" (⭐ ").append(m.getImdbRating()).append(" IMDb)");
            }
            if (m.getGenre() != null) {
                sb.append(" • ").append(m.getGenre());
            }
            sb.append("\n");
            if (m.getDescription() != null && !m.getDescription().isBlank() && !m.getDescription().contains("placehold")) {
                String desc = m.getDescription();
                if (desc.length() > 110) desc = desc.substring(0, 107) + "...";
                sb.append("   _").append(desc).append("_\n");
            }
            if (m.getOttPlatform() != null && !m.getOttPlatform().isBlank()) {
                sb.append("   Streaming on: ").append(m.getOttPlatform()).append("\n");
            }
            sb.append("\n");
        }
        sb.append("Which one catches your eye, or would you like another genre?");
        return sb.toString().trim();
    }
}

