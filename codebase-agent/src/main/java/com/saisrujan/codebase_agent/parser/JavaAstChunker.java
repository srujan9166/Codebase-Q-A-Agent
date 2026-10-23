package com.saisrujan.codebase_agent.parser;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.PackageDeclaration;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.ConstructorDeclaration;
import com.github.javaparser.ast.body.EnumDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.RecordDeclaration;
import com.github.javaparser.ast.body.TypeDeclaration;
import com.saisrujan.codebase_agent.entity.CodeChunk;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class JavaAstChunker {

    private final CodeChunker lineChunker;

    public JavaAstChunker(CodeChunker lineChunker) {
        this.lineChunker = lineChunker;
    }

    /**
     * Chunks a file. If the file is a Java file, uses JavaParser AST to create
     * semantic chunks (Class headers, Methods, Constructors).
     * If parsing fails or the file is not Java, falls back to line-based chunking.
     */
    public List<CodeChunk> chunkFile(String fileContent, String filePath) {
        if (fileContent == null || fileContent.isBlank()) {
            return List.of();
        }

        // Only parse with AST if it is a Java file
        if (filePath == null || !filePath.toLowerCase().endsWith(".java")) {
            return lineChunker.chunkFileByLines(fileContent, filePath);
        }

        try {
            CompilationUnit cu = StaticJavaParser.parse(fileContent);
            List<CodeChunk> chunks = extractSemanticChunks(cu, fileContent, filePath);

            // If AST found nothing (e.g. empty class), fallback to line chunker
            if (chunks.isEmpty()) {
                return lineChunker.chunkFileByLines(fileContent, filePath);
            }

            return chunks;
        } catch (Exception ex) {
            System.err.println("AST parsing failed for " + filePath + " (" + ex.getMessage() + "), falling back to line chunker.");
            return lineChunker.chunkFileByLines(fileContent, filePath);
        }
    }

    private List<CodeChunk> extractSemanticChunks(CompilationUnit cu, String fileContent, String filePath) {
        List<CodeChunk> chunks = new ArrayList<>();

        Optional<PackageDeclaration> pkg = cu.getPackageDeclaration();
        String packageName = pkg.map(PackageDeclaration::getNameAsString).orElse("default");

        for (TypeDeclaration<?> type : cu.getTypes()) {
            String typeName = type.getNameAsString();
            int typeStartLine = type.getRange().map(r -> r.begin.line).orElse(1);
            int typeEndLine = type.getRange().map(r -> r.end.line).orElse(1);

            // 1. Create a Class / Interface / Enum Header Chunk
            StringBuilder headerContent = new StringBuilder();
            headerContent.append("// Package: ").append(packageName).append("\n");
            type.getComment().ifPresent(comment -> headerContent.append(comment.toString()).append("\n"));
            type.getAnnotations().forEach(ann -> headerContent.append(ann.toString()).append("\n"));

            String kind = "CLASS";
            if (type.isClassOrInterfaceDeclaration()) {
                kind = type.asClassOrInterfaceDeclaration().isInterface() ? "INTERFACE" : "CLASS";
            } else if (type.isEnumDeclaration()) {
                kind = "ENUM";
            } else if (type.isRecordDeclaration()) {
                kind = "RECORD";
            }

            headerContent.append("public ").append(kind.toLowerCase()).append(" ").append(typeName);
            if (type.isClassOrInterfaceDeclaration()) {
                ClassOrInterfaceDeclaration cid = type.asClassOrInterfaceDeclaration();
                if (!cid.getExtendedTypes().isEmpty()) {
                    headerContent.append(" extends ").append(cid.getExtendedTypes());
                }
                if (!cid.getImplementedTypes().isEmpty()) {
                    headerContent.append(" implements ").append(cid.getImplementedTypes());
                }
            }
            headerContent.append(" {\n    // [Class level declarations and fields]\n}");

            chunks.add(CodeChunk.builder()
                    .filePath(filePath)
                    .chunkType(kind + "_HEADER")
                    .chunkName(typeName + " (" + kind + ")")
                    .content(headerContent.toString())
                    .startLine(typeStartLine)
                    .endLine(Math.min(typeStartLine + 30, typeEndLine))
                    .build());

            // 2. Extract Constructors
            for (ConstructorDeclaration constructor : type.getConstructors()) {
                int start = constructor.getRange().map(r -> r.begin.line).orElse(typeStartLine);
                int end = constructor.getRange().map(r -> r.end.line).orElse(typeEndLine);

                chunks.add(CodeChunk.builder()
                        .filePath(filePath)
                        .chunkType("CONSTRUCTOR")
                        .chunkName(typeName + "." + constructor.getNameAsString() + " (Constructor)")
                        .content(constructor.toString())
                        .startLine(start)
                        .endLine(end)
                        .build());
            }

            // 3. Extract Methods
            for (MethodDeclaration method : type.getMethods()) {
                int start = method.getRange().map(r -> r.begin.line).orElse(typeStartLine);
                int end = method.getRange().map(r -> r.end.line).orElse(typeEndLine);

                chunks.add(CodeChunk.builder()
                        .filePath(filePath)
                        .chunkType("METHOD")
                        .chunkName(typeName + "." + method.getNameAsString() + "()")
                        .content(method.toString())
                        .startLine(start)
                        .endLine(end)
                        .build());
            }

            // If class has no methods or constructors (like simple DTOs or Entities), also capture the full class
            if (type.getMethods().isEmpty() && type.getConstructors().isEmpty()) {
                chunks.add(CodeChunk.builder()
                        .filePath(filePath)
                        .chunkType(kind)
                        .chunkName(typeName + " (Full " + kind + ")")
                        .content(type.toString())
                        .startLine(typeStartLine)
                        .endLine(typeEndLine)
                        .build());
            }
        }

        return chunks;
    }
}
