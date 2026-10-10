package com.audiensense.controller;

import com.audiensense.dto.ChatResponse;
import com.audiensense.service.GeminiChatService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final GeminiChatService geminiChatService;

    public ChatController(GeminiChatService geminiChatService) {
        this.geminiChatService = geminiChatService;
    }

    @PostMapping
    public ChatResponse chat(@RequestBody Map<String, String> request) {
        return new ChatResponse(geminiChatService.chat(request.get("message"), request.get("language")));
    }
}
