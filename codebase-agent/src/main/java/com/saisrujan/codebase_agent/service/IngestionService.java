package com.saisrujan.codebase_agent.service;

import com.saisrujan.codebase_agent.dto.IngestionResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class IngestionService {

    private final CodebaseIngestionService codebaseIngestionService;

    public IngestionService(CodebaseIngestionService codebaseIngestionService) {
        this.codebaseIngestionService = codebaseIngestionService;
    }

    public IngestionResponse ingestZip(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty.");
        }
        
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".zip")) {
            throw new IllegalArgumentException("Only ZIP files are supported.");
        }

        // 1. Create temporary directory for extraction
        Path tempDir = Files.createTempDirectory("codebase-ingest-");
        
        // 2. Create temporary file for the uploaded ZIP
        Path tempZipFile = Files.createTempFile("uploaded-", ".zip");

        try {
            // Save MultipartFile to temp ZIP file
            try (InputStream is = file.getInputStream()) {
                Files.copy(is, tempZipFile, StandardCopyOption.REPLACE_EXISTING);
            }

            // Extract ZIP content and prevent Zip Slip vulnerability
            try (InputStream is = Files.newInputStream(tempZipFile);
                 ZipInputStream zis = new ZipInputStream(is)) {
                
                ZipEntry entry;
                while ((entry = zis.getNextEntry()) != null) {
                    Path entryPath = tempDir.resolve(entry.getName()).normalize();
                    
                    // Security requirement: Prevent ZIP path traversal attacks
                    if (!entryPath.startsWith(tempDir)) {
                        throw new IOException("Security Error: ZIP entry tried to write outside target folder: " + entry.getName());
                    }
                    
                    if (entry.isDirectory()) {
                        Files.createDirectories(entryPath);
                    } else {
                        Files.createDirectories(entryPath.getParent());
                        Files.copy(zis, entryPath, StandardCopyOption.REPLACE_EXISTING);
                    }
                    zis.closeEntry();
                }
            }

            // 3. Process the codebase using the existing scanner & ingestion logic
            return codebaseIngestionService.ingestProjectWithSummary(tempDir);

        } finally {
            // 4. Clean up temporary files
            try {
                Files.deleteIfExists(tempZipFile);
            } catch (IOException e) {
                System.err.println("Could not delete temp zip file: " + e.getMessage());
            }
            deleteDirectory(tempDir);
        }
    }

    private void deleteDirectory(Path path) {
        if (path == null || !Files.exists(path)) {
            return;
        }
        try {
            Files.walk(path)
                .sorted((a, b) -> b.compareTo(a)) // Delete descendants first
                .map(Path::toFile)
                .forEach(File::delete);
        } catch (IOException e) {
            System.err.println("Failed to clean up temp directory " + path + ": " + e.getMessage());
        }
    }
}
