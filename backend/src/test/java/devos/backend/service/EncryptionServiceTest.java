package devos.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class EncryptionServiceTest {

    private EncryptionService encryptionService;

    @BeforeEach
    void setUp() {
        encryptionService = new EncryptionService("test-master-key-longer-than-32-chars-for-safety");
    }

    @Test
    void testEncryptDecrypt() {
        String originalText = "Hello Developer OS!";
        String encrypted = encryptionService.encrypt(originalText);
        
        System.out.println("Encrypted: " + encrypted);
        assertNotNull(encrypted);
        assertNotEquals(originalText, encrypted);
        
        String decrypted = encryptionService.decrypt(encrypted);
        assertEquals(originalText, decrypted);
    }

    @Test
    void testDifferentIVs() {
        String originalText = "Same text, different cipher";
        String encrypted1 = encryptionService.encrypt(originalText);
        String encrypted2 = encryptionService.encrypt(originalText);
        
        // GCM should use a different IV for each encryption, resulting in different cipher text
        assertNotEquals(encrypted1, encrypted2);
        
        assertEquals(originalText, encryptionService.decrypt(encrypted1));
        assertEquals(originalText, encryptionService.decrypt(encrypted2));
    }
}
