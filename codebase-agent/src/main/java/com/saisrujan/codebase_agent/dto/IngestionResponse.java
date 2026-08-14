package com.saisrujan.codebase_agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class IngestionResponse {
    private String status;
    private int filesDiscovered;
    private int filesProcessed;
    private int chunksGenerated;
    private int chunksInserted;
    private int duplicatesSkipped;
    private String message;
}
