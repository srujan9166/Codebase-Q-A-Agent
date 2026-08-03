package com.saisrujan.codebase_agent.config;

import java.util.List;
import java.util.Map;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;




@Component
public class TestAI implements CommandLineRunner {
 
    private final VectorStore vectorStore;

    public TestAI(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println(
                "==============================");

        System.out.println(
                "Spring AI EmbeddingModel Loaded");

        System.out.println(
                vectorStore.getClass());

        System.out.println(
                "==============================");
                Document document =
    new Document(
        """
        public class Hello {
            public void test(){
                System.out.println("Hi");
            }
        }
        """,
        Map.of(
          "file_path",
          "Hello.java",

          "chunk_type",
          "CLASS",

          "chunk_name",
          "Hello"
        )
    );


vectorStore.add(List.of(document));
    }

}
