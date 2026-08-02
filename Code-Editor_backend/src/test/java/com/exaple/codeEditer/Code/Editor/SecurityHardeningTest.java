package com.exaple.codeEditer.Code.Editor;

import com.exaple.codeEditer.Code.Editor.util.FileSecurityUtils;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.io.File;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class SecurityHardeningTest {

    @Test
    public void testPathTraversalDetection() {
        File baseDir = new File(System.getProperty("java.io.tmpdir"));
        assertThrows(SecurityException.class, () -> {
            FileSecurityUtils.validatePathTraversal(baseDir, "../../../etc/passwd");
        });
    }

    @Test
    public void testSvgSanitization() {
        String unsafeSvg = "<svg><script>alert('xss')</script><rect onclick=\"alert('hack')\"/></svg>";
        String cleanSvg = FileSecurityUtils.sanitizeSvg(unsafeSvg);
        assertNotNull(cleanSvg);
        assertFalse(cleanSvg.contains("<script>"));
        assertFalse(cleanSvg.contains("onclick="));
    }
}
