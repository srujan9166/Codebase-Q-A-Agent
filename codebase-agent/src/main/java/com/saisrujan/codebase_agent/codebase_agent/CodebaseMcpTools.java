package com.saisrujan.codebase_agent.codebase_agent;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import com.saisrujan.codebase_agent.service.CodebaseAgentService;

@Component 
public class CodebaseMcpTools {

    private final CodebaseAgentService codebaseAgentService;

    public CodebaseMcpTools(@Lazy CodebaseAgentService codebaseAgentService) {
        this.codebaseAgentService = codebaseAgentService;
    }

        /**
     * The description tells the AI WHEN and HOW to use this tool.
     */
    @Tool(description = "Search the indexed repository vector store for code snippets related to a user query")
    public String searchCodebase(
            @ToolParam(description = "The technical query, keyword, or concept to search for") String query,
            @ToolParam(description = "Number of matching chunks to retrieve (e.g., 5)") int topK) {
        
        // This reuses your existing vectorStore.similaritySearch in CodebaseAgentService!
        var results = codebaseAgentService.searchCodeChunks(query, topK);
        
        // Return results as a formatted string for the AI to read
        return results.toString();
    }

}
