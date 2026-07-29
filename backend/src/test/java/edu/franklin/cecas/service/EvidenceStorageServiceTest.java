package edu.franklin.cecas.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import edu.franklin.cecas.exception.EvidenceUploadException;
import edu.franklin.cecas.exception.ResourceNotFoundException;
import edu.franklin.cecas.service.EvidenceStorageService.StoredEvidence;

public class EvidenceStorageServiceTest {

    @TempDir
    Path uploadDir;

    private EvidenceStorageService evidenceStorageService;

    @BeforeEach
    void setUp() {
        evidenceStorageService = new EvidenceStorageService();
        ReflectionTestUtils.setField(evidenceStorageService, "uploadDir", uploadDir.toString());
    }

    private Path createStoredFile(String relativePath, byte[] content) throws IOException {
        Path filePath = uploadDir.resolve(relativePath);
        Files.createDirectories(filePath.getParent());
        Files.write(filePath, content);
        return filePath;
    }

    /**
     * Verifies that PDF files are accepted by magic bytes.
     */
    @Test
    void testSaveEvidenceAcceptsPdfMagicBytes() {
        MockMultipartFile file = new MockMultipartFile(
                "evidence",
                "proof.txt",
                "text/plain",
                "%PDF-1.7 test".getBytes(StandardCharsets.UTF_8));

        String relativePath = evidenceStorageService.saveEvidence(42, file);

        assertTrue(relativePath.startsWith("evidence/request-42/"));
        assertTrue(relativePath.endsWith(".pdf"));
        assertFalse(relativePath.startsWith(uploadDir.toString()));
        assertTrue(Files.exists(uploadDir.resolve(relativePath)));
    }

    /**
     * Verifies that JPG files are accepted by magic bytes.
     */
    @Test
    void testSaveEvidenceAcceptsJpgMagicBytes() {
        MockMultipartFile file = new MockMultipartFile(
                "evidence",
                "proof.pdf",
                "application/pdf",
                new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01});

        String relativePath = evidenceStorageService.saveEvidence(42, file);

