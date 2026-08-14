package com.saisrujan.codebase_agent.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;


@Component
public class AiTestConfig {


    public AiTestConfig(EmbeddingModel embeddingModel) {

        System.out.println(
            "=============================="
        );

        System.out.println(
            "Spring AI EmbeddingModel Loaded"
        );


        System.out.println(
            embeddingModel.getClass().getName()
        );


        System.out.println(
            "=============================="
        );
    }

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder){
        return builder.build();
    }
}
