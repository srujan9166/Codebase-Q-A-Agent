package com.saisrujan.codebase_agent.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "code_chunks")
public class CodeChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_path", nullable = false, columnDefinition = "text")
    private String filePath;

    @Column(name = "chunk_type", length = 50)
    private String chunkType;

    @Column(name = "chunk_name", columnDefinition = "text")
    private String chunkName;

    @Column(name = "content", nullable = false, columnDefinition = "text")
    private String content;

    @Column(name = "start_line")
    private Integer startLine;

    @Column(name = "end_line")
    private Integer endLine;

    public CodeChunk() {
    }

    public CodeChunk(Long id, String filePath, String chunkType, String chunkName, String content, Integer startLine, Integer endLine) {
        this.id = id;
        this.filePath = filePath;
        this.chunkType = chunkType;
        this.chunkName = chunkName;
        this.content = content;
        this.startLine = startLine;
        this.endLine = endLine;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getChunkType() {
        return chunkType;
    }

    public void setChunkType(String chunkType) {
        this.chunkType = chunkType;
    }

    public String getChunkName() {
        return chunkName;
    }

    public void setChunkName(String chunkName) {
        this.chunkName = chunkName;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getStartLine() {
        return startLine;
    }

    public void setStartLine(Integer startLine) {
        this.startLine = startLine;
    }

    public Integer getEndLine() {
        return endLine;
    }

    public void setEndLine(Integer endLine) {
        this.endLine = endLine;
    }



    @Override
    public String toString() {
        return "CodeChunk{" +
                "id=" + id +
                ", filePath='" + filePath + '\'' +
                ", chunkType='" + chunkType + '\'' +
                ", chunkName='" + chunkName + '\'' +
                ", content='" + content + '\'' +
                ", startLine=" + startLine +
                ", endLine=" + endLine +
                '}';
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String filePath;
        private String chunkType;
        private String chunkName;
        private String content;
        private Integer startLine;
        private Integer endLine;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder filePath(String filePath) {
            this.filePath = filePath;
            return this;
        }

        public Builder chunkType(String chunkType) {
            this.chunkType = chunkType;
            return this;
        }

        public Builder chunkName(String chunkName) {
            this.chunkName = chunkName;
            return this;
        }

        public Builder content(String content) {
            this.content = content;
            return this;
        }

        public Builder startLine(Integer startLine) {
            this.startLine = startLine;
            return this;
        }

        public Builder endLine(Integer endLine) {
            this.endLine = endLine;
            return this;
        }

        public CodeChunk build() {
            return new CodeChunk(id, filePath, chunkType, chunkName, content, startLine, endLine);
        }
    }
}
