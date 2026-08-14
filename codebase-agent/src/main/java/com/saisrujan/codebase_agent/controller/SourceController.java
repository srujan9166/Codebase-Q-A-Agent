package com.saisrujan.codebase_agent.controller;

import com.saisrujan.codebase_agent.entity.CodeChunk;
import com.saisrujan.codebase_agent.service.SourceService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class SourceController {

    private final SourceService sourceService;

    public SourceController(SourceService sourceService) {
        this.sourceService = sourceService;
    }

    @GetMapping("/sources/{id}")
    public ResponseEntity<?> getSourceById(@PathVariable Long id) {
        Optional<CodeChunk> sourceOpt = sourceService.getSourceById(id);
        
        if (sourceOpt.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Source code chunk not found"));
        }
        
        return ResponseEntity.ok(sourceOpt.get());
    }
}
