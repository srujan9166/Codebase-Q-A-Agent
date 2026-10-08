package com.saisrujan.codebase_agent.parser;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

@Service
public class FileScannerService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".java", ".js", ".jsx", ".ts", ".tsx", ".py",
            ".html", ".css", ".json", ".md", ".xml", ".yaml",
            ".yml", ".sql", ".c", ".cpp", ".h", ".cs",
            ".go", ".rs", ".sh", ".properties", ".env",
            ".txt", ".feature", ".groovy", ".kt", ".kts"
    );

    private static final Set<String> IGNORED_DIRECTORIES = Set.of(
            "node_modules", ".git", "__pycache__", ".next", "vendor",
            ".idea", ".vscode"
    );

    public List<Path> scan(Path rootPath) throws IOException {
        System.out.println("Scanning directory for files: " + rootPath);
        try (Stream<Path> stream = Files.walk(rootPath)) {
            List<Path> allFiles = stream.filter(Files::isRegularFile).toList();
            System.out.println("Total raw files found in ZIP: " + allFiles.size());

            List<Path> matched = allFiles.stream()
                    .filter(p -> !isIgnoredDirectory(rootPath, p))
                    .filter(this::isSupportedExtension)
                    .toList();

            System.out.println("Total supported code files matched for ingestion: " + matched.size());
            for (Path file : matched) {
                System.out.println("  [Ingesting] -> " + rootPath.relativize(file));
            }

            if (matched.isEmpty() && !allFiles.isEmpty()) {
                System.out.println("--- Skipped Files Diagnostics ---");
                for (Path f : allFiles) {
                    Path rel = rootPath.relativize(f);
                    boolean ignoredDir = isIgnoredDirectory(rootPath, f);
                    boolean suppExt = isSupportedExtension(f);
                    System.out.println("  [Skipped] " + rel + " (IgnoredDir=" + ignoredDir + ", SupportedExt=" + suppExt + ")");
                }
            }

            return matched;
        }
    }

    private boolean isIgnoredDirectory(Path rootPath, Path file) {
        Path relativePath = rootPath.relativize(file);
        Path parent = relativePath.getParent();
        if (parent == null) {
            return false;
        }
        for (Path component : parent) {
            if (IGNORED_DIRECTORIES.contains(component.toString().toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    private boolean isSupportedExtension(Path file) {
        String fileName = file.getFileName().toString().toLowerCase();
        return ALLOWED_EXTENSIONS.stream().anyMatch(fileName::endsWith);
    }
}
