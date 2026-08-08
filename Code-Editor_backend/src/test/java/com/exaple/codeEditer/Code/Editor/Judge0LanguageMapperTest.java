package com.exaple.codeEditer.Code.Editor;

import com.exaple.codeEditer.Code.Editor.service.execution.Judge0LanguageMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class Judge0LanguageMapperTest {

    private Judge0LanguageMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new Judge0LanguageMapper();
    }

    @Test
    void testStandardLanguagesMapping() {
        assertEquals(62, mapper.getLanguageId("java"));
        assertEquals(71, mapper.getLanguageId("python"));
        assertEquals(63, mapper.getLanguageId("javascript"));
        assertEquals(74, mapper.getLanguageId("typescript"));
        assertEquals(50, mapper.getLanguageId("c"));
        assertEquals(54, mapper.getLanguageId("cpp"));
        assertEquals(60, mapper.getLanguageId("go"));
        assertEquals(73, mapper.getLanguageId("rust"));
        assertEquals(78, mapper.getLanguageId("kotlin"));
        assertEquals(83, mapper.getLanguageId("swift"));
        assertEquals(51, mapper.getLanguageId("csharp"));
        assertEquals(68, mapper.getLanguageId("php"));
    }

    @Test
    void testLanguageAliasesAndCaseInsensitivity() {
        assertEquals(71, mapper.getLanguageId("PyThOn3"));
        assertEquals(71, mapper.getLanguageId("py"));
        assertEquals(63, mapper.getLanguageId("JS"));
        assertEquals(63, mapper.getLanguageId("node"));
        assertEquals(54, mapper.getLanguageId("c++"));
        assertEquals(51, mapper.getLanguageId("c#"));
        assertEquals(51, mapper.getLanguageId("cs"));
        assertEquals(60, mapper.getLanguageId("golang"));
        assertEquals(73, mapper.getLanguageId("rs"));
        assertEquals(78, mapper.getLanguageId("kt"));
    }

    @Test
    void testIsSupported() {
        assertTrue(mapper.isSupported("java"));
        assertTrue(mapper.isSupported("PYTHON"));
        assertTrue(mapper.isSupported("c++"));
        assertFalse(mapper.isSupported("brainfuck"));
        assertFalse(mapper.isSupported(null));
        assertFalse(mapper.isSupported("   "));
    }

    @Test
    void testUnsupportedLanguageThrowsException() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> mapper.getLanguageId("unsupported_lang")
        );
        assertTrue(ex.getMessage().contains("Unsupported language"));
    }
}
