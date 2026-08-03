package com.saisrujan.codebase_agent;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import com.saisrujan.codebase_agent.entity.CodeChunk;
import com.saisrujan.codebase_agent.repository.CodeChunkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class CodebaseAgentApplicationTests {

	static {
		java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
	}

	@Autowired
	private CodeChunkRepository codeChunkRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void testSaveAndRetrieveCodeChunk() {
		float[] embedding = new float[]{0.1f, 0.2f, 0.3f};
		CodeChunk chunk = CodeChunk.builder()
				.filePath("src/main/java/App.java")
				.chunkType("class")
				.chunkName("App")
				.content("public class App {}")
				.startLine(1)
				.endLine(10)
				.embedding(embedding)
				.build();

		CodeChunk saved = codeChunkRepository.save(chunk);
		assertNotNull(saved.getId());

		CodeChunk retrieved = codeChunkRepository.findById(saved.getId()).orElse(null);
		assertNotNull(retrieved);
		assertEquals("src/main/java/App.java", retrieved.getFilePath());
		assertEquals("class", retrieved.getChunkType());
		assertEquals("App", retrieved.getChunkName());
		assertEquals("public class App {}", retrieved.getContent());
		assertEquals(1, retrieved.getStartLine());
		assertEquals(10, retrieved.getEndLine());
		assertNotNull(retrieved.getEmbedding());
		assertArrayEquals(embedding, retrieved.getEmbedding());
	}

}
