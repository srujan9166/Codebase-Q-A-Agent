package com.saisrujan.codebase_agent;

import org.springframework.boot.SpringApplication;

public class TestCodebaseAgentApplication {

	public static void main(String[] args) {
		SpringApplication.from(CodebaseAgentApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
