package devos.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@lombok.extern.slf4j.Slf4j
public class FileUploadService {

    private final Path storageLocation;

    public FileUploadService(@Value("${app.storage.location:/Users/akila/Developer/DeveloperOS/storage/banners}") String storagePath) {
        this.storageLocation = Paths.get(storagePath).toAbsolutePath();
        log.info("Initializing FileUploadService with absolute path: {}", storageLocation);
        try {
            Files.createDirectories(storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location: " + storageLocation, e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            log.error("Attempted to store an empty file.");
            throw new RuntimeException("Failed to store empty file.");
        }
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path targetLocation = this.storageLocation.resolve(fileName);
        log.info("Storing file {} to {}", fileName, targetLocation);
        try {
            Files.copy(file.getInputStream(), targetLocation);
            log.info("File copy successful. Size: {}", Files.size(targetLocation));
            return fileName;
        } catch (IOException e) {
            log.error("IO Exception during file copy: {}", e.getMessage(), e);
            throw new RuntimeException("Could not store file " + fileName, e);
        }
    }

    public Path loadFile(String fileName) {
        return storageLocation.resolve(fileName);
    }
}
