package com.exaple.codeEditer.Code.Editor.service.execution;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Maps human-readable programming language identifiers and common aliases
 * to Judge0 CE standard language IDs.
 */
@Component
@Slf4j
public class Judge0LanguageMapper {

    private static final Map<String, Integer> LANGUAGE_ID_MAP;

    static {
        Map<String, Integer> map = new HashMap<>();

        // Java (OpenJDK 13.0.1)
        map.put("java", 62);

        // Python (3.8.1)
        map.put("python", 71);
        map.put("py", 71);
        map.put("python3", 71);

        // JavaScript (Node.js 12.14.0)
        map.put("javascript", 63);
        map.put("js", 63);
        map.put("node", 63);
        map.put("nodejs", 63);

        // TypeScript (3.7.4)
        map.put("typescript", 74);
        map.put("ts", 74);

        // C (GCC 9.2.0)
        map.put("c", 50);

        // C++ (GCC 9.2.0)
        map.put("cpp", 54);
        map.put("c++", 54);

        // Go (1.13.5)
        map.put("go", 60);
        map.put("golang", 60);

        // Rust (1.40.0)
        map.put("rust", 73);
        map.put("rs", 73);

        // Kotlin (1.3.70)
        map.put("kotlin", 78);
        map.put("kt", 78);

        // Swift (5.2.3)
        map.put("swift", 83);

        // C# (Mono 6.6.0.161)
        map.put("csharp", 51);
        map.put("c#", 51);
        map.put("cs", 51);

        // PHP (7.4.1)
        map.put("php", 68);

        LANGUAGE_ID_MAP = Collections.unmodifiableMap(map);
    }

    /**
     * Resolves Judge0 Language ID for a given language string.
     *
     * @param language Programming language name or alias (case-insensitive)
     * @return Judge0 language ID integer
     * @throws IllegalArgumentException if language is null or unsupported
     */
    public int getLanguageId(String language) {
        if (language == null || language.isBlank()) {
            throw new IllegalArgumentException("Language identifier cannot be empty");
        }

        String normalized = language.trim().toLowerCase();
        Integer languageId = LANGUAGE_ID_MAP.get(normalized);

        if (languageId == null) {
            log.warn("Unsupported language requested: {}", language);
            throw new IllegalArgumentException("Unsupported language: " + language + 
                    ". Supported languages: " + getSupportedLanguagesList());
        }

        return languageId;
    }

    /**
     * Checks if a given language string is supported.
     */
    public boolean isSupported(String language) {
        if (language == null || language.isBlank()) {
            return false;
        }
        return LANGUAGE_ID_MAP.containsKey(language.trim().toLowerCase());
    }

    /**
     * Returns unmodifiable map of supported language mappings.
     */
    public Map<String, Integer> getSupportedMappings() {
        return LANGUAGE_ID_MAP;
    }

    public String getSupportedLanguagesList() {
        return "java, python, javascript, typescript, c, cpp, go, rust, kotlin, swift, csharp, php";
    }
}
