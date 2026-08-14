package com.saisrujan.codebase_agent.dto;

public record Source(
        Long id,
        String filePath,
        int startLine,
        int endLine
) {
}