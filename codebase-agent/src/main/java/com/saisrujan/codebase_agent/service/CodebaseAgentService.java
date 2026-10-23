package com.saisrujan.codebase_agent.service;

import com.saisrujan.codebase_agent.dto.AskResponse;
import com.saisrujan.codebase_agent.dto.Source;
import com.saisrujan.codebase_agent.entity.CodeChunk;
import com.saisrujan.codebase_agent.repository.CodeChunkRepository;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.ai.vectorstore.VectorStore;

@Service
public class CodebaseAgentService {

    private final CodeChunkRepository codeChunkRepository;
    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    private final JdbcTemplate jdbcTemplate;

    public CodebaseAgentService(CodeChunkRepository codeChunkRepository, VectorStore vectorStore, ChatClient chatClient, JdbcTemplate jdbcTemplate) {
        this.codeChunkRepository = codeChunkRepository;
        this.vectorStore = vectorStore;
        this.chatClient = chatClient;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public void clearAllData() {
        codeChunkRepository.deleteAll();
        try {
            jdbcTemplate.execute("TRUNCATE TABLE vector_store");
            System.out.println("Cleared previous vector_store and code_chunk database entries.");
        } catch (Exception e) {
            System.err.println("Could not truncate vector_store table: " + e.getMessage());
        }
    }

    public long getChunksCount() {
        return codeChunkRepository.count();
    }

    /**
     * Ingestion / Upload Process:
     * Saves relational data to standard tables, then creates a vector embedding
     * referencing the relational ID in its metadata.
     */
    @Transactional
    public CodeChunk ingestCodeChunk(String filePath, String chunkType, String chunkName, String content, int startLine, int endLine) {
        boolean exists = codeChunkRepository
        .existsByFilePathAndStartLineAndEndLine(
                filePath,
                startLine,
                endLine
        );

if (exists) {
    System.out.println("Skipping duplicate chunk: "
            + filePath
            + " lines "
            + startLine
            + "-" 
            + endLine);

    return null;
}
        // Step 1: Save relational data in JPA
        CodeChunk codeChunk = CodeChunk.builder()
                .filePath(filePath)
                .chunkType(chunkType)
                .chunkName(chunkName)
                .content(content)
                .startLine(startLine)
                .endLine(endLine)
                .build();
        
        CodeChunk savedChunk = codeChunkRepository.save(codeChunk);
        
        // Step 2: Create a Spring AI Document with file header and relational ID in metadata
        Map<String, Object> metadata = Map.of(
            "code_chunk_id", savedChunk.getId(),
            "file_path", filePath,
            "chunk_type", chunkType,
            "chunk_name", chunkName
        );
        
        String embeddingContent = "File: " + filePath + "\nLines: " + startLine + "-" + endLine + "\n" + content;
        Document document = new Document(embeddingContent, metadata);
        
        // Step 3: Add to VectorStore (will invoke Gemini embedding API and save it)
        vectorStore.add(List.of(document));

        return savedChunk;
    }

    /**
     * Batch Ingestion:
     * Saves chunks to PostgreSQL in batch, groups documents into batches of 25,
     * and sends to Gemini with rate-limit pacing and exponential backoff retry.
     */
    @Transactional
    public List<CodeChunk> ingestCodeChunksBatch(List<CodeChunk> chunks) {
        if (chunks == null || chunks.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Save all relational code chunk entities in batch
        List<CodeChunk> savedChunks = codeChunkRepository.saveAll(chunks);

        // 2. Build Spring AI Document list
        List<Document> documents = new ArrayList<>(savedChunks.size());
        for (CodeChunk chunk : savedChunks) {
            Map<String, Object> metadata = Map.of(
                    "code_chunk_id", chunk.getId(),
                    "file_path", chunk.getFilePath(),
                    "chunk_type", chunk.getChunkType() != null ? chunk.getChunkType() : "CODE_CHUNK",
                    "chunk_name", chunk.getChunkName() != null ? chunk.getChunkName() : ""
            );

            String embeddingContent = "File: " + chunk.getFilePath() + "\nLines: " + chunk.getStartLine() + "-" + chunk.getEndLine() + "\n" + chunk.getContent();
            documents.add(new Document(embeddingContent, metadata));
        }

        // 3. Batch vector embeddings (25 documents per Gemini API call)
        int batchSize = 25;
        int totalBatches = (int) Math.ceil((double) documents.size() / batchSize);
        System.out.println("Embedding " + documents.size() + " documents in " + totalBatches + " batch(es) of max " + batchSize + "...");

        for (int i = 0; i < documents.size(); i += batchSize) {
            int end = Math.min(i + batchSize, documents.size());
            List<Document> batch = documents.subList(i, end);
            int currentBatchNum = (i / batchSize) + 1;
            System.out.println("Processing embedding batch " + currentBatchNum + "/" + totalBatches + " (" + batch.size() + " chunks)...");
            addDocumentsWithRetry(batch);
        }

        return savedChunks;
    }

    private void addDocumentsWithRetry(List<Document> batch) {
        int maxRetries = 5;
        long waitTimeMs = 3000;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                vectorStore.add(batch);
                // Slight throttle delay to stay comfortably under Gemini free tier RPM limit
                Thread.sleep(400);
                return;
            } catch (Exception e) {
                boolean isQuota = isQuotaOrRateLimitError(e);
                if (isQuota && attempt < maxRetries) {
                    System.err.println("Gemini rate limit (429) hit. Pausing for " + (waitTimeMs / 1000) + "s before retry (Attempt " + attempt + "/" + maxRetries + ")...");
                    try {
                        Thread.sleep(waitTimeMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Thread interrupted during rate limit backoff", ie);
                    }
                    waitTimeMs *= 2; // Exponential backoff: 3s -> 6s -> 12s -> 24s
                } else {
                    throw new RuntimeException("Vector store embedding failed: " + e.getMessage(), e);
                }
            }
        }
    }

    private boolean isQuotaOrRateLimitError(Throwable throwable) {
        if (throwable == null) return false;
        String msg = String.valueOf(throwable.getMessage()).toLowerCase();
        if (msg.contains("429") || msg.contains("503") || msg.contains("resource_exhausted") || msg.contains("quota") || msg.contains("rate limit") || msg.contains("too many requests") || msg.contains("high demand") || msg.contains("unavailable")) {
            return true;
        }
        return isQuotaOrRateLimitError(throwable.getCause());
    }

    /**
     * Search / Query Process:
     * Does a vector similarity search, extracts referenced IDs from metadata,
     * and fetches original entities from the relational database.
     */
    public List<CodeChunk> searchCodeChunks(String queryText, int topK) {
        SearchRequest searchRequest = SearchRequest.builder()
                .query(queryText)
                .topK(topK)
                .build();
        List<Document> documents = vectorStore.similaritySearch(searchRequest);
        
        if (documents.isEmpty()) {
            return Collections.emptyList();
        }

        // Step 2: Extract referenced relational IDs from metadata
        List<Long> relationalIds = documents.stream()
                .map(doc -> doc.getMetadata().get("code_chunk_id"))
                .filter(Objects::nonNull)
                .map(id -> Long.valueOf(id.toString()))
                .toList();
        
        if (relationalIds.isEmpty()) {
            return Collections.emptyList();
        }

        // Step 3: Retrieve full relational data from JPA Repository
        List<CodeChunk> chunks = codeChunkRepository.findAllById(relationalIds);
        
        // Step 4: Re-sort chunks to match the vector similarity ranking order
        Map<Long, CodeChunk> chunkMap = chunks.stream()
                .collect(Collectors.toMap(CodeChunk::getId, Function.identity()));
        
        return relationalIds.stream()
                .map(chunkMap::get)
                .filter(Objects::nonNull)
                .toList();
    }

        public AskResponse askQuestion(String question) {

    // 1. Retrieve relevant code chunks (top 5 for broader context)
    List<CodeChunk> results = searchCodeChunks(question, 5);

    // 2. Build context for Gemini
    StringBuilder context = new StringBuilder();

    for (CodeChunk chunk : results) {

        context.append("\n--- SOURCE ---\n");

        context.append("File: ")
                .append(chunk.getFilePath())
                .append("\n");

        context.append("Lines: ")
                .append(chunk.getStartLine())
                .append("-")
                .append(chunk.getEndLine())
                .append("\n");

        context.append("Code:\n")
                .append(chunk.getContent())
                .append("\n");
    }

    // 3. Build RAG prompt
    String prompt = """
            You are a codebase question-answering assistant.

            Answer the user's question using ONLY the provided code context.

            Explain the answer clearly and concisely.

            IMPORTANT:
            - Do not invent files, classes, methods, or code.
            - Do not generate a Sources section.
            - Do not generate file paths or line numbers.
            - The application will attach the source citations separately.
            - If the provided context does not contain enough information
              to answer the question, clearly say so.

            User question:
            %s

            Code context:
            %s
            """.formatted(question, context);

    // 4. Ask Gemini with automatic retry for transient 503/429 errors
    String answer = null;
    int maxRetries = 3;
    long backoffMs = 1500;

    for (int attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            answer = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();
            break;
        } catch (Exception e) {
            if (isQuotaOrRateLimitError(e) && attempt < maxRetries) {
                System.err.println("Gemini 503/429 transient error on attempt " + attempt + "/" + maxRetries + ". Retrying in " + (backoffMs / 1000.0) + "s...");
                try {
                    Thread.sleep(backoffMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Thread interrupted during retry", ie);
                }
                backoffMs *= 2;
            } else {
                throw e;
            }
        }
    }

    // 5. Build deterministic sources from retrieved chunks
    List<Source> sources = results.stream()
            .map(chunk -> new Source(
                    chunk.getId(),
                    chunk.getFilePath(),
                    chunk.getStartLine(),
                    chunk.getEndLine()
            ))
            .toList();

    // 6. Return structured response
    return new AskResponse(answer, sources);
}
}
