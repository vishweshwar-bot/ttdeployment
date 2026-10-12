package com.audiensense.service;

import com.audiensense.repository.MovieRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;

public class GeminiChatServiceTest {

    @Test
    public void testSmartFallbackGreeting() {
        MovieRepository movieRepository = Mockito.mock(MovieRepository.class);
        RestTemplate restTemplate = new RestTemplate();
        GeminiChatService service = new GeminiChatService(restTemplate, movieRepository);

        String replyEn = service.generateSmartFallback("hi", "English");
        assertNotNull(replyEn);
        assertTrue(replyEn.contains("AudienSense AI"));

        String replyTe = service.generateSmartFallback("hello", "Telugu");
        assertNotNull(replyTe);
        assertTrue(replyTe.contains("AudienSense AI"));

        String replyAction = service.generateSmartFallback("recommend me some action movies", "English");
        assertNotNull(replyAction);
        assertTrue(replyAction.contains("The Dark Knight") || replyAction.contains("recommend") || replyAction.contains("Action"));
    }
}
