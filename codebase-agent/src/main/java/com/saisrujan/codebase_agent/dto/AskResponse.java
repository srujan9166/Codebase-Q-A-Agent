package com.saisrujan.codebase_agent.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AskResponse {

    private String answer;
    private List<Source> sources;

    public AskResponse() {
    }

    public AskResponse(String answer, List<Source> sources) {
        this.answer = answer;
        this.sources = sources;
    }
}
