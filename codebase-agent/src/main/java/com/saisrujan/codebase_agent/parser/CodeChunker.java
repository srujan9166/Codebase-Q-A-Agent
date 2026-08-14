package com.saisrujan.codebase_agent.parser;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.saisrujan.codebase_agent.entity.CodeChunk;

@Service
public class CodeChunker {

    private static final int MAX_CHUNK_LINES = 50;
    private static final int OVERLAP_LINES = 10;

    public List<CodeChunk> chunkFileByLines(String fileContent, String fileName) {
        if (fileContent == null || fileContent.isBlank()) {
            return List.of();
        }

        String[] lines = fileContent.split("\\r?\\n", -1);
        int totalLines = lines.length;
        List<CodeChunk> chunks = new ArrayList<>();

        int step = MAX_CHUNK_LINES - OVERLAP_LINES;
        if (step <= 0) {
            step = MAX_CHUNK_LINES;
        }

        for (int startLineIndex = 0; startLineIndex < totalLines; startLineIndex += step) {
            int endLineIndex = Math.min(startLineIndex + MAX_CHUNK_LINES, totalLines);

            StringBuilder chunkContent = new StringBuilder();
            for (int i = startLineIndex; i < endLineIndex; i++) {
                chunkContent.append(lines[i]);
                if (i < endLineIndex - 1) {
                    chunkContent.append("\n");
                }
            }

            int startLine = startLineIndex + 1;
            int endLine = endLineIndex;

            CodeChunk chunk = CodeChunk.builder()
                .filePath(fileName)
                .chunkType("CODE_CHUNK")
                .chunkName(fileName + " (lines " + startLine + "-" + endLine + ")")
                .content(chunkContent.toString())
                .startLine(startLine)
                .endLine(endLine)
                .build();

            chunks.add(chunk);

            if (endLineIndex >= totalLines) {
                break;
            }
        }

        return chunks;
    }
}
