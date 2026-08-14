package com.mediflow.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mediflow.dto.AIAppointmentAssistResponse;
import com.mediflow.dto.AIConsultationSummaryRequest;
import com.mediflow.dto.AIDocumentSummaryRequest;
import com.mediflow.entity.Department;
import com.mediflow.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiAIService implements AIService {

    private final DepartmentRepository departmentRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${mediflow.ai.api-key:}")
    private String apiKey;

    @Value("${mediflow.ai.model:gemini-1.5-flash}")
    private String modelName;

    @Override
    public String generateConsultationSummary(AIConsultationSummaryRequest request) {
        if (!StringUtils.hasText(apiKey)) {
            log.info("AI API Key not configured. Using local rule-based consultation summarizer fallback.");
            return generateLocalConsultationSummary(request);
        }

        try {
            String prompt = String.format(
                    "You are a medical documentation assistant. Summarize this consultation concisely for patient record history:\n" +
                    "Symptoms: %s\nObservations: %s\nDiagnosis: %s\nTreatment Plan: %s\n" +
                    "Provide a professional 2-4 sentence clinical summary.",
                    request.getSymptoms(), request.getObservations(), request.getDiagnosis(), request.getTreatmentNotes());

            return callGeminiApi(prompt);
        } catch (Exception e) {
            log.warn("Gemini API call failed: {}. Falling back to local summarizer.", e.getMessage());
            return generateLocalConsultationSummary(request);
        }
    }

    @Override
    public String summarizeMedicalDocument(AIDocumentSummaryRequest request) {
        if (!StringUtils.hasText(apiKey)) {
            log.info("AI API Key not configured. Using local document summarizer fallback.");
            return generateLocalDocumentSummary(request);
        }

        try {
            String prompt = String.format(
                    "Summarize the following %s medical document concisely for healthcare provider review:\n\n%s",
                    Optional.ofNullable(request.getDocumentType()).orElse("General"),
                    request.getDocumentContent());

            return callGeminiApi(prompt);
        } catch (Exception e) {
            log.warn("Gemini API call failed: {}. Falling back to local document summarizer.", e.getMessage());
            return generateLocalDocumentSummary(request);
        }
    }

    @Override
    public AIAppointmentAssistResponse parseAppointmentIntent(String query) {
        String lowerQuery = query.toLowerCase();
        List<Department> departments = departmentRepository.findAll();

        String matchedDeptName = "General Medicine";
        Long matchedDeptId = 5L;

        for (Department dept : departments) {
            if (lowerQuery.contains(dept.getName().toLowerCase()) || lowerQuery.contains(dept.getCode().toLowerCase())) {
                matchedDeptName = dept.getName();
                matchedDeptId = dept.getId();
                break;
            }
        }

        LocalDate targetDate = LocalDate.now().plusDays(1);
        if (lowerQuery.contains("today")) {
            targetDate = LocalDate.now();
        } else if (lowerQuery.contains("next week")) {
            targetDate = LocalDate.now().plusWeeks(1);
        } else if (lowerQuery.contains("monday")) {
            targetDate = LocalDate.now().plusDays(3);
        }

        String timeRange = "Morning (09:00 AM - 12:00 PM)";
        if (lowerQuery.contains("afternoon") || lowerQuery.contains("pm")) {
            timeRange = "Afternoon (02:00 PM - 05:00 PM)";
        }

        return AIAppointmentAssistResponse.builder()
                .extractedDepartment(matchedDeptName)
                .departmentId(matchedDeptId)
                .extractedDate(targetDate)
                .extractedTimeRange(timeRange)
                .availableSlots(Collections.emptyList())
                .build();
    }

    private String callGeminiApi(String promptText) {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelName, apiKey);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = Map.of("text", promptText);
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> body = Map.of("contents", List.of(parts));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            try {
                JsonNode rootNode = objectMapper.readTree(response.getBody());
                JsonNode candidatesNode = rootNode.path("candidates");
                if (candidatesNode.isArray() && !candidatesNode.isEmpty()) {
                    JsonNode textNode = candidatesNode.get(0).path("content").path("parts").get(0).path("text");
                    return textNode.asText();
                }
            } catch (Exception e) {
                log.error("Failed to parse Gemini response JSON", e);
            }
        }
        throw new RuntimeException("Gemini API call failed with status: " + response.getStatusCode());
    }

    private String generateLocalConsultationSummary(AIConsultationSummaryRequest req) {
        StringBuilder sb = new StringBuilder();
        sb.append("Clinical Consultation Summary:\n");
        if (StringUtils.hasText(req.getDiagnosis())) {
            sb.append("• Primary Diagnosis: ").append(req.getDiagnosis()).append("\n");
        }
        if (StringUtils.hasText(req.getSymptoms())) {
            sb.append("• Presenting Symptoms: ").append(req.getSymptoms()).append("\n");
        }
        if (StringUtils.hasText(req.getTreatmentNotes())) {
            sb.append("• Recommended Treatment: ").append(req.getTreatmentNotes()).append("\n");
        }
        sb.append("Note: Auto-generated structured clinical summary (Offline mode).");
        return sb.toString();
    }

    private String generateLocalDocumentSummary(AIDocumentSummaryRequest req) {
        String content = req.getDocumentContent();
        String summaryText = content.length() > 300 ? content.substring(0, 300) + "..." : content;
        return "[Document Summary (" + Optional.ofNullable(req.getDocumentType()).orElse("General") + ")]:\n" + summaryText;
    }
}
