package com.saisrujan.codebase_agent.parser;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.stereotype.Service;

@Service
public class FileReaderService {

    public String read(Path path) throws IOException{
     return  Files.readString(path);
    }

}
