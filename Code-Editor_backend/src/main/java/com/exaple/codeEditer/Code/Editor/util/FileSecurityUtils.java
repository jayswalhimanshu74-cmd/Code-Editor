package com.exaple.codeEditer.Code.Editor.util;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.regex.Pattern;

public class FileSecurityUtils {

    private static final Pattern INVALID_PATH_CHARS = Pattern.compile("[\\x00-\\x1F\\x7F]|\\.\\.");
    private static final Pattern SCRIPT_TAG_PATTERN = Pattern.compile("<script[^>]*>.*?</script>", Pattern.CASE_INSENSITIVE | Pattern.DOTALL);

    public static Path validateZipPath(Path destinationDir, String entryName) throws IOException {
        if (entryName == null || INVALID_PATH_CHARS.matcher(entryName).find()) {
            throw new SecurityException("Potential Zip Slip / Path Traversal detected in entry: " + entryName);
        }
        Path destinationFilePath = destinationDir.resolve(entryName).normalize();
        if (!destinationFilePath.startsWith(destinationDir.normalize())) {
            throw new SecurityException("Zip entry targets outside of destination directory: " + entryName);
        }
        return destinationFilePath;
    }

    public static File validatePathTraversal(File baseDir, String relativePath) throws IOException {
        if (relativePath == null || relativePath.contains("..")) {
            throw new SecurityException("Path traversal attempt detected in path: " + relativePath);
        }
        File targetFile = new File(baseDir, relativePath).getCanonicalFile();
        File canonicalBase = baseDir.getCanonicalFile();
        if (!targetFile.getPath().startsWith(canonicalBase.getPath())) {
            throw new SecurityException("Path traversal attempt out of workspace directory: " + relativePath);
        }
        return targetFile;
    }

    public static String sanitizeSvg(String svgContent) {
        if (svgContent == null) return null;
        String sanitized = SCRIPT_TAG_PATTERN.matcher(svgContent).replaceAll("");
        return sanitized.replaceAll("(?i)on[a-z]+\\s*=", "disabled_event=");
    }
}
