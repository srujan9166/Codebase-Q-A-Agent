
package com.saisrujan.codebase_agent.parser;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;



@Service
public class FileScannerService {

    public List<Path> scan(Path path) throws IOException{
        return Files.walk(path)
                    .filter(Files :: isRegularFile)
                    .filter(var -> var.toString().endsWith(".java"))
                    .toList();
    }

}
