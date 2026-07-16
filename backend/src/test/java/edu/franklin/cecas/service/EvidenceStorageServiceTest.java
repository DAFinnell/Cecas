package edu.franklin.cecas.service;

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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import edu.franklin.cecas.exception.EvidenceUploadException;

public class EvidenceStorageServiceTest {

    @TempDir
    Path uploadDir;

    private EvidenceStorageService evidenceStorageService;

    @BeforeEach
    void setUp() {
        evidenceStorageService = new EvidenceStorageService();
        ReflectionTestUtils.setField(evidenceStorageService, "uploadDir", uploadDir.toString());
    }

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
}
