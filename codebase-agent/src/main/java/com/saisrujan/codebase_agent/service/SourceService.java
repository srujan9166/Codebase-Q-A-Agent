package com.saisrujan.codebase_agent.service;

import com.saisrujan.codebase_agent.entity.CodeChunk;
import com.saisrujan.codebase_agent.repository.CodeChunkRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SourceService {

    private final CodeChunkRepository codeChunkRepository;

    public SourceService(CodeChunkRepository codeChunkRepository) {
        this.codeChunkRepository = codeChunkRepository;
    }

    public Optional<CodeChunk> getSourceById(Long id) {
        return codeChunkRepository.findById(id);
    }
}
