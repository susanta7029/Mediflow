package com.mediflow.ai;

import com.mediflow.dto.AIAppointmentAssistResponse;
import com.mediflow.dto.AIConsultationSummaryRequest;
import com.mediflow.dto.AIDocumentSummaryRequest;

public interface AIService {
    String generateConsultationSummary(AIConsultationSummaryRequest request);
    String summarizeMedicalDocument(AIDocumentSummaryRequest request);
    AIAppointmentAssistResponse parseAppointmentIntent(String query);
}
