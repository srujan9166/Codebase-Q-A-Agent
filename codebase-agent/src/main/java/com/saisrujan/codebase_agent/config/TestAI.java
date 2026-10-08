package com.saisrujan.codebase_agent.config;

import com.saisrujan.codebase_agent.entity.CodeChunk;
import com.saisrujan.codebase_agent.service.CodebaseAgentService;
import com.saisrujan.codebase_agent.service.CodebaseIngestionService;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import org.springframework.context.annotation.Profile;

@Profile("!test")
@Component
public class TestAI implements CommandLineRunner {

    private final CodebaseAgentService codebaseAgentService;
    private final CodebaseIngestionService codebaseIngestionService;

    public TestAI(
            CodebaseAgentService codebaseAgentService,
            CodebaseIngestionService codebaseIngestionService) {

        this.codebaseAgentService = codebaseAgentService;
        this.codebaseIngestionService = codebaseIngestionService;
    }

    @Override
    public void run(String... args) throws Exception {

        // Path path = Paths.get(
        //     "C:\\Users\\user\\Downloads\\Codebase-Q-A-Agent\\codebase-agent\\src"
        // );

        // System.out.println("==============================");
        // System.out.println("Starting Codebase Ingestion");
        // System.out.println("==============================");

        // codebaseIngestionService.ingestProject(path);

        // System.out.println("==============================");
        // System.out.println("Codebase Ingestion Completed");
        // System.out.println("==============================");

        // System.out.println("==============================");
        // System.out.println("Testing Semantic Search");
        // System.out.println("==============================");

        // String query = "Where is the code that scans Java files?";

        // List<CodeChunk> results =
        //         codebaseAgentService.searchCodeChunks(query, 3);

        // System.out.println("Query: " + query);
        // System.out.println("Results found: " + results.size());

        // for (CodeChunk chunk : results) {

        //     System.out.println("--------------------------------");
        //     System.out.println("ID: " + chunk.getId());
        //     System.out.println("File: " + chunk.getFilePath());
        //     System.out.println("Lines: "
        //     + chunk.getStartLine()
        //     + "-"
        //     + chunk.getEndLine());
        //     System.out.println("Chunk: " + chunk.getChunkName());
        //     System.out.println("Content:");
        //     System.out.println(chunk.getContent());
        // }
        // System.out.println("==============================");
        // System.out.println("Testing RAG Answer");
        // System.out.println("==============================");

        // String question =
        //         "Where is the code that scans Java files and how does it work?";

        // String answer =
        //         codebaseAgentService.askQuestion(question);

        // System.out.println("Question:");
        // System.out.println(question);

        // System.out.println("\nAI Answer:");
        // System.out.println(answer);
    }
}