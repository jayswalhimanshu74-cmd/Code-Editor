package com.exaple.codeEditer.Code.Editor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EntityScan(basePackages = "com.exaple.codeEditer.Code.Editor.entity")
@EnableJpaRepositories(basePackages = "com.exaple.codeEditer.Code.Editor.repository")
public class CodeEditorApplication {

	public static void main(String[] args) {
		SpringApplication.run(CodeEditorApplication.class, args);

	}

}
