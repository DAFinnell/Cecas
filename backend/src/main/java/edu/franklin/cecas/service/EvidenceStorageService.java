package edu.franklin.cecas.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import edu.franklin.cecas.exception.EvidenceUploadException;

@Service
public class EvidenceStorageService {
    private static final long MAX_BYTES = 10L * 1024L * 1024L;
    private static final Logger log = LoggerFactory.getLogger(EvidenceStorageService.class);

    @Value("${app.upload-dir}")
    private String uploadDir;

    public String saveEvidence(Integer requestId, MultipartFile file) {
        validateBasic(file);

        EvidenceType type = detectType(file);
        String fileName = UUID.randomUUID() + "." + type.extension();
        Path relativePath = Path.of("evidence", "request-" + requestId, fileName);
        Path destination = Path.of(uploadDir).resolve(relativePath).normalize();

        try {
            Files.createDirectories(destination.getParent());
            file.transferTo(destination);
            return relativePath.toString().replace('\\', '/');
        } catch (IOException ex) {
            throw new EvidenceUploadException("Evidence file could not be saved.");
        }
    }

    public void deleteIfExists(String relativePath) {
        try {
            Files.deleteIfExists(Path.of(uploadDir).resolve(relativePath).normalize());
        } catch (IOException ex) {
            log.warn("Failed to clean up evidence file after failed upload transaction: {}", relativePath, ex);
        }
    }

    private void validateBasic(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new EvidenceUploadException("Evidence file is required.");
        }

        if (file.getSize() > MAX_BYTES) {
            throw new EvidenceUploadException("Evidence file must be 10MB or smaller.");
        }
    }

    private EvidenceType detectType(MultipartFile file) {
        byte[] header = new byte[8];

        try (InputStream input = file.getInputStream()) {
            int read = input.read(header);
            if (read < 4) {
                throw new EvidenceUploadException("Evidence file type is not supported.");
            }
        } catch (IOException ex) {
            throw new EvidenceUploadException("Evidence file could not be read.");
        }

        if (header[0] == '%' && header[1] == 'P' && header[2] == 'D' && header[3] == 'F') {
            return EvidenceType.PDF;
        }

        if ((header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF) {
            return EvidenceType.JPG;
        }

        byte[] png = new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        if (Arrays.equals(header, png)) {
            return EvidenceType.PNG;
        }

        throw new EvidenceUploadException("Evidence file must be a PDF, JPG, or PNG.");
    }

    private enum EvidenceType {
        PDF("pdf"),
        JPG("jpg"),
        PNG("png");

        private final String extension;

        EvidenceType(String extension) {
            this.extension = extension;
        }

        String extension() {
            return extension;
        }
    }

}
