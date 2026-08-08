package com.exaple.codeEditer.Code.Editor;

import com.exaple.codeEditer.Code.Editor.service.execution.ExecutionResult;
import com.exaple.codeEditer.Code.Editor.service.execution.Judge0ExecutionProvider;
import com.exaple.codeEditer.Code.Editor.service.execution.Judge0LanguageMapper;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@Disabled("Run manually to verify integration with the live public ce.judge0.com instance.")
public class Judge0PublicE2ETest {

    @Test
    public void testPythonExecutionOnPublicJudge0() {
        Judge0LanguageMapper mapper = new Judge0LanguageMapper();
        Judge0ExecutionProvider provider = new Judge0ExecutionProvider(mapper);
        
        ReflectionTestUtils.setField(provider, "judge0Url", "https://ce.judge0.com/submissions?wait=true&base64_encoded=true");
        ReflectionTestUtils.setField(provider, "judge0Mode", "self-hosted");
        ReflectionTestUtils.setField(provider, "judge0Key", "");
        ReflectionTestUtils.setField(provider, "judge0Host", "");
        ReflectionTestUtils.setField(provider, "connectTimeoutMs", 5000);
        ReflectionTestUtils.setField(provider, "timeoutMs", 10000);
        ReflectionTestUtils.setField(provider, "readTimeoutBufferMs", 5000);
        ReflectionTestUtils.setField(provider, "defaultMemoryLimitKb", 128000);
        ReflectionTestUtils.setField(provider, "defaultCpuTimeLimitSec", 5.0);
        
        provider.init();
        
        long start = System.currentTimeMillis();
        ExecutionResult result = provider.execute("python", "print(\"hello\")", "");
        long duration = System.currentTimeMillis() - start;
        
        System.out.println("--- Python E2E Output ---");
        System.out.println("Status: " + result.getStatus());
        System.out.println("Exit Code: " + result.getExitCode());
        System.out.println("Stdout: " + result.getStdout());
        System.out.println("Stderr: " + result.getStderr());
        System.out.println("Client-side duration: " + duration + " ms");
        System.out.println("-------------------------");
        
        assertNotNull(result);
        assertEquals("hello\n", result.getStdout());
        assertEquals(0, result.getExitCode());
        assertEquals(ExecutionResult.Status.SUCCESS, result.getStatus());
    }

    @Test
    public void testJavaExecutionOnPublicJudge0() {
        Judge0LanguageMapper mapper = new Judge0LanguageMapper();
        Judge0ExecutionProvider provider = new Judge0ExecutionProvider(mapper);
        
        ReflectionTestUtils.setField(provider, "judge0Url", "https://ce.judge0.com/submissions?wait=true&base64_encoded=true");
        ReflectionTestUtils.setField(provider, "judge0Mode", "self-hosted");
        ReflectionTestUtils.setField(provider, "judge0Key", "");
        ReflectionTestUtils.setField(provider, "judge0Host", "");
        ReflectionTestUtils.setField(provider, "connectTimeoutMs", 5000);
        ReflectionTestUtils.setField(provider, "timeoutMs", 10000);
        ReflectionTestUtils.setField(provider, "readTimeoutBufferMs", 5000);
        ReflectionTestUtils.setField(provider, "defaultMemoryLimitKb", 128000);
        ReflectionTestUtils.setField(provider, "defaultCpuTimeLimitSec", 5.0);
        
        provider.init();
        
        String javaCode = "public class Main {\n" +
                          "    public static void main(String[] args) {\n" +
                          "        System.out.println(\"Hello from Java!\");\n" +
                          "    }\n" +
                          "}";
        
        long start = System.currentTimeMillis();
        ExecutionResult result = provider.execute("java", javaCode, "");
        long duration = System.currentTimeMillis() - start;
        
        System.out.println("--- Java E2E Output ---");
        System.out.println("Status: " + result.getStatus());
        System.out.println("Exit Code: " + result.getExitCode());
        System.out.println("Stdout: " + result.getStdout());
        System.out.println("Stderr: " + result.getStderr());
        System.out.println("Client-side duration: " + duration + " ms");
        System.out.println("-------------------------");
        
        assertNotNull(result);
        assertEquals("Hello from Java!\n", result.getStdout());
        assertEquals(0, result.getExitCode());
        assertEquals(ExecutionResult.Status.SUCCESS, result.getStatus());
    }
}
