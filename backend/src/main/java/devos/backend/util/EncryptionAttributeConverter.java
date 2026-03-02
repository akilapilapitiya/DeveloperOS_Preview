package devos.backend.util;

import devos.backend.service.EncryptionService;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

@Component
@Converter
public class EncryptionAttributeConverter implements AttributeConverter<String, String> {

    private final EncryptionService encryptionService;

    // Use @Lazy to avoid circular dependency if EncryptionService depends on repositories that use this converter
    public EncryptionAttributeConverter(@Lazy EncryptionService encryptionService) {
        this.encryptionService = encryptionService;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        return encryptionService.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return encryptionService.decrypt(dbData);
        } catch (Exception e) {
            // If decryption fails (e.g. data wasn't encrypted), return as is or log
            return dbData;
        }
    }
}
