package com.saisrujan.codebase_agent.service;

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
import org.springframework.ai.vectorstore.VectorStore;

@Service
public class CodebaseAgentService {

    private final CodeChunkRepository codeChunkRepository;
    private final VectorStore vectorStore;
   private final ChatClient chatClient;

    public CodebaseAgentService(CodeChunkRepository codeChunkRepository, VectorStore vectorStore, ChatClient chatClient) {
        this.codeChunkRepository = codeChunkRepository;
        this.vectorStore = vectorStore;
        this.chatClient = chatClient;
       
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
        
        // Step 2: Create a Spring AI Document with the relational ID in metadata
        Map<String, Object> metadata = Map.of(
            "code_chunk_id", savedChunk.getId(),
            "file_path", filePath,
            "chunk_type", chunkType,
            "chunk_name", chunkName
        );
        
        Document document = new Document(content, metadata);
        
        // Step 3: Add to VectorStore (will invoke Gemini embedding API and save it)
        vectorStore.add(List.of(document));

        return savedChunk;
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

        public String askQuestion(String question) {

                 // 1. Retrieve relevant code chunks
                List<CodeChunk> results = searchCodeChunks(question, 3);

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

            Explain the answer clearly.

            Do not invent files, classes, methods, or line numbers.

            User question:
            %s

            Code context:
            %s
            """.formatted(question, context);

            // 4. Ask Gemini
           String answer = chatClient.prompt()
        .user(prompt)
        .call()
        .content();

StringBuilder finalResponse = new StringBuilder();

finalResponse.append("AI Answer:\n");
finalResponse.append(answer);

finalResponse.append("\n\nSources:\n");

int sourceNumber = 1;

for (CodeChunk chunk : results) {

    finalResponse.append(sourceNumber++)
            .append(". ")
            .append(chunk.getFilePath())
            .append("\n");

    finalResponse.append("   Lines: ")
            .append(chunk.getStartLine())
            .append("-")
            .append(chunk.getEndLine())
            .append("\n");
}

return finalResponse.toString();
        }
}
