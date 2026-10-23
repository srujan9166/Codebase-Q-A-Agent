package com.saisrujan.codebase_agent.service;

import com.saisrujan.codebase_agent.dto.IngestionResponse;
import com.saisrujan.codebase_agent.entity.CodeChunk;
import com.saisrujan.codebase_agent.parser.FileReaderService;
import com.saisrujan.codebase_agent.parser.FileScannerService;
import com.saisrujan.codebase_agent.parser.JavaAstChunker;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
public class CodebaseIngestionService {

    private final FileScannerService fileScannerService;
    private final FileReaderService fileReaderService;
    private final JavaAstChunker javaAstChunker;
    private final CodebaseAgentService codebaseAgentService;

    public CodebaseIngestionService(
            FileScannerService fileScannerService,
            FileReaderService fileReaderService,
            JavaAstChunker javaAstChunker,
            CodebaseAgentService codebaseAgentService) {

        this.fileScannerService = fileScannerService;
        this.fileReaderService = fileReaderService;
        this.javaAstChunker = javaAstChunker;
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

            // 4. Convert file into AST chunks
            List<CodeChunk> chunks =
                    javaAstChunker.chunkFile(
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

    public IngestionResponse ingestProjectWithSummary(Path projectPath) throws IOException {
        // Clear previous codebase chunks & embeddings before ingesting new codebase
        codebaseAgentService.clearAllData();

        List<Path> files = fileScannerService.scan(projectPath);
        
        int filesDiscovered = files.size();
        int filesProcessed = 0;
        int chunksGenerated = 0;
        int chunksInserted = 0;
        int duplicatesSkipped = 0;

        List<CodeChunk> allChunks = new ArrayList<>();

        for (Path file : files) {
            filesProcessed++;
            String content = fileReaderService.read(file);
            
            Path relativePath = projectPath.relativize(file);
            String displayFilePath = relativePath.toString().replace('\\', '/');

            List<CodeChunk> chunks = javaAstChunker.chunkFile(content, displayFilePath);
            chunksGenerated += chunks.size();
            allChunks.addAll(chunks);
        }

        System.out.println("Total files processed: " + filesProcessed + ", total chunks: " + chunksGenerated + ". Starting batch embedding...");

        // Ingest all chunks in efficient batches with retry & backoff
        List<CodeChunk> savedChunks = codebaseAgentService.ingestCodeChunksBatch(allChunks);
        chunksInserted = savedChunks.size();
        duplicatesSkipped = chunksGenerated - chunksInserted;

        return IngestionResponse.builder()
                .status("COMPLETED")
                .filesDiscovered(filesDiscovered)
                .filesProcessed(filesProcessed)
                .chunksGenerated(chunksGenerated)
                .chunksInserted(chunksInserted)
                .duplicatesSkipped(duplicatesSkipped)
                .message("Codebase ingestion completed successfully")
                .build();
    }
}
