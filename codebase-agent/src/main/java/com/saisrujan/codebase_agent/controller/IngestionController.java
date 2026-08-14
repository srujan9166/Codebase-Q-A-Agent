package com.saisrujan.codebase_agent.controller;

import com.saisrujan.codebase_agent.dto.IngestionResponse;
import com.saisrujan.codebase_agent.service.IngestionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class IngestionController {

    private final IngestionService ingestionService;
    private final com.saisrujan.codebase_agent.service.CodebaseAgentService codebaseAgentService;

    public IngestionController(IngestionService ingestionService, com.saisrujan.codebase_agent.service.CodebaseAgentService codebaseAgentService) {
        this.ingestionService = ingestionService;
        this.codebaseAgentService = codebaseAgentService;
    }

    @GetMapping("/ingest/status")
    public ResponseEntity<?> getIngestionStatus() {
        long count = codebaseAgentService.getChunksCount();
        return ResponseEntity.ok(Map.of(
            "indexed", count > 0,
            "chunksCount", count
        ));
    }

    @PostMapping(value = "/ingest", consumes = "multipart/form-data")
    public ResponseEntity<?> ingestCodebase(@RequestParam("file") MultipartFile file) {
        try {
            IngestionResponse response = ingestionService.ingestZip(file);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Ingestion failed: " + e.getMessage()));
        }
    }
}