        assertTrue(relativePath.startsWith("evidence/request-42/"));
        assertTrue(relativePath.endsWith(".jpg"));
        assertTrue(Files.exists(uploadDir.resolve(relativePath)));
    }

    /**
     * Verifies that PNG files are accepted by magic bytes.
     */
    @Test
    void testSaveEvidenceAcceptsPngMagicBytes() {
        MockMultipartFile file = new MockMultipartFile(
                "evidence",
                "proof.pdf",
                "application/pdf",
                new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A});

        String relativePath = evidenceStorageService.saveEvidence(42, file);

        assertTrue(relativePath.startsWith("evidence/request-42/"));
        assertTrue(relativePath.endsWith(".png"));
        assertTrue(Files.exists(uploadDir.resolve(relativePath)));
    }

    /**
     * Verifies that files with unsupported magic bytes fail validation.
     */
    @Test
    void testSaveEvidenceRejectsInvalidMagicBytes() {
        MockMultipartFile file = new MockMultipartFile(
                "evidence",
                "proof.pdf",
                "application/pdf",
                "not really a pdf".getBytes(StandardCharsets.UTF_8));

        EvidenceUploadException ex = assertThrows(
                EvidenceUploadException.class,
                () -> evidenceStorageService.saveEvidence(42, file));

        assertTrue(ex.getMessage().contains("PDF, JPG, or PNG"));
    }

    /**
     * Verifies that an empty evidence file fails validation.
     */
    @Test
    void testSaveEvidenceRejectsEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "evidence",
                "proof.pdf",
                "application/pdf",
                new byte[0]);

        EvidenceUploadException ex = assertThrows(
                EvidenceUploadException.class,
                () -> evidenceStorageService.saveEvidence(42, file));

        assertTrue(ex.getMessage().contains("required"));
    }

    /**
     * Verifies that an evidence file over 10 MB fails validation.
     */
    @Test
    void testSaveEvidenceRejectsOversizedFile() {
        byte[] content = new byte[(10 * 1024 * 1024) + 1];
        content[0] = '%';
        content[1] = 'P';
        content[2] = 'D';
        content[3] = 'F';

        MockMultipartFile file = new MockMultipartFile(
                "evidence",
                "proof.pdf",
                "application/pdf",
                content);

        EvidenceUploadException ex = assertThrows(
                EvidenceUploadException.class,
                () -> evidenceStorageService.saveEvidence(42, file));

        assertTrue(ex.getMessage().contains("10 MB"));
    }

    /**
     * Verifies that cleanup removes a saved evidence file.
     */
    @Test
    void testDeleteIfExistsRemovesSavedFile() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "evidence",
                "proof.pdf",
                "application/pdf",
                "%PDF-1.7 test".getBytes(StandardCharsets.UTF_8));

        String relativePath = evidenceStorageService.saveEvidence(42, file);
        Path savedFile = uploadDir.resolve(relativePath);

        assertTrue(Files.exists(savedFile));

        evidenceStorageService.deleteIfExists(relativePath);

        assertFalse(Files.exists(savedFile));
    }

    /**
     * Verifies that cleanup does not delete files outside the upload directory.
     */
    @Test
    void testDeleteIfExistsSkipsPathOutsideUploadDirectory() throws IOException {
        Path outsideFile = uploadDir.getParent().resolve("outside-evidence.pdf");
        Files.writeString(outsideFile, "outside");

        assertTrue(Files.exists(outsideFile));

        evidenceStorageService.deleteIfExists("../outside-evidence.pdf");

        assertTrue(Files.exists(outsideFile));

        Files.deleteIfExists(outsideFile);
    }

    /**
     * Verifies that a stored PDF is loaded with the expected file details and
     * contents.
     */
    @Test
    void testLoadEvidenceReturnsPdfResource() throws IOException {
        byte[] content = "%PDF-1.7 test".getBytes(StandardCharsets.UTF_8);
        String relativePath = "evidence/request-42/test.pdf";
        createStoredFile(relativePath, content);

        StoredEvidence evidence = evidenceStorageService.loadEvidence(42, relativePath);

        assertEquals(MediaType.APPLICATION_PDF, evidence.contentType());
        assertEquals("evidence-request-42.pdf", evidence.fileName());
        assertEquals(content.length, evidence.size());
        assertArrayEquals(content, evidence.resource().getInputStream().readAllBytes());
    }

    /**
     * Verifies that a stored JPG is loaded with the expected file details and
     * contents.
     */
    @Test
    void testLoadEvidenceReturnsJpgResource() throws IOException {
        byte[] content = new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, 0x01};
        String relativePath = "evidence/request-42/test.jpg";
        createStoredFile(relativePath, content);

        StoredEvidence evidence = evidenceStorageService.loadEvidence(42, relativePath);

        assertEquals(MediaType.IMAGE_JPEG, evidence.contentType());
        assertEquals("evidence-request-42.jpg", evidence.fileName());
        assertEquals(content.length, evidence.size());
        assertArrayEquals(content, evidence.resource().getInputStream().readAllBytes());
    }

    /**
     * Verifies that a stored PNG is loaded with the expected file details and
     * contents.
     */
    @Test
    void testLoadEvidenceReturnsPngResource() throws IOException {
        byte[] content = new byte[] {(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
        String relativePath = "evidence/request-42/test.png";
        createStoredFile(relativePath, content);

        StoredEvidence evidence = evidenceStorageService.loadEvidence(42, relativePath);

        assertEquals(MediaType.IMAGE_PNG, evidence.contentType());
        assertEquals("evidence-request-42.png", evidence.fileName());
        assertEquals(content.length, evidence.size());
        assertArrayEquals(content, evidence.resource().getInputStream().readAllBytes());
    }

    /**
     * Verifies that evidence cannot be loaded when no storage path is present.
     */
    @Test
    void testLoadEvidenceThrowsWhenPathIsMissing() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> evidenceStorageService.loadEvidence(42, null));

        assertThrows(
                ResourceNotFoundException.class,
                () -> evidenceStorageService.loadEvidence(42, "   "));
    }

    /**
     * Verifies that evidence cannot be loaded when the stored file is missing.
     */
    @Test
    void testLoadEvidenceThrowsWhenFileIsMissing() {
        assertThrows(
                ResourceNotFoundException.class,
                () -> evidenceStorageService.loadEvidence(42, "evidence/request-42/missing.pdf"));
    }

    /**
     * Verifies that evidence with an unsupported file extension cannot be
     * loaded.
     */
    @Test
    void testLoadEvidenceThrowsWhenFileTypeIsUnsupported() throws IOException {
        String relativePath = "evidence/request-42/test.txt";
        createStoredFile(relativePath, "not supported".getBytes(StandardCharsets.UTF_8));

        assertThrows(
                ResourceNotFoundException.class,
                () -> evidenceStorageService.loadEvidence(42, relativePath));
    }

    /**
     * Verifies that evidence paths cannot leave the configured upload
     * directory.
     */
    @Test
    void testLoadEvidenceRejectsPathOutsideUploadDirectory() throws IOException {
        Path outsideFile = Files.createTempFile(uploadDir.getParent(), "outside-evidence-", ".pdf");

        try {
            String outsidePath = uploadDir.relativize(outsideFile).toString();

            assertThrows(
                    ResourceNotFoundException.class,
                    () -> evidenceStorageService.loadEvidence(42, outsidePath));
        } finally {
            Files.deleteIfExists(outsideFile);
        }
    }

    /**
     * Verifies that a symbolic link cannot be used to load evidence outside
     * the configured upload directory.
     */
    @Test
    void testLoadEvidenceRejectsSymbolicLinkOutsideUploadDirectory() throws IOException {
        Path outsideFile = Files.createTempFile(uploadDir.getParent(), "outside-evidence-", ".pdf");
        Path linkPath = uploadDir.resolve("evidence/request-42/test.pdf");
        Files.createDirectories(linkPath.getParent());
        Files.createSymbolicLink(linkPath, outsideFile);

        try {
            assertThrows(
                    ResourceNotFoundException.class,
                    () -> evidenceStorageService.loadEvidence(42, "evidence/request-42/test.pdf"));
        } finally {
            Files.deleteIfExists(outsideFile);
        }
    }
}
