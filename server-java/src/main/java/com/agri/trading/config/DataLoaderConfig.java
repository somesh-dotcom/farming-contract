package com.agri.trading.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.ResourceUtils;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Configuration
public class DataLoaderConfig {

    @Value("${app.data.config-path:./config}")
    private String configPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public <T> List<T> loadData(String filename, Class<List<T>> type) throws IOException {
        File file = new File(configPath, filename);
        if (file.exists()) {
            return objectMapper.readValue(file, type);
        }
        return null;
    }

    public <T> void saveData(String filename, T data) throws IOException {
        File dir = new File(configPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        File file = new File(configPath, filename);
        objectMapper.writerWithDefaultPrettyPrinter().writeValue(file, data);
    }
}
