package com.saisrujan.codebase_agent.repository;

import com.saisrujan.codebase_agent.entity.CodeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CodeChunkRepository extends JpaRepository<CodeChunk, Long> {
}
