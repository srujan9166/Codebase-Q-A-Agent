package com.saisrujan.codebase_agent;

import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.saisrujan.codebase_agent.codebase_agent.CodebaseMcpTools;

@SpringBootApplication
public class CodebaseAgentApplication {

	public static void main(String[] args) {
		SpringApplication.run(CodebaseAgentApplication.class, args);
	}
	/**
     * Registers CodebaseMcpTools with Spring AI's MCP Server
     */
    @Bean
    public ToolCallbackProvider codebaseTools(CodebaseMcpTools codebaseMcpTools) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(codebaseMcpTools)
                .build();
    }


	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {
				registry.addMapping("/**")
						.allowedOrigins("*")
						.allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
						.allowedHeaders("*");
			}
		};
	}

}
