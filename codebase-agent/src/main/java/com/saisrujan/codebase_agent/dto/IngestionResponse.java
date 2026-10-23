package com.saisrujan.codebase_agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@NoArgsConstructor
@Getter
@Setter
@Builder
public class IngestionResponse {

    public IngestionResponse(String status, int filesDiscovered, int filesProcessed, int chunksGenerated, int chunksInserted, int duplicatesSkipped, String message) {
        this.status = status;
        this.filesDiscovered = filesDiscovered;
        this.filesProcessed = filesProcessed;
        this.chunksGenerated = chunksGenerated;
        this.chunksInserted = chunksInserted;
        this.duplicatesSkipped = duplicatesSkipped;
        this.message = message;
    }
    private String status;
    private int filesDiscovered;
    private int filesProcessed;
    private int chunksGenerated;
    private int chunksInserted;
    private int duplicatesSkipped;
    private String message;
}
