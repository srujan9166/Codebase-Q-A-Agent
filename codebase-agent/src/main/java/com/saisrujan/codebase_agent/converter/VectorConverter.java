package com.saisrujan.codebase_agent.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Arrays;

@Converter(autoApply = false)
public class VectorConverter implements AttributeConverter<float[], String> {

    @Override
    public String convertToDatabaseColumn(float[] attribute) {
        if (attribute == null) {
            return null;
        }
        return Arrays.toString(attribute);
    }

    @Override
    public float[] convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty() || "[]".equals(dbData.trim())) {
            return new float[0];
        }
        String cleaned = dbData.trim();
        if (cleaned.startsWith("[")) {
            cleaned = cleaned.substring(1);
        }
        if (cleaned.endsWith("]")) {
            cleaned = cleaned.substring(0, cleaned.length() - 1);
        }
        if (cleaned.isEmpty()) {
            return new float[0];
        }
        String[] parts = cleaned.split(",");
        float[] floats = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            floats[i] = Float.parseFloat(parts[i].trim());
        }
        return floats;
    }
}
