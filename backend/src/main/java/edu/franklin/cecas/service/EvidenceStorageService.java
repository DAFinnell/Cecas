package edu.franklin.cecas.service;

import edu.franklin.cecas.exception.EvidenceUploadException;
import edu.franklin.cecas.exception.ResourceNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
        Path uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        Path destination = uploadRoot.resolve(relativePath).normalize();

        if (!destination.startsWith(uploadRoot)) {
            throw new EvidenceUploadException("Evidence file could not be saved.");
        }

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
            Path uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
            Path destination = uploadRoot.resolve(relativePath).normalize();

            if (!destination.startsWith(uploadRoot)) {
                log.warn("Skipped cleanup for evidence path outside upload directory: {}", relativePath);
                return;
            }

            Files.deleteIfExists(destination);
        } catch (IOException ex) {
            log.warn("Failed to clean up evidence file after failed upload transaction: {}", relativePath, ex);
        }
    }

    public StoredEvidence loadEvidence(Integer requestId, String relativePath) {
        if (relativePath == null || relativePath.isBlank()) {
            throw new ResourceNotFoundException("No evidence is available for this request.");
        }

        Path uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
        Path candidate = uploadRoot.resolve(relativePath).normalize();

        if (!candidate.startsWith(uploadRoot)) {
            throw new ResourceNotFoundException("Evidence file was not found.");
        }

        try {
            if (!Files.isRegularFile(candidate) || !Files.isReadable(candidate)) {
                throw new ResourceNotFoundException("Evidence file was not found.");
            }

            Path realRoot = uploadRoot.toRealPath();
            Path realFile = candidate.toRealPath();

            if (!realFile.startsWith(realRoot)) {
                throw new ResourceNotFoundException("Evidence file was not found.");
            }

            MediaType contentType = contentTypeFor(relativePath);
            String extension = extensionFor(relativePath);
            String fileName = "evidence-request-" + requestId + "." + extension;

            return new StoredEvidence(new FileSystemResource(realFile), contentType, fileName, Files.size(realFile));

        } catch (IOException ex) {
            throw new ResourceNotFoundException("Evidence file was not found.");
        }
    }

    public MediaType contentTypeFor(String relativePath) {
        return switch (extensionFor(relativePath)) {
            case "pdf" -> MediaType.APPLICATION_PDF;
            case "jpg" -> MediaType.IMAGE_JPEG;
            case "png" -> MediaType.IMAGE_PNG;
            default -> throw new ResourceNotFoundException("Evidence file type is not supported.");
        };
    }

    public String evidenceFileName(Integer requestId, String relativePath) {
        return "evidence-request-" + requestId + "." + extensionFor(relativePath);
    }

    private String extensionFor(String path) {
        int dot = path.lastIndexOf('.');

        if (dot < 0 || dot == path.length() - 1) {
            throw new ResourceNotFoundException("Evidence file type is not supported.");
        }

        return path.substring(dot + 1).toLowerCase();
    }

    private void validateBasic(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new EvidenceUploadException("Evidence file is required.");
        }

        if (file.getSize() > MAX_BYTES) {
            throw new EvidenceUploadException("Evidence file must be 10 MB or smaller.");
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

    public record StoredEvidence(Resource resource, MediaType contentType, String fileName, long size) {}

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
