package com.saisrujan.codebase_agent.parser;

import com.saisrujan.codebase_agent.entity.CodeChunk;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JavaAstChunkerTest {

    private JavaAstChunker astChunker;

    @BeforeEach
    void setUp() {
        CodeChunker lineChunker = new CodeChunker();
        astChunker = new JavaAstChunker(lineChunker);
    }

    @Test
    void testChunkJavaClassWithMethods() {
        String javaSource = """
                package com.example.demo;
                
                import org.springframework.web.bind.annotation.*;
                
                @RestController
                @RequestMapping("/api/users")
                public class UserController {
                
                    private final UserService userService;
                    
                    public UserController(UserService userService) {
                        this.userService = userService;
                    }
                    
                    @GetMapping("/{id}")
                    public User getUserById(@PathVariable Long id) {
                        return userService.findById(id);
                    }
                    
                    @PostMapping
                    public User createUser(@RequestBody User user) {
                        return userService.save(user);
                    }
                }
                """;

        List<CodeChunk> chunks = astChunker.chunkFile(javaSource, "src/main/java/com/example/demo/UserController.java");

        assertNotNull(chunks);
        assertFalse(chunks.isEmpty());

        // Should have 1 class header, 1 constructor, 2 methods = 4 chunks
        assertEquals(4, chunks.size());

        // Verify Class Header chunk
        CodeChunk classHeader = chunks.get(0);
        assertEquals("CLASS_HEADER", classHeader.getChunkType());
        assertTrue(classHeader.getContent().contains("@RestController"));
        assertTrue(classHeader.getChunkName().contains("UserController"));

        // Verify Constructor chunk
        CodeChunk constructorChunk = chunks.get(1);
        assertEquals("CONSTRUCTOR", constructorChunk.getChunkType());
        assertTrue(constructorChunk.getChunkName().contains("UserController.UserController"));

        // Verify Method chunks
        CodeChunk getMethodChunk = chunks.get(2);
        assertEquals("METHOD", getMethodChunk.getChunkType());
        assertEquals("UserController.getUserById()", getMethodChunk.getChunkName());
        assertTrue(getMethodChunk.getContent().contains("@GetMapping"));

        CodeChunk postMethodChunk = chunks.get(3);
        assertEquals("METHOD", postMethodChunk.getChunkType());
        assertEquals("UserController.createUser()", postMethodChunk.getChunkName());
        assertTrue(postMethodChunk.getContent().contains("@PostMapping"));
    }

    @Test
    void testNonJavaFileFallbackToLineChunker() {
        String cssContent = """
                .app-container {
                    display: flex;
                    color: white;
                }
                """;

        List<CodeChunk> chunks = astChunker.chunkFile(cssContent, "frontend/src/App.css");

        assertNotNull(chunks);
        assertEquals(1, chunks.size());
        assertEquals("CODE_CHUNK", chunks.get(0).getChunkType());
    }
}
