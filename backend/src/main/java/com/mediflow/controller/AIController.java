package com.mediflow.controller;

import com.mediflow.ai.AIService;
import com.mediflow.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant", description = "Endpoints for Gemini AI consultation summaries, document summarization, and appointment search parser.")
public class AIController {

    private final AIService aiService;

    @PostMapping("/consultation-summary")
    @Operation(summary = "Generate concise clinical consultation summary from notes")
    public ResponseEntity<ApiResponse<String>> generateConsultationSummary(@Valid @RequestBody AIConsultationSummaryRequest request) {
        String summary = aiService.generateConsultationSummary(request);
        return ResponseEntity.ok(ApiResponse.success("AI consultation summary generated", summary));
    }

    @PostMapping("/document-summary")
    @Operation(summary = "Summarize medical report or discharge document text")
    public ResponseEntity<ApiResponse<String>> summarizeDocument(@Valid @RequestBody AIDocumentSummaryRequest request) {
        String summary = aiService.summarizeMedicalDocument(request);
        return ResponseEntity.ok(ApiResponse.success("Medical document summary generated", summary));
    }

    @PostMapping("/appointment-assist")
    @Operation(summary = "Parse natural language prompt into department, target date, and time slot criteria")
    public ResponseEntity<ApiResponse<AIAppointmentAssistResponse>> appointmentAssist(@Valid @RequestBody AIAppointmentAssistRequest request) {
        AIAppointmentAssistResponse response = aiService.parseAppointmentIntent(request.getQuery());
        return ResponseEntity.ok(ApiResponse.success("Natural language appointment query parsed", response));
    }
}
