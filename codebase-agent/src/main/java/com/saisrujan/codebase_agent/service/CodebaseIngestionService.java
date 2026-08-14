package com.saisrujan.codebase_agent.service;

import com.saisrujan.codebase_agent.entity.CodeChunk;
import com.saisrujan.codebase_agent.parser.CodeChunker;
import com.saisrujan.codebase_agent.parser.FileReaderService;
import com.saisrujan.codebase_agent.parser.FileScannerService;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@Service
public class CodebaseIngestionService {

    private final FileScannerService fileScannerService;
    private final FileReaderService fileReaderService;
    private final CodeChunker codeChunker;
    private final CodebaseAgentService codebaseAgentService;

    public CodebaseIngestionService(
            FileScannerService fileScannerService,
            FileReaderService fileReaderService,
            CodeChunker codeChunker,
            CodebaseAgentService codebaseAgentService) {

        this.fileScannerService = fileScannerService;
        this.fileReaderService = fileReaderService;
        this.codeChunker = codeChunker;
        this.codebaseAgentService = codebaseAgentService;
    }

    public void ingestProject(Path projectPath) throws IOException {

        // 1. Find all Java files
        List<Path> files = fileScannerService.scan(projectPath);

        System.out.println("Total Java files found: " + files.size());

        // 2. Process every file
        for (Path file : files) {

            System.out.println("Processing: " + file);

            // 3. Read complete file
            String content = fileReaderService.read(file);

            // 4. Convert file into chunks
            List<CodeChunk> chunks =
                    codeChunker.chunkFileByLines(
                            content,
                            file.toString()
                    );

            System.out.println("Chunks generated: " + chunks.size());

            // 5. Save every chunk
            for (CodeChunk chunk : chunks) {

                CodeChunk savedChunk =
                        codebaseAgentService.ingestCodeChunk(
                                chunk.getFilePath(),
                                chunk.getChunkType(),
                                chunk.getChunkName(),
                                chunk.getContent(),
                                chunk.getStartLine(),
                                chunk.getEndLine()
                        );

                if (savedChunk == null) {
                        System.out.println("Skipping duplicate chunk: "
                                  + chunk.getFilePath()
                                  + " lines "
                                  + chunk.getStartLine()
                                  + "-"
                                  + chunk.getEndLine());
                        continue;
                }
                System.out.println("Saved chunk ID: " + savedChunk.getId());
            }
        }
    }
}
