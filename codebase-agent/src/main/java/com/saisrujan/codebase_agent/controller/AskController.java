package com.saisrujan.codebase_agent.controller;

import com.saisrujan.codebase_agent.dto.AskRequest;
import com.saisrujan.codebase_agent.dto.AskResponse;
import com.saisrujan.codebase_agent.service.CodebaseAgentService;

import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class AskController {

    private final CodebaseAgentService codebaseAgentService;

    public AskController(CodebaseAgentService codebaseAgentService) {
        this.codebaseAgentService = codebaseAgentService;
    }
    
    @PostMapping("/ask")
    public AskResponse ask(@RequestBody AskRequest request) {
        return codebaseAgentService.askQuestion(request.getQuestion());
    }
}
