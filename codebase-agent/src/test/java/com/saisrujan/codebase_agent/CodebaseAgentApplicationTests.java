package com.saisrujan.codebase_agent;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import com.saisrujan.codebase_agent.entity.CodeChunk;
import com.saisrujan.codebase_agent.repository.CodeChunkRepository;
import com.saisrujan.codebase_agent.service.CodebaseAgentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.document.Document;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ActiveProfiles("test")
@Import(TestcontainersConfiguration.class)
@SpringBootTest
class CodebaseAgentApplicationTests {

	static {
		java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("UTC"));
	}

	@Autowired
	private CodeChunkRepository codeChunkRepository;

	@Autowired
	private CodebaseAgentService codebaseAgentService;

	@MockitoBean
	private EmbeddingModel embeddingModel;

	@Test
	void contextLoads() {
	}

	@Test
	void testSaveAndRetrieveCodeChunk() {
		CodeChunk chunk = CodeChunk.builder()
				.filePath("src/main/java/App.java")
				.chunkType("class")
				.chunkName("App")
				.content("public class App {}")
				.startLine(1)
				.endLine(10)
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
	}

	@Test
	void testIngestAndSearchCodeChunkService() {
		String filePath = "src/main/java/AppService.java";
		String chunkType = "class";
		String chunkName = "AppService";
		String content = "public class AppService {}";
		int startLine = 1;
		int endLine = 10;

		// Mock the embedding model for ingestion and query search
		float[] mockVector = new float[768];
		java.util.Arrays.fill(mockVector, 0.1f);
		List<float[]> mockVectorList = List.of(mockVector);

		// Stub the 3-argument embed method used by PgVectorStore.doAdd
		when(embeddingModel.embed(any(List.class), any(), any())).thenReturn(mockVectorList);
		
		// Fallbacks for other possible embed method variants
		when(embeddingModel.embed(any(List.class))).thenReturn(mockVectorList);
		when(embeddingModel.embed(any(Document.class))).thenReturn(mockVector);
		when(embeddingModel.embed(anyString())).thenReturn(mockVector);

		codebaseAgentService.ingestCodeChunk(filePath, chunkType, chunkName, content, startLine, endLine);

		var results = codebaseAgentService.searchCodeChunks("AppService class", 1);
		assertFalse(results.isEmpty());
		assertEquals(filePath, results.get(0).getFilePath());
		assertEquals(chunkName, results.get(0).getChunkName());
	}

}
