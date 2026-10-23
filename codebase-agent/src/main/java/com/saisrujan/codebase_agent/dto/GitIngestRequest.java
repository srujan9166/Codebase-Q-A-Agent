package com.saisrujan.codebase_agent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor

public class GitIngestRequest {


    public GitIngestRequest(String repoUrl, String branch) {
        this.repoUrl = repoUrl;
        this.branch = branch;
    }
    @NotBlank(message = "Repository URL must not be blank")
    private String repoUrl;

    private String branch;
}
